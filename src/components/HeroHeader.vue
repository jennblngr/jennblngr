<script setup lang="ts">
import { onMounted } from 'vue'
import { BOOT_MESSAGES, SOCIAL_LINKS } from '@/data/portfolio'
import { BOOT_LINE_DURATION_MS, STEP_MS, useBootStore } from '@/stores/boot'
import ListRenderer from '@/components/ListRenderer.vue'
import AppIcon from '@/components/AppIcon.vue'
import AppButton from '@/components/AppButton.vue'

// #region Data
const boot = useBootStore()
// #endregion

// #region Functions
function bootLineDelay(index: number): string {
  return `${((index * STEP_MS) / 1000).toFixed(2)}s`
}
// #endregion

// #region Lifecycles
onMounted(() => {
  const lastLineDelay = (BOOT_MESSAGES.length - 1) * STEP_MS
  setTimeout(boot.complete, lastLineDelay + BOOT_LINE_DURATION_MS)
})
// #endregion
</script>

<template>
  <header
    class="border-b pt-[52px] pb-[44px] transition-colors duration-300 ease-out"
    :class="boot.isBooted ? 'border-line' : 'border-transparent'"
  >
    <div class="text-dim mb-[30px] flex flex-col gap-[3px] text-[0.78125rem]">
      <ListRenderer v-slot="{ item, index }" :items="BOOT_MESSAGES">
        <div class="animate-bootin" :style="{ animationDelay: bootLineDelay(index) }">
          <span class="text-accent">[ok]</span> {{ item }}
        </div>
      </ListRenderer>
    </div>

    <div
      class="transition duration-300 ease-out"
      :class="
        boot.isBooted
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[3px] opacity-0'
      "
    >
      <div class="text-dim mb-[10px] text-[0.8125rem]">
        <span>jennblngr@portfolio</span><span>:~$ </span><span class="text-fg">whoami</span>
      </div>
      <div class="text-accent mb-[2px] inline-block text-[0.84375rem] font-medium">
        développeuse vue.js
      </div>
      <h1 class="m-0 mb-[6px] text-[1.875rem] font-bold tracking-[-0.01em]">
        Jenny-Lee Boulanger<span
          class="animate-blink bg-fg ml-2 inline-block h-[22px] w-[11px] align-[-3px]"
        ></span>
      </h1>

      <div class="flex flex-wrap gap-[10px]">
        <AppButton v-for="social in SOCIAL_LINKS" :key="social.href" :href="social.href">
          <AppIcon :name="social.icon" :size="14" />
          {{ social.label }}
        </AppButton>
      </div>
    </div>
  </header>
</template>
