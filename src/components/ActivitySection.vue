<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ActivityDay } from '@/types'
import { LEVEL_COUNT, useActivityHeatmap } from '@/composables/useActivityHeatmap'
import SectionHeading from '@/components/SectionHeading.vue'
import ActivityTooltip from '@/components/ActivityTooltip.vue'

/** Semaines en bord de graphe où l'infobulle s'aligne sur la case au lieu d'être centrée. */
const EDGE_WEEKS = 8
/** Écart entre la case et l'infobulle, flèche comprise. */
const TOOLTIP_GAP = 10
/** Délai avant apparition : évite le clignotement quand on balaie la grille. */
const SHOW_DELAY_MS = 80
/** Durée du fondu de sortie, après quoi le contenu est retiré. */
const HIDE_MS = 120
const TOOLTIP_ID = 'activity-tooltip'
const DAYS_PER_WEEK = 7

interface TooltipPosition {
  left: number
  top: number
  align: 'start' | 'center' | 'end'
  below: boolean
}

// #region Data
const { weeks, total, sourceTotals, updated, rangeLabel, streakAt, isTopOfWeek } =
  useActivityHeatmap()
const boxEl = ref<HTMLElement | null>(null)
const scrollEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)
const tipEl = ref<HTMLElement | null>(null)
const activeDay = ref<ActivityDay | null>(null)
const isVisible = ref(false)
const position = ref<TooltipPosition | null>(null)
/** Case qui reçoit le focus au Tab (tabindex itinérant). */
const focusIndex = ref(0)
const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => i)
let showTimer = 0
let hideTimer = 0
let clearTimer = 0
// #endregion

// #region Computed
const days = computed(() => weeks.value.flatMap((week) => week.days))

const anchorStyle = computed(() => {
  if (!position.value) return { visibility: 'hidden' as const }
  const { left, top, align, below } = position.value
  const tx = align === 'start' ? '-22px' : align === 'end' ? 'calc(-100% + 22px)' : '-50%'
  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: `translate(${tx}, ${below ? '0' : '-100%'})`,
  }
})

const arrowStyle = computed(() => {
  const align = position.value?.align
  const marginLeft =
    align === 'start' ? '13px' : align === 'end' ? 'calc(100% - 31px)' : 'calc(50% - 9px)'
  return { marginLeft }
})
// #endregion

// #region Functions
function cellAt(index: number): HTMLElement | null {
  return gridEl.value?.querySelector<HTMLElement>(`[data-index="${index}"]`) ?? null
}

/** Place l'infobulle au-dessus de la case, ou en dessous s'il manque la place sous le menu. */
function place(day: ActivityDay): void {
  const cell = cellAt(day.index)
  if (!boxEl.value || !cell) return
  // Les rectangles sont en px visuels (zoom appliqué) ; left/top s'expriment en px CSS (avant zoom)
  const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1
  const box = boxEl.value.getBoundingClientRect()
  const rect = cell.getBoundingClientRect()
  const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  const height = tipEl.value?.offsetHeight ?? 0
  const below = rect.top - (TOOLTIP_GAP + height) * zoom < headerBottom + 8
  const lastWeek = weeks.value.length - 1

  position.value = {
    left: (rect.left - box.left + rect.width / 2) / zoom,
    top: below
      ? (rect.bottom - box.top) / zoom + TOOLTIP_GAP
      : (rect.top - box.top) / zoom - TOOLTIP_GAP,
    align: day.week < EDGE_WEEKS ? 'start' : day.week > lastWeek - EDGE_WEEKS ? 'end' : 'center',
    below,
  }
}

async function show(day: ActivityDay): Promise<void> {
  window.clearTimeout(hideTimer)
  window.clearTimeout(clearTimer)
  activeDay.value = day
  await nextTick()
  place(day)

  // Déjà affichée : on met à jour en place, sans rejouer l'apparition
  if (isVisible.value) return
  window.clearTimeout(showTimer)
  showTimer = window.setTimeout(() => {
    isVisible.value = true
  }, SHOW_DELAY_MS)
}

function hide(): void {
  window.clearTimeout(showTimer)
  isVisible.value = false
  window.clearTimeout(clearTimer)
  clearTimer = window.setTimeout(() => {
    if (isVisible.value) return
    activeDay.value = null
    position.value = null
  }, HIDE_MS)
}

/** Le passage d'une case à l'autre au clavier déclenche blur puis focus : on attend avant de cacher. */
function scheduleHide(): void {
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(hide, 0)
}

function handleFocus(day: ActivityDay): void {
  focusIndex.value = day.index
  show(day)
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    hide()
    return
  }
  const moves: Record<string, number> = {
    ArrowUp: -1,
    ArrowDown: 1,
    ArrowLeft: -DAYS_PER_WEEK,
    ArrowRight: DAYS_PER_WEEK,
  }
  const move = moves[event.key]
  if (move === undefined) return
  event.preventDefault()
  const next = focusIndex.value + move
  if (next < 0 || next >= days.value.length) return
  cellAt(next)?.focus()
}

/** Au toucher : un tap sur une case ouvre, un tap ailleurs ferme. */
function handlePointerDown(event: PointerEvent): void {
  if (!activeDay.value) return
  if (gridEl.value?.contains(event.target as Node)) return
  hide()
}
// #endregion

// #region Watchers
watch(weeks, async () => {
  focusIndex.value = Math.max(0, days.value.length - 1)
  await nextTick()
  scrollEl.value?.scrollTo({ left: scrollEl.value.scrollWidth })
})
// #endregion

// #region Lifecycles
onMounted(() => document.addEventListener('pointerdown', handlePointerDown))

onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  window.clearTimeout(showTimer)
  window.clearTimeout(hideTimer)
  window.clearTimeout(clearTimer)
})
// #endregion
</script>

<template>
  <section id="activity" class="mt-16 mb-[72px] flex flex-col gap-5">
    <SectionHeading>
      /activity
      <template v-if="updated" #meta>Mis à jour le {{ updated }}</template>
    </SectionHeading>

    <!-- 3 cases égales, alignées sur les colonnes de /skills ; empilées en dessous du même seuil -->
    <div class="@container">
      <div
        class="border-ink divide-ink grid grid-cols-1 divide-y-[1.5px] border-[1.5px] @min-[760px]:grid-cols-3 @min-[760px]:divide-x-[1.5px] @min-[760px]:divide-y-0"
      >
        <div class="bg-accent flex min-w-0 flex-col gap-1.5 px-6 py-[22px] text-white">
          <span class="text-stat-lg leading-[1.1] font-bold tracking-[-0.02em]">{{ total }}</span>
          <span class="text-label font-mono tracking-[0.08em]">CONTRIBUTIONS</span>
        </div>
        <div class="flex min-w-0 flex-col gap-1.5 px-6 py-[22px]">
          <span class="text-stat-sm leading-[1.2] font-bold tracking-[-0.02em]">{{
            sourceTotals.gitlab
          }}</span>
          <span class="text-muted text-label font-mono tracking-[0.08em]"># GITLAB</span>
        </div>
        <div class="flex min-w-0 flex-col gap-1.5 px-6 py-[22px]">
          <span class="text-stat-sm leading-[1.2] font-bold tracking-[-0.02em]">{{
            sourceTotals.github
          }}</span>
          <span class="text-muted text-label font-mono tracking-[0.08em]"># GITHUB</span>
        </div>
      </div>
    </div>

    <div
      ref="boxEl"
      class="border-ink bg-surf relative [overflow-x:clip] border-[1.5px] p-5 sm:p-7"
    >
      <div
        ref="scrollEl"
        class="[scrollbar-width:none] overflow-x-auto pt-1 [&::-webkit-scrollbar]:hidden"
        @scroll="hide"
      >
        <div
          ref="gridEl"
          role="group"
          aria-label="Contributions par jour sur 12 mois"
          class="flex w-max gap-1 p-[3px]"
          @mouseleave="hide"
          @keydown="handleKeydown"
        >
          <div v-for="week in weeks" :key="week.key" class="flex flex-col gap-1">
            <button
              v-for="day in week.days"
              :key="day.key"
              type="button"
              class="cell"
              :class="{ 'is-active': isVisible && activeDay?.key === day.key }"
              :data-index="day.index"
              :tabindex="day.index === focusIndex ? 0 : -1"
              :aria-label="day.label"
              :aria-describedby="activeDay?.key === day.key ? TOOLTIP_ID : undefined"
              :style="{ background: `var(--h${day.level})` }"
              @mouseenter="show(day)"
              @click="show(day)"
              @focus="handleFocus(day)"
              @blur="scheduleHide"
            ></button>
          </div>
        </div>
      </div>

      <div
        v-if="activeDay"
        :id="TOOLTIP_ID"
        ref="tipEl"
        role="tooltip"
        class="pointer-events-none absolute z-20 w-[288px]"
        :style="anchorStyle"
      >
        <div class="pop" :class="{ 'is-shown': isVisible, 'is-below': position?.below }">
          <svg
            v-if="position?.below"
            width="18"
            height="10"
            viewBox="0 0 18 10"
            aria-hidden="true"
            class="-mb-[1.5px] block"
            :style="arrowStyle"
          >
            <path
              d="M0 10 L9 1 L18 10"
              stroke-width="1.5"
              class="stroke-ink"
              :class="isTopOfWeek(activeDay) ? 'fill-sage' : 'fill-field'"
            />
          </svg>
          <ActivityTooltip
            :day="activeDay"
            :streak="streakAt(activeDay.index)"
            :is-top="isTopOfWeek(activeDay)"
          />
          <svg
            v-if="!position?.below"
            width="18"
            height="10"
            viewBox="0 0 18 10"
            aria-hidden="true"
            class="-mt-[1.5px] block"
            :style="arrowStyle"
          >
            <path
              d="M0 0 L9 9 L18 0"
              stroke-width="1.5"
              class="stroke-ink"
              :class="isTopOfWeek(activeDay) ? 'fill-sage' : 'fill-field'"
            />
          </svg>
        </div>
      </div>

      <div
        class="text-muted text-label mt-[18px] flex w-full flex-wrap justify-between gap-4 font-mono"
      >
        <span>{{ rangeLabel }}</span>
        <span class="flex items-center gap-1">
          moins
          <span
            v-for="level in levels"
            :key="level"
            class="border-line2 h-3 w-3 border"
            :style="{ background: `var(--h${level})` }"
          ></span>
          plus
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cell {
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 14px;
  height: 14px;
  border: 1px solid var(--line2);
  cursor: crosshair;
}

.cell:focus-visible,
.cell.is-active {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}

/* Apparition : fondu + montée de 4 px ; sortie plus courte */
.pop {
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity var(--dur-fast) var(--ease-color),
    transform var(--dur-fast) var(--ease-color);
}

.pop.is-below {
  transform: translateY(-4px);
}

.pop.is-shown {
  opacity: 1;
  transform: none;
  transition:
    opacity 160ms var(--ease-color),
    transform var(--dur-base) var(--ease-move);
}

@media (prefers-reduced-motion: reduce) {
  .pop,
  .pop.is-below,
  .pop.is-shown {
    transform: none;
    transition: opacity var(--dur-fast) var(--ease-color);
  }
}
</style>
