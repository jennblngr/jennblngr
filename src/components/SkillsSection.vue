<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SkillEntry } from '@/types'
import { SKILL_CATEGORIES } from '@/data/portfolio'
import SectionHeading from '@/components/SectionHeading.vue'
import BaseButton from '@/components/BaseButton.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import { useSkillCounts } from '@/composables/useSkillCounts'

type SkillSort = 'alpha' | 'count'

const SORTS: readonly { id: SkillSort; label: string }[] = [
  { id: 'alpha', label: 'A → Z' },
  { id: 'count', label: 'Plus utilisées' },
]

// #region Data
const sort = ref<SkillSort>('alpha')
const favoritesOnly = ref(false)
const collator = new Intl.Collator('fr')
const { counts } = useSkillCounts()
// #endregion

// #region Computed
const hasFavorites = SKILL_CATEGORIES.some((category) => category.items.some((i) => i.favorite))

const columns = computed(() =>
  SKILL_CATEGORIES.map((category) => {
    // Chiffre affiché seulement s'il a été collecté et qu'il est non nul
    let items: SkillEntry[] = category.items.map((item) => {
      const projects = category.unit ? counts.value[item.name] : undefined
      return projects ? { ...item, projects } : item
    })
    if (favoritesOnly.value) items = items.filter((item) => item.favorite)
    items.sort((a, b) => collator.compare(a.name, b.name))
    // Tri stable : à nombre égal (ou sans chiffre, en fin de liste), l'ordre alphabétique reste
    if (sort.value === 'count') items.sort((a, b) => (b.projects ?? -1) - (a.projects ?? -1))
    return { ...category, items }
  }),
)
// #endregion

// #region Functions
/** Texte masqué pour les lecteurs d'écran : « , favorite, 14 projets ». */
function srDetail(item: SkillEntry, unit?: string): string {
  const parts: string[] = []
  if (item.favorite) parts.push('favorite')
  if (unit && item.projects !== undefined) {
    parts.push(`${item.projects} ${item.projects > 1 ? unit : unit.replace(/s$/, '')}`)
  }
  return parts.length ? `, ${parts.join(', ')}` : ''
}
// #endregion
</script>

<template>
  <section id="skills" class="mb-[72px] flex flex-col gap-5">
    <SectionHeading>
      /skills
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <ButtonGroup role="group" aria-label="Trier">
            <BaseButton
              v-for="option in SORTS"
              :key="option.id"
              size="sm"
              :selected="sort === option.id"
              :aria-pressed="sort === option.id"
              @click="sort = option.id"
            >
              {{ option.label }}
            </BaseButton>
          </ButtonGroup>
          <BaseButton
            v-if="hasFavorites"
            size="sm"
            :selected="favoritesOnly"
            :aria-pressed="favoritesOnly"
            @click="favoritesOnly = !favoritesOnly"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" class="!h-3 !w-3">
              <circle cx="8" cy="8" r="7" fill="#c23d22" stroke="currentColor" stroke-width="1.5" />
            </svg>
            Favorites
          </BaseButton>
        </div>
      </template>
    </SectionHeading>

    <div class="border-ink flex flex-wrap border-t-[1.5px] border-l-[1.5px]">
      <div
        v-for="column in columns"
        :key="column.title"
        class="border-ink text-small flex min-w-0 flex-[1_1_300px] flex-col gap-0.5 border-r-[1.5px] border-b-[1.5px] p-[26px] font-mono leading-[1.7]"
      >
        <span
          aria-hidden="true"
          class="border-ink text-h4 mb-4 flex h-[54px] w-[54px] items-center justify-center border-[1.5px] font-sans leading-none font-bold"
          :class="column.tone === 'sage' && 'bg-sage text-white'"
          >{{ column.letter }}</span
        >
        <div
          class="border-ink mb-1.5 flex items-baseline justify-between gap-3 border-b-[1.5px] pb-2.5"
        >
          <h3 class="text-h4 m-0 font-sans leading-[1.1] font-bold tracking-[-0.01em]">
            {{ column.title }}
          </h3>
          <span v-if="column.unit" class="text-muted text-micro tracking-[0.08em] uppercase">{{
            column.unit
          }}</span>
        </div>

        <ul class="tree m-0 list-none p-0 pt-1.5">
          <li
            v-for="item in column.items"
            :key="item.name"
            class="tree-item"
            :class="{ 'is-fav': item.favorite }"
          >
            <div class="flex items-center gap-2.5 py-[3px]">
              <span class="whitespace-nowrap">{{ item.name }}</span>
              <span class="sr-only">{{ srDetail(item, column.unit) }}</span>
              <template v-if="item.projects">
                <span
                  aria-hidden="true"
                  class="border-line2 min-w-3 flex-auto -translate-y-1 border-b border-dotted"
                ></span>
                <span aria-hidden="true" class="text-ink2 min-w-[2ch] text-right">{{
                  item.projects
                }}</span>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="text-muted text-meta flex flex-wrap gap-6 font-mono">
      <span v-if="hasFavorites" class="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" class="block flex-none">
          <circle cx="8" cy="8" r="7" fill="#c23d22" stroke="currentColor" stroke-width="1.5" />
        </svg>
        techno favorite
      </span>
      <span>N = projets GitHub perso où je l’ai utilisée</span>
    </div>
  </section>
</template>

<style scoped>
/* Frise : trait du premier au dernier rond, rond plein rouge = favorite */
.tree-item {
  position: relative;
  padding-left: 30px;
}

.tree-item::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 7px;
  width: 2px;
  background: var(--ink);
}

.tree-item:first-child::before {
  top: 50%;
}

.tree-item:last-child::before {
  bottom: 50%;
}

.tree-item:only-child::before {
  display: none;
}

.tree-item::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin-top: -8px;
  border: 1.5px solid var(--ink);
  border-radius: 50%;
  background: var(--bg);
}

.tree-item.is-fav::after {
  background: var(--color-accent);
}
</style>
