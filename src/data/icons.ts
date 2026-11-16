import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { CircleAlert, CircleCheck, LoaderCircle } from '@lucide/vue'
import type { Component } from 'vue'

interface FaIcon {
  kind: 'fa'
  icon: IconDefinition
}

interface LucideIcon {
  kind: 'lucide'
  icon: Component
}

export const ICONS = {
  github: { kind: 'fa', icon: faGithub },
  linkedin: { kind: 'fa', icon: faLinkedin },
  loader: { kind: 'lucide', icon: LoaderCircle },
  success: { kind: 'lucide', icon: CircleCheck },
  error: { kind: 'lucide', icon: CircleAlert },
} satisfies Record<string, FaIcon | LucideIcon>

export type IconName = keyof typeof ICONS
