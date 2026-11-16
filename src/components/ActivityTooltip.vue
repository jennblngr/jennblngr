<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityDay } from '@/types'
import { isoWeek } from '@/composables/useActivityHeatmap'

// #region Data
const props = defineProps<{
  day: ActivityDay
  streak: number
  isTop: boolean
}>()

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
// #endregion

// #region Computed
const dateLabel = computed(() => DATE_FORMAT.format(props.day.date).toUpperCase())
const week = computed(() => isoWeek(props.day.date))
const gitlab = computed(() => props.day.detail?.gitlab ?? 0)
const github = computed(() => props.day.detail?.github ?? 0)
const gitlabPct = computed(() =>
  props.day.count ? `${Math.round((gitlab.value / props.day.count) * 100)}%` : '0%',
)

// Répartition par type : seules les données GitLab sont détaillées
const breakdown = computed(() => {
  const byType = props.day.detail?.gitlabByType ?? {}
  return [
    { key: 'commits', label: 'COMMITS', value: byType.push ?? 0 },
    { key: 'mrs', label: 'MR', value: byType.merge_request ?? 0 },
    { key: 'reviews', label: 'REVIEWS', value: byType.commentaire ?? 0 },
    { key: 'issues', label: 'ISSUES', value: byType.issue ?? 0 },
  ]
})

const streakLabel = computed(() => {
  if (props.streak > 1) return `SÉRIE · ${props.streak} JOURS`
  return props.streak === 1 ? 'SÉRIE · 1 JOUR' : 'SÉRIE · 0'
})
// #endregion
</script>

<template>
  <div class="border-ink bg-field flex flex-col border-[1.5px] shadow-[5px_5px_0_var(--ink)]">
    <div
      class="border-ink text-meta flex items-center justify-between border-b-[1.5px] px-[14px] py-[10px] font-mono tracking-[0.08em]"
    >
      <span class="font-bold">{{ dateLabel }}</span>
      <span class="text-muted">SEM. {{ week }}</span>
    </div>

    <div v-if="day.count" class="flex flex-col gap-3 px-[14px] pt-[14px] pb-3">
      <div class="flex items-baseline gap-2">
        <span class="text-title leading-none font-bold tracking-[-0.03em]">{{ day.count }}</span>
        <span class="text-ink2 text-small">contribution{{ day.count > 1 ? 's' : '' }}</span>
      </div>
      <div class="border-ink flex h-[10px] border-[1.5px]">
        <span class="bg-accent" :style="{ width: gitlabPct }"></span>
        <span class="bg-ink flex-auto"></span>
      </div>
      <div class="text-meta flex justify-between font-mono">
        <span class="flex items-center gap-1.5">
          <span class="bg-accent h-[9px] w-[9px]"></span>GitLab <b>{{ gitlab }}</b>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="bg-ink h-[9px] w-[9px]"></span>GitHub <b>{{ github }}</b>
        </span>
      </div>
      <div
        v-if="gitlab"
        class="border-line2 text-ink2 text-micro flex border-t border-dashed pt-[10px] font-mono tracking-[0.06em]"
      >
        <span
          v-for="item in breakdown"
          :key="item.key"
          class="flex flex-1 basis-0 flex-col gap-0.5"
        >
          <b class="text-ink text-mono">{{ item.value }}</b
          >{{ item.label }}
        </span>
      </div>
    </div>

    <div v-else class="flex flex-col gap-1 p-[14px]">
      <span class="text-lead font-bold">Pas de commit ce jour-là.</span>
      <span class="text-ink2 text-mono italic">Même les pipelines se reposent.</span>
    </div>

    <div
      class="border-ink text-micro flex items-center justify-between gap-3 border-t-[1.5px] px-[14px] py-2 font-mono tracking-[0.08em]"
      :class="isTop ? 'bg-sage text-white' : 'bg-bg text-ink2'"
    >
      <span class="whitespace-nowrap">{{ streakLabel }}</span>
      <span v-if="isTop" class="whitespace-nowrap">★ TOP DE LA SEMAINE</span>
    </div>
  </div>
</template>
