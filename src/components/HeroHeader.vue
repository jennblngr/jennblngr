<script setup lang="ts">
import { CAREER_START, SOCIAL_LINKS } from '@/data/portfolio'
import { monthsBetween } from '@/utils/dates'
import AppIcon from '@/components/AppIcon.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'
import BaseButton from '@/components/BaseButton.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'

// #region Data
const years = Math.floor(monthsBetween(CAREER_START) / 12)
// #endregion
</script>

<template>
  <section class="border-ink flex flex-wrap gap-8 border-b-[1.5px] pt-14 pb-12">
    <div
      class="flex flex-none flex-col items-center gap-1.5"
      :aria-label="`${years} ans d'expérience`"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        aria-hidden="true"
        class="text-accent -mt-[3px] block"
      >
        <path d="M6 15l6-6 6 6" />
      </svg>
      <span class="text-accent text-lead font-mono font-bold" aria-hidden="true">{{ years }}</span>
      <span class="text-muted text-micro font-mono tracking-[0.08em]" aria-hidden="true">ANS</span>
    </div>

    <div class="flex min-w-0 flex-[1_1_560px] flex-col gap-[22px]">
      <div class="text-muted text-mono font-mono tracking-[0.08em]">DÉVELOPPEUSE FRONT-END</div>
      <h1 class="text-display m-0 leading-[0.95] font-bold tracking-[-0.035em]">
        Jenny-Lee<br />Boulanger
      </h1>

      <div class="flex flex-wrap items-center gap-3">
        <ButtonGroup wrap>
          <BaseButton variant="primary" href="#contact">
            <AppSvgIcon name="send" />
            Me contacter
          </BaseButton>
          <BaseButton
            v-for="social in SOCIAL_LINKS"
            :key="social.href"
            :href="social.href"
            external
          >
            <AppIcon :name="social.icon" :size="14" aria-hidden="true" />
            {{ social.label }}
          </BaseButton>
        </ButtonGroup>
        <span class="chip chip--sage">
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" class="block flex-none">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
          Disponible
        </span>
      </div>
    </div>
  </section>
</template>
