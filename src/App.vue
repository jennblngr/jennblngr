<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { STEP_MS, useBootStore } from '@/stores/boot'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import { SECTIONS } from '@/data/portfolio'
import NavBar from '@/components/NavBar.vue'
import HeroHeader from '@/components/HeroHeader.vue'
import ActivitySection from '@/components/ActivitySection.vue'
import SkillsSection from '@/components/SkillsSection.vue'
import ExperienceSection from '@/components/ExperienceSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

// #region Data
const theme = useThemeStore()
const boot = useBootStore()
// #endregion

// #region Functions
function sectionDelay(index: number): string {
  return `${index * STEP_MS}ms`
}
// #endregion

// #region Lifecycles
useKeyboardNavigation(SECTIONS)
// #endregion
</script>

<template>
  <div
    id="app-root"
    :data-theme="theme.mode"
    class="bg-bg text-fg min-h-screen font-mono text-[0.875rem] leading-[1.65] transition-colors duration-300 ease-out"
  >
    <div class="mx-auto max-w-[850px] px-8 pb-24">
      <NavBar />
      <HeroHeader />
      <ActivitySection
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(1) }"
      />
      <SkillsSection
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(2) }"
      />
      <ExperienceSection
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(3) }"
      />
      <ProjectsSection
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(4) }"
      />
      <ContactSection
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(5) }"
      />
      <SiteFooter
        class="transition-[opacity,transform] duration-300 ease-out"
        :class="
          boot.isBooted
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-[3px] opacity-0'
        "
        :style="{ transitionDelay: sectionDelay(6) }"
      />
    </div>
  </div>
</template>
