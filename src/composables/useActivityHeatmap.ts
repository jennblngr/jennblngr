import { computed, onMounted, ref } from 'vue'
import type { ActivityData, ActivityDay, ActivityWeek } from '@/types'

const DAY_MS = 86400000

/** Bornes basses des niveaux 1 à 4 (0 = aucune contribution). */
const LEVEL_THRESHOLDS: readonly number[] = [1, 6, 13, 23]

export const LEVEL_COUNT = LEVEL_THRESHOLDS.length + 1

const DAY_LABEL = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const MONTH_LABEL = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function levelFor(count: number): number {
  let level = 0
  LEVEL_THRESHOLDS.forEach((threshold, i) => {
    if (count >= threshold) level = i + 1
  })
  return level
}

/** Numéro de semaine ISO 8601. */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart) / DAY_MS + 1) / 7)
}

export function useActivityHeatmap() {
  // #region Data
  const activity = ref<ActivityData | null>(null)
  // #endregion

  // #region Functions
  async function loadActivity(): Promise<void> {
    try {
      const response = await fetch('/activity.json')
      if (!response.ok) return
      activity.value = (await response.json()) as ActivityData
    } catch {
      // fichier absent : la section reste vide
    }
  }

  /** Nombre de jours actifs consécutifs se terminant sur ce jour. */
  function streakAt(index: number): number {
    const counts = activity.value?.counts ?? []
    let streak = 0
    for (let i = index; i >= 0 && counts[i] > 0; i--) streak++
    return streak
  }

  /** Vrai si ce jour est le plus actif de sa semaine (colonne). */
  function isTopOfWeek(day: ActivityDay): boolean {
    if (!day.count) return false
    const week = weeks.value[day.week]
    return day.count === Math.max(...week.days.map((d) => d.count))
  }
  // #endregion

  // #region Computed
  const weeks = computed<ActivityWeek[]>(() => {
    if (!activity.value) return []
    const start = new Date(`${activity.value.start}T00:00:00Z`)
    const counts = activity.value.counts
    const result: ActivityWeek[] = []
    for (let w = 0; w * 7 < counts.length; w++) {
      const days: ActivityDay[] = []
      for (let d = 0; d < 7; d++) {
        const i = w * 7 + d
        if (i >= counts.length) break
        const date = new Date(start.getTime() + i * DAY_MS)
        const count = counts[i]
        days.push({
          key: `d${i}`,
          index: i,
          week: w,
          weekday: d,
          count,
          level: levelFor(count),
          date,
          label: `${count} contribution${count > 1 ? 's' : ''} le ${DAY_LABEL.format(date)}`,
          detail: activity.value.details?.[i] ?? null,
        })
      }
      result.push({ key: `w${w}`, days })
    }
    return result
  })

  const total = computed<number>(() => activity.value?.counts.reduce((sum, n) => sum + n, 0) ?? 0)

  const sourceTotals = computed(() => {
    const details = activity.value?.details ?? []
    return details.reduce<{ gitlab: number; github: number }>(
      (acc, detail) => {
        acc.gitlab += detail?.gitlab ?? 0
        acc.github += detail?.github ?? 0
        return acc
      },
      { gitlab: 0, github: 0 },
    )
  })

  const updated = computed<string>(() => activity.value?.updated ?? '')

  const rangeLabel = computed<string>(() => {
    const first = weeks.value[0]?.days[0]
    const lastWeek = weeks.value[weeks.value.length - 1]
    const last = lastWeek?.days[lastWeek.days.length - 1]
    if (!first || !last) return ''
    return `${MONTH_LABEL.format(first.date)} → ${MONTH_LABEL.format(last.date)}`
  })
  // #endregion

  // #region Lifecycles
  onMounted(loadActivity)
  // #endregion

  return { weeks, total, sourceTotals, updated, rangeLabel, streakAt, isTopOfWeek }
}
