import type { ExperienceGroup, ProjectItem, SectionLink, SkillCategory, SocialLink } from '@/types'

/** Début de l'activité professionnelle, sert au compteur « N ANS » de l'en-tête. */
export const CAREER_START = '2021-04'

// Le nombre de projets par techno vient de public/skills.json (scripts/sync-skills.mjs) ;
// les technos absentes de ce fichier n'affichent pas de chiffre.
// TODO: favorites à choisir (3 à 5), via `favorite: true`.
export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  {
    title: 'Front',
    letter: 'F',
    tone: 'plain',
    unit: 'projets',
    items: [
      { name: 'vue.js' },
      { name: 'typescript' },
      { name: 'electron' },
      { name: 'tailwind' },
      { name: 'vite' },
      { name: 'pinia' },
      { name: 'vitest' },
    ],
  },
  {
    title: 'Tooling',
    letter: 'T',
    tone: 'plain',
    unit: 'projets',
    items: [
      { name: 'gitlab ci' },
      { name: 'node' },
      { name: 'git' },
      { name: 'npm' },
      { name: 'eslint' },
      { name: 'prettier' },
      { name: 'figma' },
    ],
  },
  {
    title: 'Process',
    letter: 'P',
    tone: 'sage',
    items: [
      { name: 'revue de code' },
      { name: 'design system' },
      { name: 'refactoring legacy' },
      { name: 'documentation technique' },
      { name: 'dépendances internes' },
      { name: 'release & semver' },
    ],
  },
]

export const EXPERIENCE: readonly ExperienceGroup[] = [
  {
    org: 'caldera',
    name: 'Caldera',
    initial: 'C',
    tone: 'plain',
    start: '2022-09',
    roles: [
      {
        title: 'Contractor',
        start: '2025-06',
        bullets: [
          "Développement du wizard EasyMedia, fonctionnalité héritée de l'ancien RIP, nécessitant un refactoring conséquent de code legacy.",
          "Collaboration avec l'équipe UI/UX pour la mise en place d'un UI Kit au sein de l'entreprise.",
          "Définition des nouvelles règles CSS et des composants de l'UI Kit, avec un suivi rigoureux de leur respect dans le code.",
          "Passation de connaissance sur l'UI Kit auprès des développeurs historiques et des nouveaux arrivants.",
        ],
      },
      {
        title: 'Développeuse front-end',
        start: '2022-09',
        end: '2025-06',
        bullets: [
          "Fonctionnalité fondatrice du logiciel Direct-to-Garment : affichage d'un t-shirt en SVG dans le studio Konva et d'une grille symbolisant la palette.",
          'Conception du placement automatique (nesting) des visuels dans le studio Konva du logiciel Direct-to-Film, limitant les pertes de média.',
          "Co-création d'une librairie interne partagée entre 4 GUIs pour éliminer la duplication de code.",
          'Mise à jour automatique des dépendances internes : chaque GUI bénéficie des derniers changements en nightly, tous les matins.',
        ],
      },
    ],
  },
  {
    org: 'indépendante',
    name: 'Indépendante',
    initial: 'I',
    tone: 'sage',
    start: '2021-04',
    roles: [
      {
        title: 'Freelance — portfolios sur mesure',
        start: '2021-04',
        summary:
          'Conception et développement de portfolios sur mesure pour designers graphiques et artistes.',
      },
    ],
  },
]

export const PROJECTS: readonly ProjectItem[] = [
  {
    slug: 'lea-bergougnoux',
    name: 'Léa Bergougnoux',
    type: 'web',
    year: '2024',
    desc: "Portfolio d'une designer graphique qui présente son travail d'identité visuelle, d'édition, de photographie et de workshops. J'ai développé le site à partir de son design, avec un back-office Strapi qui lui permet de publier et classer ses projets en autonomie.",
    did: [
      'Développement front-end en Vue.js',
      'Développement back-end avec un back-office Strapi et une base PostgreSQL',
      'Mise en ligne et hébergement sur un VPS, avec un serveur Nginx',
      'Maintenance et évolutions du site, dont la migration du back-office vers Strapi 5',
    ],
    stack: ['Vue.js', 'TypeScript', 'Tailwind', 'GraphQL', 'Strapi', 'PostgreSQL', 'Nginx'],
    url: 'https://leabergougnoux.com/',
    primaryLabel: 'Voir le site',
    image: '/lea-bergougnoux.jpeg',
  },
  {
    slug: 'suzanne-laclautre',
    name: 'Suzanne Laclautre',
    type: 'web',
    year: '2022',
    desc: "Portfolio d'une designer graphique spécialisée dans les dispositifs pédagogiques, qui présente son travail de graphisme, d'édition, d'illustration et d'ateliers. J'ai développé le site à partir de son design, avec un back-office Strapi qui lui permet de publier et classer ses projets en autonomie, et de choisir ceux mis en avant sur l'accueil.",
    did: [
      'Développement front-end avec Nuxt, en génération statique',
      'Développement back-end avec un back-office Strapi et une base PostgreSQL',
      'Mise en ligne et hébergement sur un VPS, avec un serveur Apache',
    ],
    stack: ['Nuxt', 'SCSS', 'GSAP', 'Strapi', 'PostgreSQL', 'Cloudinary', 'Apache'],
    url: 'https://www.suzannelaclautre.fr/',
    primaryLabel: 'Voir le site',
    image: '/suzanne-laclautre.jpeg',
  },
  {
    slug: 'eliana-pliskin-jacobs',
    name: 'Eliana Pliskin-Jacobs',
    type: 'web',
    year: '2023',
    desc: "Portfolio d'une artiste pluridisciplinaire, à la fois artiste de cirque, chanteuse et plasticienne. J'ai conçu l'interface avec elle et développé le site, avec un back-office Strapi qui lui permet de publier ses projets en images, vidéos ou sons, et de choisir leur mise en page.",
    did: [
      "Conception de l'interface avec l'artiste",
      'Développement front-end en Vue.js',
      'Développement back-end avec un back-office Strapi et une base PostgreSQL',
      'Mise en ligne et hébergement sur un VPS, avec un serveur Apache',
    ],
    stack: [
      'Vue.js',
      'TypeScript',
      'SCSS',
      'GraphQL',
      'Strapi',
      'PostgreSQL',
      'Cloudinary',
      'Apache',
    ],
    url: 'https://eliana-arts.com/',
    primaryLabel: 'Voir le site',
    image: '/eliana-jacobs.jpeg',
  },
]

export const SOCIAL_LINKS: readonly SocialLink[] = [
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
