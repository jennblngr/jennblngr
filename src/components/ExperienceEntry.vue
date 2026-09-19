<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceGroup } from '@/types'
import ListRenderer from '@/components/ListRenderer.vue'

// #region Data
const props = defineProps<{
  experience: ExperienceGroup
}>()
// #endregion

// #region Computed
const statBlocks = computed(() => {
  const stats = props.experience.stats
  if (!stats) return []
  return [
    { label: 'issues fermées', value: `${stats.issuesClosed}` },
    { label: 'commentaires en MR', value: `~${stats.mrComments}` },
    { label: 'MR relues', value: `~${stats.mrReviewed}` },
  ]
})
// #endregion
</script>

<template>
  <div class="border-line mt-[14px] border-t py-5 first:mt-0 first:border-t-0 first:pt-0 last:pb-0">
    <div class="mb-3 flex flex-wrap items-baseline gap-[9px]">
      <span class="text-[0.9375rem] font-semibold">{{ experience.org }}</span>
    </div>

    <div v-if="statBlocks.length" class="mb-4">
      <div class="flex flex-wrap gap-3">
        <ListRenderer v-slot="{ item }" :items="statBlocks">
          <div class="border-line bg-inset min-w-[140px] flex-1 rounded-md border px-[18px] py-3.5">
            <div class="text-accent text-[1.25rem] leading-none font-bold">{{ item.value }}</div>
            <div class="text-dim mt-1.5 text-[0.6875rem]">{{ item.label }}</div>
          </div>
        </ListRenderer>
      </div>
      <p class="text-dim mt-2 text-[0.6875rem] italic">
        Données réelles, synchronisées automatiquement depuis l’API GitLab.
      </p>
    </div>

    <div class="flex flex-col gap-5">
      <ListRenderer v-slot="{ item: role }" :items="experience.roles">
        <div class="flex flex-wrap gap-5">
          <div class="flex-[1_1_150px]">
            <div class="text-dim text-[0.78125rem]">{{ role.period }}</div>
          </div>
          <div class="min-w-0 flex-[3_1_280px]">
            <div class="text-dim mb-2 text-[0.78125rem]">// {{ role.role }}</div>
            <div class="flex flex-col gap-[7px]">
              <ListRenderer v-slot="{ item: bullet }" :items="role.bullets">
                <div class="flex gap-2.5 text-[0.84375rem]">
                  <span class="text-dim flex-none">&gt;</span>
                  <span class="text-pretty">{{ bullet }}</span>
                </div>
              </ListRenderer>
            </div>
          </div>
        </div>
      </ListRenderer>
    </div>
  </div>
</template>
