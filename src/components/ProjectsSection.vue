<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ProjectItem, ProjectType } from '@/types'
import { PROJECTS } from '@/data/portfolio'
import SectionHeading from '@/components/SectionHeading.vue'
import BaseButton from '@/components/BaseButton.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectDetailPanel from '@/components/ProjectDetailPanel.vue'

type ProjectFilter = 'all' | ProjectType

const PANEL_ID = 'project-detail'
const HASH_PREFIX = '#projects/'
/** Largeur minimale d'une carte : fixe le nombre de cartes par page (4 max). */
const CARD_MIN_WIDTH = 192
const MAX_COLUMNS = 4
/** Sous cette largeur de grille, le panneau s'empile (≈ 840 px de fenêtre). */
const PANEL_WIDE_MIN = 634
const TYPE_ORDER: readonly ProjectType[] = ['web', 'mobile', 'pwa', 'extension', 'script']

// #region Data
const filter = ref<ProjectFilter>('all')
const page = ref(0)
const openSlug = ref<string | null>(null)
/** Dernier projet ouvert : son contenu reste affiché pendant le repli du panneau. */
const lastSlug = ref(PROJECTS[0]?.slug ?? '')
const columns = ref(MAX_COLUMNS)
const gridWidth = ref(0)
/** Incrémenté à chaque changement de page ou de filtre, pour rejouer le fondu du contenu. */
const swapCount = ref(0)
const gridEl = ref<HTMLElement | null>(null)
const cardRefs = ref<InstanceType<typeof ProjectCard>[]>([])
let resizeObserver: ResizeObserver | null = null
// #endregion

// #region Computed
const filtered = computed(() =>
  filter.value === 'all' ? PROJECTS : PROJECTS.filter((p) => p.type === filter.value),
)

/** Filtres affichés : « Tous » + les types qui ont au moins un projet. */
const filters = computed(() => [
  { id: 'all' as const, label: 'Tous', count: PROJECTS.length },
  ...TYPE_ORDER.map((type) => ({
    id: type,
    label: type,
    count: PROJECTS.filter((p) => p.type === type).length,
  })).filter((f) => f.count > 0),
])

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / columns.value)))
const visible = computed(() =>
  filtered.value.slice(page.value * columns.value, (page.value + 1) * columns.value),
)
const emptyCells = computed(() => Math.max(0, columns.value - visible.value.length))
const isOpen = computed(() => openSlug.value !== null)
const shownProject = computed<ProjectItem>(
  () => PROJECTS.find((p) => p.slug === (openSlug.value ?? lastSlug.value)) ?? PROJECTS[0],
)
const isWide = computed(() => gridWidth.value >= PANEL_WIDE_MIN)
const swapClass = computed(() =>
  swapCount.value ? (swapCount.value % 2 ? 'pj-swap-a' : 'pj-swap-b') : '',
)

const counter = computed(() => {
  const total = filtered.value.length
  const noun = `projet${total > 1 ? 's' : ''}`
  const suffix = filter.value === 'all' ? '' : ` · ${filter.value.toUpperCase()}`
  if (!total) return `0 projet${suffix}`
  const first = page.value * columns.value + 1
  const last = first + visible.value.length - 1
  const range = last > first ? `${first}–${last}` : `${first}`
  return `${range} sur ${total} ${noun}${suffix}`
})
// #endregion

// #region Functions
function setHash(hash: string): void {
  history.replaceState(history.state, '', hash)
}

function open(slug: string): void {
  openSlug.value = slug
  lastSlug.value = slug
  setHash(`${HASH_PREFIX}${slug}`)
}

function close(): void {
  const slug = openSlug.value
  if (slug === null) return
  openSlug.value = null
  setHash('#projects')
  const index = visible.value.findIndex((p) => p.slug === slug)
  const card = cardRefs.value[index]?.$el as HTMLElement | undefined
  card?.focus({ preventScroll: true })
}

function toggle(slug: string): void {
  if (openSlug.value === slug) close()
  else open(slug)
}

/** Panneau ouvert : il suit le premier projet visible ; fermé, il reste fermé. */
function followFirstVisible(): void {
  if (!isOpen.value) return
  const first = visible.value[0]
  if (first) open(first.slug)
  else {
    openSlug.value = null
    setHash('#projects')
  }
}

function goToPage(next: number): void {
  if (next < 0 || next >= pageCount.value || next === page.value) return
  page.value = next
  swapCount.value++
  followFirstVisible()
}

function selectFilter(next: ProjectFilter): void {
  if (next === filter.value) return
  filter.value = next
  page.value = 0
  swapCount.value++
  followFirstVisible()
}

/** Place la page sur le projet ouvert (ou la borne) quand le nombre de colonnes change. */
function syncPage(): void {
  const index = filtered.value.findIndex((p) => p.slug === openSlug.value)
  if (index >= 0) page.value = Math.floor(index / columns.value)
  else page.value = Math.min(page.value, pageCount.value - 1)
}

function measure(): void {
  if (!gridEl.value) return
  gridWidth.value = gridEl.value.clientWidth
  columns.value = Math.min(MAX_COLUMNS, Math.max(1, Math.floor(gridWidth.value / CARD_MIN_WIDTH)))
}

function openFromHash(): void {
  if (!location.hash.startsWith(HASH_PREFIX)) return
  const slug = decodeURIComponent(location.hash.slice(HASH_PREFIX.length))
  if (!PROJECTS.some((p) => p.slug === slug)) return
  filter.value = 'all'
  openSlug.value = slug
  lastSlug.value = slug
  syncPage()
  document.getElementById('projects')?.scrollIntoView()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isOpen.value) close()
}

/** Flèches ← → quand le focus est dans la grille : page précédente / suivante. */
async function handleGridKeydown(event: KeyboardEvent): Promise<void> {
  const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
  if (!step) return
  event.preventDefault()
  goToPage(page.value + step)
  await nextTick()
  ;(cardRefs.value[0]?.$el as HTMLElement | undefined)?.focus()
}
// #endregion

// #region Watchers
watch(columns, syncPage)
// #endregion

// #region Lifecycles
onMounted(() => {
  measure()
  resizeObserver = new ResizeObserver(measure)
  if (gridEl.value) resizeObserver.observe(gridEl.value)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('hashchange', openFromHash)
  openFromHash()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('hashchange', openFromHash)
})
// #endregion
</script>

<template>
  <section id="projects" class="mb-[57.6px] flex flex-col gap-5">
    <SectionHeading>
      /projects
      <template #actions>
        <ButtonGroup role="group" aria-label="Filtrer par type" class="w-max">
          <BaseButton
            v-for="option in filters"
            :key="option.id"
            size="sm"
            :selected="filter === option.id"
            :aria-pressed="filter === option.id"
            @click="selectFilter(option.id)"
          >
            {{ option.label }} · {{ option.count }}
          </BaseButton>
        </ButtonGroup>
      </template>
    </SectionHeading>

    <div
      ref="gridEl"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Projets"
      class="border-ink grid border-t-[1.2px] border-l-[1.2px]"
      :class="swapClass"
      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
      @keydown="handleGridKeydown"
    >
      <!-- Clé = position : les cartes restent en place, seul leur contenu change en fondu -->
      <ProjectCard
        v-for="(project, index) in visible"
        :key="index"
        ref="cardRefs"
        :project="project"
        :is-open="openSlug === project.slug"
        :panel-id="PANEL_ID"
        :style="{ '--i': index }"
        @toggle="toggle(project.slug)"
      />
      <div
        v-for="index in emptyCells"
        :key="`empty-${index}`"
        aria-hidden="true"
        class="pj-empty"
      ></div>

      <div
        class="pj-detail col-span-full"
        :class="{ 'is-open': isOpen }"
        :aria-hidden="!isOpen"
        :inert="!isOpen"
      >
        <div class="min-h-0 overflow-hidden">
          <div :id="PANEL_ID" role="region" aria-label="Détail du projet" class="pj-detail-body">
            <ProjectDetailPanel :project="shownProject" :wide="isWide" @close="close" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <span class="text-muted text-meta font-mono tracking-[0.08em] uppercase" aria-live="polite">{{
        counter
      }}</span>
      <div v-if="pageCount > 1" class="flex items-center gap-4">
        <span class="flex gap-1.5" aria-hidden="true">
          <span
            v-for="n in pageCount"
            :key="n"
            class="border-ink h-2.5 w-2.5 border-[1.2px]"
            :class="n - 1 === page && 'bg-ink'"
          ></span>
        </span>
        <ButtonGroup class="-m-1 p-1">
          <BaseButton
            icon-only
            aria-label="Projets précédents"
            :aria-disabled="page === 0"
            @click="goToPage(page - 1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.76"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </BaseButton>
          <BaseButton
            icon-only
            aria-label="Projets suivants"
            :aria-disabled="page >= pageCount - 1"
            @click="goToPage(page + 1)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.76"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </BaseButton>
        </ButtonGroup>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Cases vides : complètent la rangée, fond pointillé */
.pj-empty {
  border-right: 1.2px solid var(--ink);
  border-bottom: 1.2px solid var(--ink);
  background-color: var(--bg);
  background-image: radial-gradient(circle, var(--line2) 0.8px, transparent 1.12px);
  background-size: 12.8px 12.8px;
}

/* Dépliage : hauteur en 320 ms, puis contenu décalé de 120 ms ; fermeture plus rapide */
.pj-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--dur-slow) var(--ease-move);
}

.pj-detail.is-open {
  grid-template-rows: 1fr;
}

.pj-detail-body {
  opacity: 0;
  transform: translateY(-9.6px);
  transition:
    opacity 180ms var(--ease-color),
    transform 180ms var(--ease-color);
}

.pj-detail.is-open .pj-detail-body {
  opacity: 1;
  transform: none;
  transition:
    opacity 240ms var(--ease-color) var(--dur-fast),
    transform 240ms var(--ease-color) var(--dur-fast);
}

/*
 * Changement de page / filtre : seul le contenu des cartes et du panneau passe en fondu
 * (30 ms de décalage par carte) ; contours et hauteur restent fixes. Deux animations
 * identiques en alternance pour rejouer le fondu à chaque changement.
 */
@keyframes pj-fade-a {
  from {
    opacity: 0;
  }
}

@keyframes pj-fade-b {
  from {
    opacity: 0;
  }
}

.pj-swap-a :deep(.pj-card > *) {
  animation: pj-fade-a var(--dur-base) var(--ease-color) both;
  animation-delay: calc(var(--i, 0) * 30ms);
}

.pj-swap-b :deep(.pj-card > *) {
  animation: pj-fade-b var(--dur-base) var(--ease-color) both;
  animation-delay: calc(var(--i, 0) * 30ms);
}

.pj-swap-a :deep(.pj-col) {
  animation: pj-fade-a var(--dur-base) var(--ease-color) both;
}

.pj-swap-b :deep(.pj-col) {
  animation: pj-fade-b var(--dur-base) var(--ease-color) both;
}

.pj-swap-a :deep(.pj-col + .pj-col),
.pj-swap-b :deep(.pj-col + .pj-col) {
  animation-delay: 60ms;
}

@media (prefers-reduced-motion: reduce) {
  .pj-detail,
  .pj-detail-body,
  .pj-detail.is-open .pj-detail-body {
    transition: none;
  }

  .pj-swap-a :deep(.pj-card > *),
  .pj-swap-b :deep(.pj-card > *),
  .pj-swap-a :deep(.pj-col),
  .pj-swap-b :deep(.pj-col) {
    animation-duration: var(--dur-fast);
  }
}
</style>
