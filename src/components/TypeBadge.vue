<script setup lang="ts">
import type { ProjectType } from '@/types'

defineProps<{
  type: ProjectType
}>()

const TYPE_CLASSES: Record<ProjectType, string> = {
  web: '',
  mobile: 'bg-sage text-white',
  pwa: 'bg-accent text-white',
  extension: 'bg-slate text-white',
  script: 'bg-ink text-bg',
}
</script>

<template>
  <span
    class="border-ink text-micro border-[1.2px] px-2 py-[2.4px] font-mono leading-[1.4] font-bold tracking-[0.1em] uppercase"
    :class="TYPE_CLASSES[type]"
    >{{ type }}</span
  >
</template>
