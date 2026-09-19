<script setup lang="ts">
import { computed } from 'vue'
import { EXPERIENCE } from '@/data/portfolio'
import { useExperienceStats } from '@/composables/useExperienceStats'
import SectionCard from '@/components/SectionCard.vue'
import ListRenderer from '@/components/ListRenderer.vue'
import ExperienceEntry from '@/components/ExperienceEntry.vue'

// #region Data
const { stats } = useExperienceStats()
// #endregion

// #region Computed
// Remplace les stats codées en dur par la dernière synchronisation GitLab quand elle est
// disponible ; sinon les valeurs de repli de src/data/portfolio.ts restent affichées.
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
  <SectionCard id="experience" label="experience">
    <div>
      <ListRenderer v-slot="{ item }" :items="experience">
        <ExperienceEntry :experience="item" />
      </ListRenderer>
    </div>
  </SectionCard>
</template>
