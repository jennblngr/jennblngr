#!/usr/bin/env node
// Compte, pour chaque techno détectable, le nombre de dépôts GitHub perso qui l'utilisent, et
// écrit public/skills.json (et dist/skills.json si présent), lu par SkillsSection.vue.
//
// Source : dépôts dont l'utilisateur est propriétaire, hors forks, visibles avec le jeton
// (les dépôts privés ne comptent que si le jeton y a accès). Détection :
//   - dépendances du package.json racine (dependencies, devDependencies, peerDependencies) ;
//   - présence d'un .gitlab-ci.yml à la racine pour « gitlab ci ».
// Les technos non détectables de façon fiable (node, npm, git, figma…) ne sont pas comptées.
//
// Garde-fou : si le jeton ne voit aucun dépôt privé alors que la synchro précédente en voyait,
// le fichier n'est pas réécrit (sinon les chiffres chuteraient), et une alerte sort dans la CI.
//
// Lancé par .github/workflows/deploy.yml, après scripts/sync-activity.mjs.
//
// Variables d'environnement : GITHUB_USERNAME, GITHUB_TOKEN (voir .env.example).
//
// Usage : node scripts/sync-skills.mjs

import { existsSync } from 'node:fs'
import { formatFrenchDate, loadDotEnv, readJson, requireEnv, writeJson } from './lib/sync-utils.mjs'

const SKILLS_PATH = 'public/skills.json'

/** Techno (nom affiché dans les Skills) → paquets npm qui la signalent. */
const PACKAGE_RULES = {
  'vue.js': ['vue', 'nuxt'],
  typescript: ['typescript', 'vue-tsc'],
  electron: ['electron'],
  tailwind: ['tailwindcss', '@tailwindcss/vite', '@tailwindcss/postcss'],
  vite: ['vite'],
  pinia: ['pinia'],
  vitest: ['vitest'],
  eslint: ['eslint'],
  prettier: ['prettier'],
}

const GITLAB_CI_SKILL = 'gitlab ci'

async function fetchRepositories({ username, token }) {
  const query = `
    query($login: String!, $after: String) {
      user(login: $login) {
        repositories(first: 50, after: $after, ownerAffiliations: OWNER, isFork: false) {
          pageInfo { hasNextPage endCursor }
          nodes {
            name
            isPrivate
            packageJson: object(expression: "HEAD:package.json") { ... on Blob { text } }
            gitlabCi: object(expression: "HEAD:.gitlab-ci.yml") { __typename }
          }
        }
      }
    }
  `
  const repos = []
  let after = null
  do {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-activity-sync',
      },
      body: JSON.stringify({ query, variables: { login: username, after } }),
    })
    if (!res.ok) throw new Error(`GitHub API ${res.status} : ${await res.text()}`)
    const json = await res.json()
    if (json.errors) throw new Error(`GitHub API : ${JSON.stringify(json.errors)}`)

    const page = json.data.user.repositories
    repos.push(...page.nodes)
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (after)
  return repos
}

function dependenciesOf(repo) {
  const text = repo.packageJson?.text
  if (!text) return new Set()
  try {
    const pkg = JSON.parse(text)
    return new Set(
      [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies].flatMap((deps) =>
        Object.keys(deps ?? {}),
      ),
    )
  } catch {
    console.warn(`  package.json illisible dans ${repo.name}, ignoré`)
    return new Set()
  }
}

async function main() {
  loadDotEnv()

  const username = requireEnv('GITHUB_USERNAME')
  const token = requireEnv('GITHUB_TOKEN')

  console.log(`Skills : lecture des dépôts GitHub de ${username}…`)
  const repos = await fetchRepositories({ username, token })

  const counts = Object.fromEntries(
    [...Object.keys(PACKAGE_RULES), GITLAB_CI_SKILL].map((skill) => [skill, 0]),
  )
  for (const repo of repos) {
    const deps = dependenciesOf(repo)
    for (const [skill, packages] of Object.entries(PACKAGE_RULES)) {
      if (packages.some((name) => deps.has(name))) counts[skill]++
    }
    if (repo.gitlabCi) counts[GITLAB_CI_SKILL]++
  }

  const privateCount = repos.filter((repo) => repo.isPrivate).length
  console.log(`  ${repos.length} dépôts lus, dont ${privateCount} privés.`)
  const previous = await readJson(SKILLS_PATH, null)

  // Jeton sans accès aux dépôts privés : les chiffres seraient incomplets, on garde les précédents
  if (privateCount === 0 && previous?.privateRepositories > 0) {
    console.warn(
      `::warning::Le jeton GitHub ne voit aucun dépôt privé (${previous.privateRepositories} lors de ` +
        `la dernière synchro) : public/skills.json n'est pas mis à jour. Donner au jeton l'accès en ` +
        `lecture au contenu des dépôts (scope "repo", ou "Contents: read" sur tous les dépôts).`,
    )
    return
  }

  // Chiffres inchangés : on garde le fichier tel quel pour éviter un commit quotidien vide
  const unchanged =
    previous?.repositories === repos.length &&
    previous?.privateRepositories === privateCount &&
    JSON.stringify(previous?.counts) === JSON.stringify(counts)
  if (unchanged) {
    console.log(`OK — ${repos.length} dépôts analysés, chiffres inchangés.`)
    return
  }

  const skillsData = {
    updated: formatFrenchDate(new Date()),
    source: 'GitHub',
    repositories: repos.length,
    privateRepositories: privateCount,
    counts,
  }

  await writeJson(SKILLS_PATH, skillsData)
  if (existsSync('dist')) await writeJson('dist/skills.json', skillsData)

  console.log(`OK — ${repos.length} dépôts analysés.`)
  for (const [skill, n] of Object.entries(counts)) console.log(`  ${skill.padEnd(12)} ${n}`)
}

main().catch((err) => {
  console.error(`Échec de la synchronisation des skills : ${err.message}`)
  process.exit(1)
})
