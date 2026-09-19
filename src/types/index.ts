import type { IconName } from '@/data/icons'

export type ThemeMode = 'dark' | 'light'

export interface ExperienceRole {
  period: string
  role: string
  bullets: string[]
}

export interface ExperienceStats {
  issuesClosed: number
  mrComments: number
  mrReviewed: number
}

export interface ExperienceGroup {
  org: string
  roles: ExperienceRole[]
  stats?: ExperienceStats
}

export interface ExperienceStatsSnapshot extends ExperienceStats {
  updated: string
}

export type ExperienceStatsPayload = Record<string, ExperienceStatsSnapshot>

export interface ProjectItem {
  name: string
  desc: string
  year: string
  stack: string[]
  url: string
  image?: string
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
  icon: IconName
  label: string
}

export interface SkillCategory {
  title: string
  items: SkillEntry[]
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
  count: number
  bg: string
  date: Date
  label: string
  detail: ActivityDayDetail | null
}

export interface ActivityWeek {
  key: string
  days: ActivityDay[]
}

export interface MonthLabel {
  key: string
  label: string
}

export interface LegendStep {
  key: string
  bg: string
}
