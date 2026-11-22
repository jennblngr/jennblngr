import type { IconName } from '@/data/icons'

export type ThemeMode = 'dark' | 'light'

/** Mois au format `YYYY-MM`. */
export type YearMonth = `${number}-${number}`

export interface ExperienceRole {
  title: string
  start: YearMonth
  /** Absent = poste en cours. */
  end?: YearMonth
  bullets?: string[]
  summary?: string
}

export interface ExperienceStats {
  issuesClosed: number
  mrComments: number
  mrReviewed: number
}

export interface ExperienceGroup {
  /** Clé utilisée par experience-stats.json. */
  org: string
  name: string
  initial: string
  tone: 'plain' | 'sage'
  start: YearMonth
  end?: YearMonth
  roles: ExperienceRole[]
  stats?: ExperienceStats
}

export interface ExperienceStatsSnapshot extends ExperienceStats {
  updated: string
}

export type ExperienceStatsPayload = Record<string, ExperienceStatsSnapshot>

export type ProjectType = 'web' | 'mobile' | 'pwa' | 'script'

export interface ProjectItem {
  slug: string
  /** Titre affiché (casse normale). */
  name: string
  type: ProjectType
  year: string
  desc: string
  did: string[]
  /** Liste complète ; la carte n'affiche que les 3 premières. */
  stack: string[]
  url: string
  /** Libellé du lien principal (VOIR LE SITE, OUVRIR L'APP…). */
  primaryLabel: string
  repo?: string
  image?: string
  gallery?: string[]
  /** Lignes de terminal affichées à la place d'une capture (type script). */
  terminal?: string[]
}

export interface SectionLink {
  id: string
  label: string
}

export interface SocialLink {
  label: string
  href: string
  icon: IconName
}

export interface SkillEntry {
  name: string
  /** Nombre de projets où la techno a été utilisée (absent pour les pratiques). */
  projects?: number
  favorite?: boolean
}

export interface SkillCategory {
  title: string
  letter: string
  tone: 'plain' | 'sage'
  /** Unité affichée à droite du titre (« projets ») ; absente = pas de chiffre par ligne. */
  unit?: string
  items: SkillEntry[]
}

export interface SkillCountsData {
  updated: string
  source: string
  repositories: number
  /** Techno (nom affiché) → nombre de dépôts qui l'utilisent. */
  counts: Record<string, number>
}

export interface ActivityDayDetail {
  github: number
  gitlab: number
  gitlabByType?: Record<string, number>
}

export interface ActivityData {
  start: string
  counts: readonly number[]
  details?: readonly (ActivityDayDetail | null)[]
  updated: string
  source: string
}

export interface ActivityDay {
  key: string
  /** Index du jour depuis le début de la période. */
  index: number
  week: number
  weekday: number
  count: number
  level: number
  date: Date
  label: string
  detail: ActivityDayDetail | null
}

export interface ActivityWeek {
  key: string
  days: ActivityDay[]
}
