import type { YearMonth } from '@/types'

const MONTHS_SHORT: readonly string[] = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
]

function parse(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number)
  return { year, month: month - 1 }
}

/** Nombre de mois écoulés entre `start` et `end` (ou le mois courant). */
export function monthsBetween(start: YearMonth, end?: YearMonth, now = new Date()): number {
  const from = parse(start)
  const to = end ? parse(end) : { year: now.getFullYear(), month: now.getMonth() }
  return Math.max(0, (to.year - from.year) * 12 + (to.month - from.month))
}

/** « 4 ans 2 mois », « 1 an », « 8 mois ». */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years) parts.push(`${years} an${years > 1 ? 's' : ''}`)
  if (rest || !years) parts.push(`${rest} mois`)
  return parts.join(' ')
}

/** « sept. 2022 » */
export function formatYearMonth(value: YearMonth): string {
  const { year, month } = parse(value)
  return `${MONTHS_SHORT[month]} ${year}`
}

/** « sept. 2022 — présent » */
export function formatPeriod(start: YearMonth, end?: YearMonth): string {
  return `${formatYearMonth(start)} — ${end ? formatYearMonth(end) : 'présent'}`
}
