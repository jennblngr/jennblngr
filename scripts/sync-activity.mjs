#!/usr/bin/env node
// Agrège l'activité GitHub (perso) + GitLab (entreprise) dans data/activity-history.json,
// un historique persistant append-only, puis régénère public/activity.json (et dist/activity.json
// si présent) au format attendu par ActivitySection.vue.
//
// Le principe : GitLab n'est interrogé que si GITLAB_URL/GITLAB_USERNAME/GITLAB_TOKEN sont
// tous fournis et valides. Si l'accès est perdu un jour, le script continue avec GitHub seul
// et NE TOUCHE PAS aux jours GitLab déjà persistés dans l'historique — ils restent figés
// indéfiniment.
//
// Variables d'environnement (voir .env.example) :
//   GITHUB_USERNAME   (obligatoire) identifiant GitHub perso
//   GITHUB_TOKEN      (obligatoire) PAT GitHub, scope minimal (lecture profil)
//   GITLAB_URL        (optionnel)   ex. https://gitlab.mon-entreprise.com
//   GITLAB_USERNAME   (optionnel)   identifiant GitLab, peut différer de GITHUB_USERNAME
//   GITLAB_TOKEN      (optionnel)   PAT GitLab, scope "read_api"
//
// Usage : node scripts/sync-activity.mjs
// Cron (VPS) : 0 4 * * * cd /path/to/portfolio && node scripts/sync-activity.mjs >> sync.log 2>&1

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const DAY_MS = 86400000
const HISTORY_PATH = 'data/activity-history.json'
const DAYS_BACK = 363 // fenêtre glissante ~52 semaines, sous la limite de 1 an de l'API GitHub

// #region Helpers
function loadDotEnv() {
  if (!existsSync('.env')) return
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1)
    if (!(key in process.env)) process.env[key] = value
  }
}

function requireEnv(key) {
  const value = process.env[key]
  if (!value) throw new Error(`Variable d'environnement manquante : ${key}`)
  return value
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, n) {
  return new Date(date.getTime() + n * DAY_MS)
}

function formatFrenchDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
}

async function loadHistory() {
  if (!existsSync(HISTORY_PATH)) return { days: {} }
  return JSON.parse(await readFile(HISTORY_PATH, 'utf8'))
}
// #endregion

// #region GitHub
async function fetchGithubCalendar({ username, token, from, to }) {
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
  `
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-activity-sync',
    },
    body: JSON.stringify({ query, variables: { login: username, from, to } }),
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} : ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GitHub API : ${JSON.stringify(json.errors)}`)

  const map = new Map()
  for (const week of json.data.user.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      map.set(day.date, day.contributionCount)
    }
  }
  return map
}
// #endregion

// #region GitLab
function parseNextLink(linkHeader) {
  if (!linkHeader) return null
  for (const part of linkHeader.split(',')) {
    const [urlPart, relPart] = part.split(';').map((s) => s.trim())
    if (relPart === 'rel="next"') return urlPart.slice(1, -1)
  }
  return null
}

// Réduit les combinaisons action_name/target_type de l'API events GitLab
// à quelques catégories lisibles pour le tooltip du graphe.
function categorizeGitlabEvent(event) {
  if (event.action_name === 'pushed to' || event.action_name === 'pushed new') return 'push'
  if (event.target_type === 'Note' || event.target_type === 'DiffNote') return 'commentaire'
  if (event.target_type === 'MergeRequest') return 'merge_request'
  if (event.target_type === 'Issue') return 'issue'
  return 'autre'
}

async function fetchGitlabCalendar({ baseUrl, token, username, from, to }) {
  const headers = { 'PRIVATE-TOKEN': token }
  const lookupRes = await fetch(
    `${baseUrl}/api/v4/users?username=${encodeURIComponent(username)}`,
    {
      headers,
    },
  )
  if (!lookupRes.ok) throw new Error(`authentification GitLab échouée (${lookupRes.status})`)
  const [user] = await lookupRes.json()
  if (!user) throw new Error(`utilisateur GitLab introuvable : ${username}`)

  // Marge d'un jour de chaque côté : `after`/`before` sont exclusifs côté GitLab.
  const after = isoDate(addDays(new Date(`${from}T00:00:00Z`), -1))
  const before = isoDate(addDays(new Date(`${to}T00:00:00Z`), 1))

  const counts = new Map()
  const byType = new Map()
  let url = `${baseUrl}/api/v4/users/${user.id}/events?after=${after}&before=${before}&per_page=100`
  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`récupération des events GitLab échouée (${res.status})`)
    const events = await res.json()
    for (const event of events) {
      const date = event.created_at.slice(0, 10)
      if (date < from || date > to) continue
      counts.set(date, (counts.get(date) ?? 0) + 1)

      const category = categorizeGitlabEvent(event)
      const dayTypes = byType.get(date) ?? {}
      dayTypes[category] = (dayTypes[category] ?? 0) + 1
      byType.set(date, dayTypes)
    }
    url = parseNextLink(res.headers.get('link'))
  }
  return { counts, byType }
}
// #endregion

async function main() {
  loadDotEnv()

  const githubUsername = requireEnv('GITHUB_USERNAME')
  const githubToken = requireEnv('GITHUB_TOKEN')
  const gitlabUrl = process.env.GITLAB_URL
  const gitlabToken = process.env.GITLAB_TOKEN
  const gitlabUsername = process.env.GITLAB_USERNAME

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  let start = addDays(today, -DAYS_BACK)
  start = addDays(start, -((start.getUTCDay() + 6) % 7)) // recule jusqu'au lundi précédent
  const from = isoDate(start)
  const to = isoDate(today)

  const history = await loadHistory()

  console.log(`GitHub : récupération de ${githubUsername} (${from} → ${to})…`)
  const githubMap = await fetchGithubCalendar({
    username: githubUsername,
    token: githubToken,
    from: `${from}T00:00:00Z`,
    to: `${to}T23:59:59Z`,
  })
  for (const [date, count] of githubMap) {
    history.days[date] = { ...history.days[date], github: count }
  }

  if (gitlabUrl && gitlabToken && gitlabUsername) {
    try {
      console.log(`GitLab : récupération des events de ${gitlabUsername} (${from} → ${to})…`)
      const { counts: gitlabMap, byType: gitlabByTypeMap } = await fetchGitlabCalendar({
        baseUrl: gitlabUrl,
        token: gitlabToken,
        username: gitlabUsername,
        from,
        to,
      })
      for (const [date, count] of gitlabMap) {
        history.days[date] = {
          ...history.days[date],
          gitlab: count,
          gitlabByType: gitlabByTypeMap.get(date) ?? {},
        }
      }
    } catch (err) {
      const detail = err.cause?.message ?? err.message
      console.warn(
        `GitLab ignoré (${detail}). L'historique GitLab déjà persisté est conservé tel quel.`,
      )
    }
  } else {
    console.log(
      'GITLAB_URL / GITLAB_USERNAME / GITLAB_TOKEN absents — synchronisation GitLab ignorée.',
    )
  }

  await writeJson(HISTORY_PATH, history)

  const hasGitlabHistory = Object.values(history.days).some((d) => (d.gitlab ?? 0) > 0)
  const source = hasGitlabHistory ? 'GitHub + GitLab' : 'GitHub'

  const counts = []
  const details = []
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const entry = history.days[isoDate(d)]
    counts.push((entry?.github ?? 0) + (entry?.gitlab ?? 0))
    details.push(
      entry
        ? { github: entry.github ?? 0, gitlab: entry.gitlab ?? 0, gitlabByType: entry.gitlabByType }
        : null,
    )
  }

  const activityData = { start: from, counts, details, updated: formatFrenchDate(today), source }

  await writeJson('public/activity.json', activityData)
  if (existsSync('dist')) await writeJson('dist/activity.json', activityData)

  console.log(
    `OK — ${counts.reduce((a, b) => a + b, 0)} contributions sur ${counts.length} jours (source: ${source}).`,
  )
}

main().catch((err) => {
  console.error(`Échec de la synchronisation : ${err.message}`)
  process.exit(1)
})
