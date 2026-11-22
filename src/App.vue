<script setup lang="ts">
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

// #region Lifecycles
useKeyboardNavigation(SECTIONS)
// #endregion
</script>

<template>
  <div class="bg-bg text-ink text-body min-h-screen font-sans leading-[1.55]">
    <NavBar />
    <main id="top" class="mx-auto max-w-[896px] px-6 pb-16">
      <HeroHeader />
      <ActivitySection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </main>
    <SiteFooter />
  </div>
</template>
