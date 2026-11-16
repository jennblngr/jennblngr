<script setup lang="ts">
import { computed } from 'vue'
import { EXPERIENCE } from '@/data/portfolio'
import { useExperienceStats } from '@/composables/useExperienceStats'
import SectionHeading from '@/components/SectionHeading.vue'
import ListRenderer from '@/components/ListRenderer.vue'
import ExperienceEntry from '@/components/ExperienceEntry.vue'

// #region Data
const { stats } = useExperienceStats()
// #endregion

// #region Computed
// Les chiffres viennent de la dernière synchronisation GitLab (public/experience-stats.json)
const experience = computed(() =>
  EXPERIENCE.map((group) => {
    const live = stats.value[group.org]
    if (!live) return group
    const { issuesClosed, mrComments, mrReviewed } = live
    return { ...group, stats: { issuesClosed, mrComments, mrReviewed } }
  }),
)
// #endregion
</script>

<template>
  <section id="experience" class="mb-[72px] flex flex-col gap-5">
    <SectionHeading>/experience</SectionHeading>
    <ListRenderer v-slot="{ item }" :items="experience">
      <ExperienceEntry :experience="item" />
    </ListRenderer>
  </section>
</template>
