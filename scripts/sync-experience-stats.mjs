#!/usr/bin/env node
// Agrège les stats GitLab (issues fermées, commentaires en MR, MR relues) sur la période
// caldera dans data/experience-stats.json (snapshot persistant), puis régénère
// public/experience-stats.json (et dist/experience-stats.json si présent) au format
// attendu par ExperienceSection.vue.
//
// Mêmes identifiants que scripts/sync-activity.mjs (voir .env.example) : GITLAB_URL,
// GITLAB_USERNAME, GITLAB_TOKEN. Si l'accès GitLab échoue, le script s'arrête sans
// toucher aux fichiers déjà persistés — les stats affichées restent celles de la
// dernière synchronisation réussie (ou, en dernier recours, les valeurs de repli
// codées en dur dans src/data/portfolio.ts).
//
// "issues fermées" = nombre d'issues actuellement à l'état "closed" sur lesquelles
// je suis assignée (peu importe qui les a fermées) — pas le nombre de fois où j'ai
// moi-même cliqué sur "close" (ce que donnerait l'API Events, et qui sous-compte
// largement : une issue peut être fermée par quelqu'un d'autre, un merge, un bot…).
//
// "MR relues" = union dédupliquée des MR approuvées et des MR sur lesquelles un
// commentaire a été laissé (deux signaux distincts côté API GitLab Events, pas de
// notion unique de "review").
//
// Usage : node scripts/sync-experience-stats.mjs
// Cron (VPS) : 0 5 * * * cd /path/to/portfolio && node scripts/sync-experience-stats.mjs >> sync.log 2>&1

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const DAY_MS = 86400000

// Début de chaque période à agréger (contractor + salariée confondus pour caldera).
// Doit rester aligné avec le rôle le plus ancien du groupe correspondant dans
// src/data/portfolio.ts.
const ORGS = {
  caldera: { since: '2022-09-01' },
}

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

function parseNextLink(linkHeader) {
  if (!linkHeader) return null
  for (const part of linkHeader.split(',')) {
    const [urlPart, relPart] = part.split(';').map((s) => s.trim())
    if (relPart === 'rel="next"') return urlPart.slice(1, -1)
  }
  return null
}
// #endregion

// #region GitLab
async function lookupUserId({ baseUrl, headers, username }) {
  const res = await fetch(`${baseUrl}/api/v4/users?username=${encodeURIComponent(username)}`, {
    headers,
  })
  if (!res.ok) throw new Error(`authentification GitLab échouée (${res.status})`)
  const [user] = await res.json()
  if (!user) throw new Error(`utilisateur GitLab introuvable : ${username}`)
  return user.id
}

// Compte les issues actuellement fermées où l'utilisateur du token est assignée,
// tous projets confondus (scope=assigned_to_me est résolu côté GitLab par rapport
// au token, indépendamment de `since`/`until`).
async function fetchClosedAssignedIssuesCount({ baseUrl, headers }) {
  let count = 0
  let url = `${baseUrl}/api/v4/issues?scope=assigned_to_me&state=closed&per_page=100`
  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`récupération des issues GitLab échouée (${res.status})`)
    const issues = await res.json()
    count += issues.length
    url = parseNextLink(res.headers.get('link'))
  }
  return count
}

async function fetchMergeRequestStats({ baseUrl, headers, userId, since, until }) {
  let mrComments = 0
  const reviewedMrIds = new Set()

  // Marge d'un jour de chaque côté : `after`/`before` sont exclusifs côté GitLab.
  const after = isoDate(addDays(new Date(`${since}T00:00:00Z`), -1))
  const before = isoDate(addDays(new Date(`${until}T00:00:00Z`), 1))

  let url = `${baseUrl}/api/v4/users/${userId}/events?after=${after}&before=${before}&per_page=100`
  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`récupération des events GitLab échouée (${res.status})`)
    const events = await res.json()
    for (const event of events) {
      if (event.action_name === 'approved' && event.target_type === 'MergeRequest') {
        reviewedMrIds.add(event.target_id)
        continue
      }
      const isNote = event.target_type === 'Note' || event.target_type === 'DiffNote'
      if (isNote && event.note?.noteable_type === 'MergeRequest') {
        mrComments += 1
        reviewedMrIds.add(event.note.noteable_id)
      }
    }
    url = parseNextLink(res.headers.get('link'))
  }

  return { mrComments, mrReviewed: reviewedMrIds.size }
}
// #endregion

async function main() {
  loadDotEnv()

  const baseUrl = requireEnv('GITLAB_URL')
  const token = requireEnv('GITLAB_TOKEN')
  const username = requireEnv('GITLAB_USERNAME')
  const headers = { 'PRIVATE-TOKEN': token }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const until = isoDate(today)
  const updated = formatFrenchDate(today)

  const userId = await lookupUserId({ baseUrl, headers, username })

  const snapshot = {}
  for (const [org, { since }] of Object.entries(ORGS)) {
    console.log(`GitLab : agrégation des stats "${org}" pour ${username} (${since} → ${until})…`)
    const issuesClosed = await fetchClosedAssignedIssuesCount({ baseUrl, headers })
    const { mrComments, mrReviewed } = await fetchMergeRequestStats({
      baseUrl,
      headers,
      userId,
      since,
      until,
    })
    snapshot[org] = { issuesClosed, mrComments, mrReviewed, updated }
    console.log(
      `  ${org} : ${issuesClosed} issues fermées, ${mrComments} commentaires en MR, ${mrReviewed} MR relues.`,
    )
  }

  await writeJson('data/experience-stats.json', snapshot)
  await writeJson('public/experience-stats.json', snapshot)
  if (existsSync('dist')) await writeJson('dist/experience-stats.json', snapshot)

  console.log('OK — stats d’expérience synchronisées.')
}

main().catch((err) => {
  console.error(`Échec de la synchronisation : ${err.message}`)
  process.exit(1)
})
