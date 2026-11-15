#!/usr/bin/env node
// Récupère l'activité GitLab (entreprise) et la fusionne dans data/gitlab-activity.json,
// un historique persistant append-only : { days: { "YYYY-MM-DD": { count, byType } } }.
//
// Seuls des compteurs journaliers sortent du GitLab (nombre d'events par jour, ventilés
// par catégorie) — aucun nom de projet, titre ou contenu.
//
// Lancé par le pipeline planifié du projet GitLab "portfolio-activity-sync", qui pousse
// ensuite le fichier sur GitHub. Le workflow GitHub (deploy.yml) le fusionne avec
// l'activité GitHub pour produire public/activity.json (voir scripts/sync-activity.mjs).
//
// Échoue (exit 1) si GitLab est injoignable ou si le token est invalide : le pipeline
// GitLab passe en échec et envoie une notification, l'historique existant reste intact.
//
// Variables d'environnement (voir .env.example) : GITLAB_URL, GITLAB_USERNAME, GITLAB_TOKEN.
//
// Usage : node scripts/sync-gitlab-activity.mjs

import {
  GITLAB_ACTIVITY_PATH,
  activityWindow,
  addDays,
  isoDate,
  loadDotEnv,
  parseNextLink,
  readJson,
  requireEnv,
  writeJson,
} from './lib/sync-utils.mjs'

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
    { headers },
  )
  if (!lookupRes.ok) throw new Error(`authentification GitLab échouée (${lookupRes.status})`)
  const [user] = await lookupRes.json()
  if (!user) throw new Error(`utilisateur GitLab introuvable : ${username}`)

  // Marge d'un jour de chaque côté : `after`/`before` sont exclusifs côté GitLab.
  const after = isoDate(addDays(new Date(`${from}T00:00:00Z`), -1))
  const before = isoDate(addDays(new Date(`${to}T00:00:00Z`), 1))

  const days = new Map()
  let url = `${baseUrl}/api/v4/users/${user.id}/events?after=${after}&before=${before}&per_page=100`
  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`récupération des events GitLab échouée (${res.status})`)
    for (const event of await res.json()) {
      const date = event.created_at.slice(0, 10)
      if (date < from || date > to) continue
      const day = days.get(date) ?? { count: 0, byType: {} }
      const category = categorizeGitlabEvent(event)
      day.count += 1
      day.byType[category] = (day.byType[category] ?? 0) + 1
      days.set(date, day)
    }
    url = parseNextLink(res.headers.get('link'))
  }
  return days
}

async function main() {
  loadDotEnv()

  const baseUrl = requireEnv('GITLAB_URL')
  const token = requireEnv('GITLAB_TOKEN')
  const username = requireEnv('GITLAB_USERNAME')
  const { from, to } = activityWindow()

  console.log(`GitLab : récupération des events de ${username} (${from} → ${to})…`)
  const fetched = await fetchGitlabCalendar({ baseUrl, token, username, from, to })

  const history = await readJson(GITLAB_ACTIVITY_PATH, { days: {} })
  for (const [date, day] of fetched) history.days[date] = day
  history.days = Object.fromEntries(
    Object.entries(history.days).sort(([a], [b]) => (a < b ? -1 : 1)),
  )
  await writeJson(GITLAB_ACTIVITY_PATH, history)

  const total = [...fetched.values()].reduce((sum, d) => sum + d.count, 0)
  console.log(`OK — ${total} events GitLab sur ${fetched.size} jours actifs.`)
}

main().catch((err) => {
  console.error(`Échec de la synchronisation GitLab : ${err.cause?.message ?? err.message}`)
  process.exit(1)
})
