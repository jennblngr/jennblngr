#!/usr/bin/env node
// Récupère l'activité GitHub (perso) dans data/github-activity.json, un historique persistant
// append-only ({ days: { "YYYY-MM-DD": count } }), puis génère public/activity.json (et
// dist/activity.json si présent) au format attendu par ActivitySection.vue, en additionnant
// l'activité GitLab déjà présente dans data/gitlab-activity.json.
//
// data/gitlab-activity.json n'est jamais écrit ici : il est alimenté par le projet GitLab
// d'entreprise "portfolio-activity-sync" (script sync-gitlab-activity.mjs). S'il n'est plus mis à
// jour, les jours GitLab déjà persistés restent figés et le graphe continue avec GitHub.
//
// Lancé par .github/workflows/deploy.yml avant chaque build (push sur main + cron quotidien).
//
// Variables d'environnement (voir .env.example) :
//   GITHUB_USERNAME   identifiant GitHub perso
//   GITHUB_TOKEN      PAT GitHub, scope minimal (lecture profil) — secret CONTRIBUTIONS_READ_TOKEN en CI
//
// Usage : node scripts/sync-activity.mjs

import { existsSync } from 'node:fs'
import {
  GITHUB_ACTIVITY_PATH,
  GITLAB_ACTIVITY_PATH,
  activityWindow,
  addDays,
  formatFrenchDate,
  isoDate,
  loadDotEnv,
  readJson,
  requireEnv,
  writeJson,
} from './lib/sync-utils.mjs'

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
    for (const day of week.contributionDays) map.set(day.date, day.contributionCount)
  }
  return map
}

async function main() {
  loadDotEnv()

  const username = requireEnv('GITHUB_USERNAME')
  const token = requireEnv('GITHUB_TOKEN')
  const { start, today, from, to } = activityWindow()

  console.log(`GitHub : récupération de ${username} (${from} → ${to})…`)
  const fetched = await fetchGithubCalendar({
    username,
    token,
    from: `${from}T00:00:00Z`,
    to: `${to}T23:59:59Z`,
  })

  const github = await readJson(GITHUB_ACTIVITY_PATH, { days: {} })
  for (const [date, count] of fetched) github.days[date] = count
  github.days = Object.fromEntries(Object.entries(github.days).sort(([a], [b]) => (a < b ? -1 : 1)))
  await writeJson(GITHUB_ACTIVITY_PATH, github)

  const gitlab = await readJson(GITLAB_ACTIVITY_PATH, { days: {} })
  const hasGitlabHistory = Object.values(gitlab.days).some((d) => d.count > 0)
  const source = hasGitlabHistory ? 'GitHub + GitLab' : 'GitHub'

  const counts = []
  const details = []
  for (let d = start; d <= today; d = addDays(d, 1)) {
    const date = isoDate(d)
    const githubCount = github.days[date]
    const gitlabDay = gitlab.days[date]
    counts.push((githubCount ?? 0) + (gitlabDay?.count ?? 0))
    details.push(
      githubCount === undefined && gitlabDay === undefined
        ? null
        : {
            github: githubCount ?? 0,
            gitlab: gitlabDay?.count ?? 0,
            gitlabByType: gitlabDay?.byType,
          },
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
