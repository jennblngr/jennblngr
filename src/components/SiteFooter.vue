<script setup lang="ts">
import { SECTIONS } from '@/data/portfolio'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-ink border-t-[1.5px]">
    <div
      class="text-muted text-label mx-auto flex max-w-[1120px] flex-wrap justify-between gap-4 px-6 py-[22px] font-mono"
    >
      <span>jenny-lee boulanger © {{ year }}</span>
      <span>1–{{ SECTIONS.length }} sections · L clair/sombre · G haut</span>
    </div>
  </footer>
</template>
