<script setup lang="ts">
import { SECTIONS } from '@/data/portfolio'

const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="border-line text-dim mt-14 flex flex-wrap justify-between gap-5 border-t pt-5 text-[0.71875rem]"
  >
    <div>jenny-lee boulanger © {{ year }} · all systems <span class="text-accent">[ok]</span></div>
    <div class="flex gap-3.5">
      <span
        ><span class="text-fg">1-{{ SECTIONS.length }}</span> jump</span
      >
      <span><span class="text-fg">l</span> light/dark</span>
      <span><span class="text-fg">g</span> top</span>
    </div>
  </footer>
</template>
