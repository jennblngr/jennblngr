<script setup lang="ts">
import { ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { SECTIONS } from '@/data/portfolio'
import BaseButton from '@/components/BaseButton.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'

// #region Data
const theme = useThemeStore()
const { activeId } = useScrollSpy(SECTIONS)
const scrollEl = ref<HTMLElement | null>(null)
// #endregion

// #region Watchers
// Sur mobile les onglets défilent : on garde l'onglet actif visible
watch(activeId, (id) => {
  const container = scrollEl.value
  const tab = container?.querySelector<HTMLElement>(`[href="#${id}"]`)
  if (!container || !tab || container.scrollWidth <= container.clientWidth) return
  const left = tab.offsetLeft - container.offsetLeft - 4
  container.scrollTo({ left, behavior: 'smooth' })
})
// #endregion
</script>

<template>
  <header class="border-ink bg-bg sticky top-0 z-30 border-b-[1.2px]">
    <div class="mx-auto flex max-w-[896px] items-center justify-between gap-5 px-6 py-[11.2px]">
      <!-- padding 4 px : laisse la place au focus soulevé, qui sinon serait rogné -->
      <div
        ref="scrollEl"
        class="-m-1 min-w-0 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden"
      >
        <ButtonGroup tag="nav" aria-label="Sections" class="w-max">
          <BaseButton
            v-for="section in SECTIONS"
            :key="section.id"
            :href="`#${section.id}`"
            :selected="activeId === section.id"
            :aria-current="activeId === section.id ? 'location' : undefined"
          >
            {{ section.label }}
          </BaseButton>
        </ButtonGroup>
      </div>

      <BaseButton icon-only :aria-label="theme.toggleLabel" @click="theme.toggle">
        <AppSvgIcon :name="theme.isDark ? 'sun' : 'moon'" />
      </BaseButton>
    </div>
  </header>
</template>
