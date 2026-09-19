import type { ExperienceGroup, ProjectItem, SectionLink, SkillCategory, SocialLink } from '@/types'

const BUILD_LINE = import.meta.env.DEV ? 'build in 000ms' : `build in __BUILD_DURATION_MS__ms`

export const BOOT_MESSAGES: readonly string[] = [
  BUILD_LINE,
  'vue.js app mounted',
  'disponible en freelance',
]

export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  {
    title: 'front/',
    items: [
      { icon: 'vue', label: 'vue.js' },
      { icon: 'typescript', label: 'typescript' },
      { icon: 'electron', label: 'electron' },
      { icon: 'tailwind', label: 'tailwind' },
      { icon: 'vite', label: 'vite' },
      { icon: 'pinia', label: 'pinia' },
      { icon: 'vitest', label: 'vitest' },
    ],
  },
  {
    title: 'tooling/',
    items: [
      { icon: 'gitlabCi', label: 'gitlab ci' },
      { icon: 'node', label: 'node' },
      { icon: 'git', label: 'git' },
      { icon: 'npm', label: 'npm' },
      { icon: 'eslint', label: 'eslint' },
      { icon: 'prettier', label: 'prettier' },
      { icon: 'figma', label: 'figma' },
    ],
  },
  {
    title: 'process/',
    items: [
      { icon: 'codeReview', label: 'revue de code' },
      { icon: 'designSystem', label: 'design system' },
      { icon: 'refactor', label: 'refactoring legacy' },
      { icon: 'docs', label: 'documentation technique' },
      { icon: 'internalDeps', label: 'gestion de dépendances internes' },
      { icon: 'release', label: 'release & semver' },
    ],
  },
]

export const EXPERIENCE: readonly ExperienceGroup[] = [
  {
    org: 'caldera',
    roles: [
      {
        period: 'juin 2025 — présent',
        role: 'contractor',
        bullets: [
          "Développement du wizard EasyMedia, fonctionnalité héritée de l'ancien RIP, nécessitant un refactoring conséquent de code legacy.",
          "Collaboration avec l'équipe UI/UX pour la mise en place d'un UI Kit au sein de l'entreprise.",
          "Définition des nouvelles règles CSS et des composants de l'UI Kit, avec un suivi rigoureux de leur bon respect dans le code au démarrage du projet.",
          "Passation de connaissance sur l'UI Kit auprès des développeurs historiques et des nouveaux arrivants, pour en assurer l'adoption autonome au sein de l'équipe.",
        ],
      },
      {
        period: 'septembre 2022 — juin 2025',
        role: 'développeuse front-end',
        bullets: [
          "Développement de la fonctionnalité fondatrice du logiciel Direct-to-Garment, avec l'affichage d'un t-shirt au format SVG dans le studio Konva et d'une grille symbolisant la palette.",
          "Conception de la fonctionnalité à l'origine du logiciel Direct-to-Film, un placement automatique (nesting) des visuels dans le studio Konva limitant les pertes de média pour les utilisateurs.",
          'Co-création d’une librairie interne partagée entre 4 GUIs pour éliminer la duplication de code.',
          'Conception d’une solution de mise à jour automatique des dépendances internes, permettent à chaque GUI de bénéficier des derniers changements en nightly, tous les matins.',
        ],
      },
    ],
  },
  {
    org: 'indépendante',
    roles: [
      {
        period: 'avril 2021 — présent',
        role: 'freelance',
        bullets: [
          'Conception et développement de portfolios sur mesure pour designers graphiques et artistes.',
        ],
      },
    ],
  },
]

export const PROJECTS: readonly ProjectItem[] = [
  {
    name: 'lea-bergougnoux',
    desc: 'Portfolio sur mesure pour designer graphique. Conception, intégration et mise en ligne.',
    year: '2024',
    stack: ['vue.js', 'tailwind', 'strapi', 'postgresql', 'nginx'],
    url: 'https://leabergougnoux.com/',
    image: '/lea-bergougnoux.jpeg',
  },
  {
    name: 'suzanne-laclautre',
    desc: 'Portfolio sur mesure pour designer graphique. Conception, intégration et mise en ligne.',
    year: '2023',
    stack: ['vue.js', 'scss', 'strapi', 'postgresql', 'apache2'],
    url: 'https://www.suzannelaclautre.fr/',
    image: '/suzanne-laclautre.jpeg',
  },
  {
    name: 'eliana-pliskin-jacobs',
    desc: 'Portfolio sur mesure pour artiste pluridisciplinaire. Conception, intégration et mise en ligne.',
    year: '2022',
    stack: ['vue.js', 'scss', 'strapi', 'postgresql', 'apache2'],
    url: 'https://eliana-arts.com/',
    image: '/eliana-jacobs.jpeg',
  },
]

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'contact', href: '#contact', icon: 'email' },
  { label: 'github/jennblngr', href: 'https://github.com/jennblngr', icon: 'github' },
  {
    label: 'linkedin/jennylee.boulanger',
    href: 'https://www.linkedin.com/in/jenny-lee-boulanger-7aa3b8b9',
    icon: 'linkedin',
  },
]

export const SECTIONS: readonly SectionLink[] = [
  { id: 'activity', label: 'activity' },
  { id: 'skills', label: 'skills' },
  { id: 'experience', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'contact', label: 'contact' },
]
