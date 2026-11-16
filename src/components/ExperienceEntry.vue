<script setup lang="ts">
import { computed } from 'vue'
import type { ExperienceGroup } from '@/types'
import { formatDuration, formatPeriod, monthsBetween } from '@/utils/dates'

// #region Data
const props = defineProps<{
  experience: ExperienceGroup
}>()

const MONO_LABEL = 'font-mono text-label tracking-[0.08em] uppercase'
// #endregion

// #region Computed
const duration = computed(() =>
  formatDuration(monthsBetween(props.experience.start, props.experience.end)),
)
const period = computed(() => formatPeriod(props.experience.start, props.experience.end))
const isTimeline = computed(() => props.experience.roles.length > 1)

const statBlocks = computed(() => {
  const stats = props.experience.stats
  if (!stats) return []
  return [
    { label: 'issues fermées', value: `${stats.issuesClosed}` },
    { label: 'commentaires en MR', value: `~${stats.mrComments}` },
    { label: 'MR relues', value: `~${stats.mrReviewed}` },
  ]
})

const roles = computed(() =>
  props.experience.roles.map((role) => ({
    ...role,
    isCurrent: !role.end,
    meta: `${formatPeriod(role.start, role.end)} · ${formatDuration(monthsBetween(role.start, role.end))}`,
  })),
)
// #endregion
</script>

<template>
  <div class="border-ink border-[1.5px]">
    <div
      class="border-ink flex flex-wrap items-center gap-[18px] border-b-[1.5px] px-5 py-6 sm:px-7"
    >
      <span
        class="border-ink text-h4 flex h-[54px] w-[54px] items-center justify-center border-[1.5px] font-bold"
        :class="experience.tone === 'sage' && 'bg-sage text-white'"
        aria-hidden="true"
        >{{ experience.initial }}</span
      >
      <div class="flex flex-[1_1_240px] flex-col gap-1">
        <h3 class="text-h3 m-0 leading-[1.15] font-bold tracking-[-0.01em]">
          {{ experience.name }}
        </h3>
        <span class="text-muted" :class="MONO_LABEL">{{ duration }}</span>
      </div>
      <span class="border-ink border-[1.5px] px-3 py-1.5" :class="MONO_LABEL">{{ period }}</span>
    </div>

    <div v-if="statBlocks.length" class="border-ink bg-surf border-b-[1.5px]">
      <div class="grid grid-cols-3">
        <div
          v-for="stat in statBlocks"
          :key="stat.label"
          class="flex flex-col items-center gap-1 px-3 py-[22px] text-center"
        >
          <span class="text-accent text-stat leading-[1.1] font-bold tracking-[-0.02em]">{{
            stat.value
          }}</span>
          <span class="text-muted" :class="MONO_LABEL">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <template v-if="isTimeline">
      <!--
        Frise : chaque rond est centré sur le titre de son poste. Le rond et ses traits sont
        positionnés depuis le titre, dans la gouttière (--rail) ; l'article rogne les traits.
      -->
      <article
        v-for="(role, index) in roles"
        :key="role.title"
        class="flex overflow-hidden [--rail:56px] sm:[--rail:76px]"
      >
        <div aria-hidden="true" class="flex-[0_0_var(--rail)]"></div>
        <div
          class="flex min-w-0 flex-auto flex-col gap-3.5 pr-5 sm:pr-7"
          :class="index === 0 ? 'pt-7 pb-6' : 'pt-6 pb-7'"
        >
          <div class="flex flex-wrap items-center gap-[10px]" :class="MONO_LABEL">
            <span v-if="role.isCurrent" class="bg-accent px-2 py-[3px] font-bold text-white"
              >ACTUEL</span
            >
            <span class="text-muted">{{ role.meta }}</span>
          </div>
          <div class="relative">
            <span
              aria-hidden="true"
              class="absolute top-1/2 left-[calc(var(--rail)/-2)] -translate-x-1/2 -translate-y-1/2"
            >
              <span
                v-if="index > 0"
                class="bg-ink absolute bottom-1/2 left-1/2 h-[100vh] w-0.5 -translate-x-1/2"
              ></span>
              <span
                v-if="index < roles.length - 1"
                class="bg-ink absolute top-1/2 left-1/2 h-[100vh] w-0.5 -translate-x-1/2"
              ></span>
              <span
                class="border-ink relative block h-4 w-4 rounded-full border-[1.5px]"
                :class="role.isCurrent ? 'bg-accent' : 'bg-bg'"
              ></span>
            </span>
            <h4 class="text-h4 m-0 leading-[1.2] font-bold">{{ role.title }}</h4>
          </div>
          <ul
            v-if="role.bullets"
            class="text-ink3 text-body m-0 flex list-disc flex-col gap-[10px] pl-5 leading-[1.55]"
          >
            <li v-for="bullet in role.bullets" :key="bullet">{{ bullet }}</li>
          </ul>
          <div
            v-if="role.tags"
            class="text-ink2 text-meta flex flex-wrap gap-2 font-mono tracking-[0.08em] uppercase"
          >
            <span
              v-for="tag in role.tags"
              :key="tag"
              class="border-line2 border-[1.5px] px-[9px] py-1"
              >{{ tag }}</span
            >
          </div>
        </div>
      </article>
    </template>

    <template v-else>
      <article
        v-for="role in roles"
        :key="role.title"
        class="flex flex-col gap-3 px-5 pt-6 pb-7 sm:pr-7 sm:pl-[104px]"
      >
        <h4 class="text-h4 m-0 leading-[1.2] font-bold">{{ role.title }}</h4>
        <p v-if="role.summary" class="text-ink3 text-body m-0 leading-[1.55]">
          {{ role.summary }}
        </p>
        <ul
          v-if="role.bullets"
          class="text-ink3 text-body m-0 flex list-disc flex-col gap-[10px] pl-5 leading-[1.55]"
        >
          <li v-for="bullet in role.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </article>
    </template>
  </div>
</template>
