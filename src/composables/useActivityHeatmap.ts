import { computed, onMounted, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ActivityData, ActivityDay, ActivityWeek, LegendStep, MonthLabel } from '@/types'

const MONTHS: readonly string[] = [
  'jan',
  'fév',
  'mar',
  'avr',
  'mai',
  'juin',
  'juil',
  'août',
  'sep',
  'oct',
  'nov',
  'déc',
]

const DARK_STEPS: readonly string[] = ['#1a5c52', '#156a63', '#1d9187', '#24b5a8']
const LIGHT_STEPS: readonly string[] = ['#d8f4f1', '#8de2db', '#2dd2c5', '#178279']
const EMPTY_DARK = 'rgba(240,246,252,.055)'
const EMPTY_LIGHT = 'rgba(0,0,0,.05)'
const DAY_MS = 86400000

export function useActivityHeatmap() {
  // #region Data
  const theme = useThemeStore()
  const activity = ref<ActivityData | null>(null)
  // #endregion

  // #region Functions
  function cellColor(count: number): string {
    const isDark = theme.mode === 'dark'
    if (!count) return isDark ? EMPTY_DARK : EMPTY_LIGHT
    const steps = isDark ? DARK_STEPS : LIGHT_STEPS
    return steps[Math.min(3, Math.floor((count - 1) / 3))]
  }

  async function loadActivity(): Promise<void> {
    try {
      const response = await fetch('/activity.json')
      if (!response.ok) return
      activity.value = (await response.json()) as ActivityData
    } catch {
      // fichier absent : la section reste vide
    }
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
          count,
          bg: cellColor(count),
          date,
          label: `${count} contribution${count > 1 ? 's' : ''} — ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
          detail: activity.value.details?.[i] ?? null,
        })
      }
      result.push({ key: `w${w}`, days })
    }
    return result
  })

  const monthLabels = computed<MonthLabel[]>(() => {
    if (!activity.value) return []
    const start = new Date(`${activity.value.start}T00:00:00Z`)
    let lastMonth = -1
    return weeks.value.map((_week, w) => {
      const date = new Date(start.getTime() + w * 7 * DAY_MS)
      const month = date.getUTCMonth()
      let label = ''
      if (month !== lastMonth && date.getUTCDate() <= 7) {
        label = MONTHS[month]
        lastMonth = month
      }
      return { key: `m${w}`, label } satisfies MonthLabel
    })
  })

  const days = computed<ActivityDay[]>(() => weeks.value.flatMap((week) => week.days))

  const total = computed<number>(() => activity.value?.counts.reduce((sum, n) => sum + n, 0) ?? 0)

  const legendSteps = computed<LegendStep[]>(() =>
    [0, 2, 5, 8, 11].map((n, i) => ({ key: `l${i}`, bg: cellColor(n) })),
  )
  // #endregion

  // #region Lifecycles
  onMounted(loadActivity)
  // #endregion

  return { weeks, days, monthLabels, total, legendSteps }
}
