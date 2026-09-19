<script setup lang="ts">
import { ref } from 'vue'
import { PROJECTS } from '@/data/portfolio'
import SectionCard from '@/components/SectionCard.vue'
import ListRenderer from '@/components/ListRenderer.vue'
import ProjectEntry from '@/components/ProjectEntry.vue'

// #region Data
const openIndex = ref<number | null>(null)
// #endregion

// #region Functions
function toggle(index: number): void {
  openIndex.value = openIndex.value === index ? null : index
}
// #endregion
</script>

<template>
  <SectionCard id="projects" label="projects">
    <div class="flex flex-col">
      <ListRenderer v-slot="{ item, index }" :items="PROJECTS">
        <ProjectEntry
          :project="item"
          :is-open="openIndex === index"
          @toggle="toggle(index)"
        />
      </ListRenderer>
    </div>
  </SectionCard>
</template>
