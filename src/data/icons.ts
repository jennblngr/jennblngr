import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faFigma,
  faGit,
  faGithub,
  faGitlab,
  faLinkedin,
  faNodeJs,
  faNpm,
  faVuejs,
} from '@fortawesome/free-brands-svg-icons'
import {
  Atom,
  BookOpen,
  Boxes,
  CircleAlert,
  CircleCheck,
  CodeXml,
  Database,
  FlaskConical,
  GitCompare,
  LoaderCircle,
  Mail,
  Paintbrush,
  Palette,
  RefreshCw,
  Rocket,
  Send,
  ShieldCheck,
  Wind,
  Zap,
} from '@lucide/vue'
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
  vue: { kind: 'fa', icon: faVuejs },
  typescript: { kind: 'lucide', icon: CodeXml },
  electron: { kind: 'lucide', icon: Atom },
  tailwind: { kind: 'lucide', icon: Wind },
  vite: { kind: 'lucide', icon: Zap },
  pinia: { kind: 'lucide', icon: Database },
  vitest: { kind: 'lucide', icon: FlaskConical },
  gitlabCi: { kind: 'fa', icon: faGitlab },
  node: { kind: 'fa', icon: faNodeJs },
  git: { kind: 'fa', icon: faGit },
  npm: { kind: 'fa', icon: faNpm },
  eslint: { kind: 'lucide', icon: ShieldCheck },
  prettier: { kind: 'lucide', icon: Paintbrush },
  figma: { kind: 'fa', icon: faFigma },
  internalDeps: { kind: 'lucide', icon: Boxes },
  release: { kind: 'lucide', icon: Rocket },
  codeReview: { kind: 'lucide', icon: GitCompare },
  designSystem: { kind: 'lucide', icon: Palette },
  refactor: { kind: 'lucide', icon: RefreshCw },
  docs: { kind: 'lucide', icon: BookOpen },
  email: { kind: 'lucide', icon: Mail },
  gitlab: { kind: 'fa', icon: faGitlab },
  github: { kind: 'fa', icon: faGithub },
  linkedin: { kind: 'fa', icon: faLinkedin },
  send: { kind: 'lucide', icon: Send },
  loader: { kind: 'lucide', icon: LoaderCircle },
  success: { kind: 'lucide', icon: CircleCheck },
  error: { kind: 'lucide', icon: CircleAlert },
} satisfies Record<string, FaIcon | LucideIcon>

export type IconName = keyof typeof ICONS
