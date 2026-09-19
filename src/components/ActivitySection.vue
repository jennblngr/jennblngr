<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Tooltip } from 'floating-vue'
import { useActivityHeatmap } from '@/composables/useActivityHeatmap'
import SectionCard from '@/components/SectionCard.vue'
import ListRenderer from '@/components/ListRenderer.vue'
import ActivityTooltip from '@/components/ActivityTooltip.vue'

// #region Data
const { weeks, days, monthLabels, total, legendSteps } = useActivityHeatmap()
const scrollEl = ref<HTMLElement | null>(null)
// #endregion

// #region Lifecycles
watch(weeks, async () => {
  await nextTick()
  scrollEl.value?.scrollTo({ left: scrollEl.value.scrollWidth })
})
// #endregion
</script>

<template>
  <SectionCard id="activity" label="activity" margin-top-class="mt-[40px]">
    <template #badge>
      <span
        class="border-accent/25 bg-accent/10 text-accent inline-flex items-center gap-[7px] rounded-[3px] border px-[9px] py-[2px] text-[0.65625rem] font-semibold tracking-[0.1em] uppercase"
      >
        <span class="relative flex h-[6px] w-[6px]">
          <span
            class="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          />
          <span class="bg-accent relative inline-flex h-[6px] w-[6px] rounded-full" />
        </span>
        <span>live</span>
      </span>
    </template>

    <div ref="scrollEl" class="bg-inset thin-scrollbar overflow-x-auto rounded-md px-[18px] py-4">
      <div
        class="mb-1 grid gap-[2px]"
        :style="{ gridTemplateColumns: `repeat(${monthLabels.length}, 10px)` }"
      >
        <ListRenderer v-slot="{ item }" :items="monthLabels">
          <div class="text-dim text-[0.59375rem] whitespace-nowrap">
            {{ item.label }}
          </div>
        </ListRenderer>
      </div>
      <div
        class="grid gap-[2px]"
        :style="{
          gridTemplateColumns: `repeat(${weeks.length}, 10px)`,
          gridTemplateRows: 'repeat(7, 10px)',
          gridAutoFlow: 'column',
        }"
      >
        <ListRenderer v-slot="{ item: day }" :items="days">
          <Tooltip theme="activity" :triggers="['hover', 'focus']">
            <div
              class="h-2.5 w-2.5 rounded-[2px]"
              tabindex="0"
              :aria-label="day.label"
              :style="{ background: day.bg }"
            ></div>
            <template #popper>
              <ActivityTooltip :date="day.date" :count="day.count" :detail="day.detail" />
            </template>
          </Tooltip>
        </ListRenderer>
      </div>
      <div class="mt-[14px] flex flex-wrap items-center justify-between gap-4">
        <div class="text-dim text-[0.71875rem]">{{ total }} contributions sur 12 mois</div>
        <div class="text-dim flex items-center gap-[5px] text-[0.71875rem]">
          <span>moins</span>
          <div class="flex items-center gap-[2px]">
            <ListRenderer v-slot="{ item }" :items="legendSteps">
              <div class="h-2.5 w-2.5 rounded-[2px]" :style="{ background: item.bg }"></div>
            </ListRenderer>
          </div>
          <span>plus</span>
        </div>
      </div>
    </div>
  </SectionCard>
</template>
