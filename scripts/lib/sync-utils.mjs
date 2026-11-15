// Helpers utilisés par scripts/sync-activity.mjs.

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export const DAY_MS = 86400000
export const DAYS_BACK = 363 // fenêtre glissante ~52 semaines, sous la limite de 1 an de l'API GitHub

export const GITHUB_ACTIVITY_PATH = 'data/github-activity.json'
export const GITLAB_ACTIVITY_PATH = 'data/gitlab-activity.json'

export function loadDotEnv() {
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

export function requireEnv(key) {
  const value = process.env[key]
  if (!value) throw new Error(`Variable d'environnement manquante : ${key}`)
  return value
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date, n) {
  return new Date(date.getTime() + n * DAY_MS)
}

export function formatFrenchDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Fenêtre affichée par le graphe : du lundi précédant (aujourd'hui - DAYS_BACK) jusqu'à aujourd'hui (UTC).
export function activityWindow() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  let start = addDays(today, -DAYS_BACK)
  start = addDays(start, -((start.getUTCDay() + 6) % 7))
  return { start, today, from: isoDate(start), to: isoDate(today) }
}

export async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback
  return JSON.parse(await readFile(path, 'utf8'))
}

export async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
}
