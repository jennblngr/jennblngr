<script setup lang="ts">
import { SECTIONS } from '@/data/portfolio'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-ink border-t-[1.2px]">
    <div
      class="text-muted text-label mx-auto flex max-w-[896px] flex-wrap justify-between gap-4 px-6 py-[17.6px] font-mono"
    >
      <span>jenny-lee boulanger © {{ year }}</span>
      <span>1–{{ SECTIONS.length }} sections · L clair/sombre · G haut</span>
    </div>
  </footer>
</template>
