<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { SECTIONS } from '@/data/portfolio'
import AppButton from '@/components/AppButton.vue'

// #region Data
const theme = useThemeStore()
// #endregion
</script>

<template>
  <nav
    class="border-line bg-nav-bg sticky top-0 z-5 flex flex-wrap items-center justify-between gap-4 border-b py-4 backdrop-blur-[8px] transition-colors duration-300 ease-out"
  >
    <div class="flex flex-wrap gap-4 text-[0.78125rem]">
      <a
        v-for="(section, idx) in SECTIONS"
        :key="section.id"
        :href="`#${section.id}`"
        class="text-dim hover:text-accent flex gap-1.5 no-underline transition-colors duration-150"
      >
        <span class="opacity-[.55]">{{ idx + 1 }}</span
        >{{ section.label }}
      </a>
    </div>
    <AppButton size="small" @click="theme.toggle">
      {{ theme.toggleLabel }}
    </AppButton>
  </nav>
</template>
