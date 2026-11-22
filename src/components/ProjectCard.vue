<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectItem } from '@/types'
import TypeBadge from '@/components/TypeBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'

/** Nombre de technos affichées sur la carte ; la liste complète est dans le panneau. */
const STACK_PREVIEW = 3

// #region Data
const props = defineProps<{
  project: ProjectItem
  isOpen: boolean
  panelId: string
}>()

defineEmits<{
  toggle: []
}>()
// #endregion

// #region Computed
const stackPreview = computed(() => props.project.stack.slice(0, STACK_PREVIEW))
// #endregion
</script>

<template>
  <button
    type="button"
    class="pj-card"
    :class="{ 'is-open': isOpen }"
    :aria-expanded="isOpen"
    :aria-controls="panelId"
    @click="$emit('toggle')"
  >
    <span
      v-if="project.type === 'script' && project.terminal"
      class="bg-ph text-micro flex h-[120px] flex-col overflow-hidden p-[11.2px] font-mono leading-[1.7] text-[#c9c2b5]"
      aria-hidden="true"
    >
      <span
        v-for="(line, i) in project.terminal.slice(0, 4)"
        :key="i"
        :class="i === 0 && 'text-[#8f887c]'"
        >{{ line }}</span
      >
    </span>
    <span v-else class="bg-ph block h-[120px] overflow-hidden">
      <img
        v-if="project.image"
        :src="project.image"
        alt=""
        loading="lazy"
        class="block h-full w-full object-cover"
      />
    </span>

    <span class="flex items-center justify-between gap-2">
      <TypeBadge :type="project.type" />
      <span class="text-muted text-meta font-mono">{{ project.year }}</span>
    </span>

    <!-- Hauteur constante : titre sur 1 ligne, technos sur 2 lignes max, pied ≥ 47 px -->
    <span
      class="text-card overflow-hidden leading-[1.15] font-bold text-ellipsis whitespace-nowrap"
      :title="project.name"
      >{{ project.name }}</span
    >

    <span
      class="text-ink2 text-meta flex h-[46.4px] flex-wrap content-start gap-1.5 overflow-hidden font-mono"
    >
      <span v-for="tech in stackPreview" :key="tech" class="border-line2 border px-2 py-[2.4px]">{{
        tech
      }}</span>
    </span>

    <span
      class="border-line2 text-meta mt-auto flex min-h-[37.6px] items-center justify-end gap-2 border-t border-dashed pt-3 font-mono tracking-[0.06em]"
    >
      <!-- Toute la carte est le bouton : celui-ci n'est qu'un repère visuel -->
      <BaseButton size="sm" decorative :selected="isOpen">
        <AppSvgIcon :name="isOpen ? 'minus' : 'plus'" />
        {{ isOpen ? 'Fermer' : 'Ouvrir' }}
      </BaseButton>
    </span>
  </button>
</template>

<style scoped>
.pj-card {
  all: unset;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 11.2px;
  padding: 17.6px;
  cursor: pointer;
  color: var(--ink);
  background: var(--bg);
  border-right: 1.2px solid var(--ink);
  border-bottom: 1.2px solid var(--ink);
  text-align: left;
  transition: background-color var(--dur-fast) var(--ease-color);
}

.pj-card:hover {
  background: var(--hover);
}

.pj-card:focus-visible {
  outline: 1.6px solid var(--color-accent);
  outline-offset: -4px;
}

.pj-card.is-open {
  background: var(--surf);
}

.pj-card.is-open::after {
  content: '';
  position: absolute;
  right: 17.6px;
  bottom: 0;
  left: 17.6px;
  height: 3.2px;
  background: var(--color-accent);
}
</style>
