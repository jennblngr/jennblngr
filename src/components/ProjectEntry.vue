<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectItem } from '@/types'
import ListRenderer from '@/components/ListRenderer.vue'

// #region Data
const props = defineProps<{
  project: ProjectItem
  isOpen: boolean
}>()

defineEmits<{
  toggle: []
}>()
// #endregion

// #region Computed
const previewAlt = computed(() => `capture ${props.project.name}`)
// #endregion
</script>

<template>
  <div class="group border-line border-b last:border-b-0">
    <button
      type="button"
      class="group-first:pt-0 flex w-full cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-2 py-[13px] text-left select-none"
      :class="{ 'group-last:pb-0': !isOpen }"
      :aria-expanded="isOpen"
      @click="$emit('toggle')"
    >
      <span
        class="text-dim inline-block w-2.5 flex-none text-[0.6875rem] transition-transform duration-[220ms] ease-out"
        :class="isOpen ? 'rotate-90' : 'rotate-0'"
        >▸</span
      >
      <span class="text-accent inline-block flex-1 text-[0.84375rem]">{{ project.name }}</span>
      <span class="text-dim text-[0.75rem] opacity-70">{{ project.year }}</span>
    </button>
    <div
      class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
      :style="{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }"
    >
      <div class="overflow-hidden">
        <div class="group-last:pb-0 flex flex-wrap gap-[18px] pb-5 pl-[21px]">
          <div
            class="border-line bg-inset aspect-[16/10] max-w-full flex-[0_0_260px] overflow-hidden rounded-md border"
          >
            <img
              v-if="project.image"
              :src="project.image"
              :alt="previewAlt"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="text-dim flex h-full w-full items-center justify-center text-[0.6875rem]"
            >
              {{ previewAlt }}
            </div>
          </div>
          <div class="flex min-w-0 flex-[1_1_240px] flex-col gap-2.5">
            <p class="text-fg text-[0.8125rem] leading-relaxed text-pretty">{{ project.desc }}</p>
            <div class="flex flex-wrap gap-1.5">
              <ListRenderer v-slot="{ item: tag }" :items="project.stack">
                <span class="border-line text-dim rounded border px-2 py-0.5 text-[0.6875rem]">{{
                  tag
                }}</span>
              </ListRenderer>
            </div>
            <a
              :href="project.url"
              target="_blank"
              rel="noreferrer"
              class="border-line text-fg hover:border-fg self-start border-b pb-0.5 text-[0.78125rem] transition-colors duration-150"
              >voir le site ↗</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
