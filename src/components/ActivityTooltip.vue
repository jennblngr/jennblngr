<script setup lang="ts">
import type { ActivityDayDetail } from '@/types'

const props = defineProps<{
  date: Date
  count: number
  detail: ActivityDayDetail | null
}>()

const TYPE_ORDER = ['push', 'merge_request', 'commentaire', 'issue', 'autre'] as const
const TYPE_LABELS: Record<string, string> = {
  push: 'push',
  merge_request: 'merge request',
  commentaire: 'commentaire',
  issue: 'issue',
  autre: 'autre',
}

const dateLabel = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(props.date)

const breakdown = TYPE_ORDER.map((type) => ({
  key: type,
  label: TYPE_LABELS[type],
  value: props.detail?.gitlabByType?.[type] ?? 0,
})).filter((row) => row.value > 0)
</script>

<template>
  <div class="font-mono text-[0.71875rem]">
    <div class="text-fg mb-0.5 font-semibold capitalize">{{ dateLabel }}</div>
    <div class="text-dim mb-2">{{ count }} contribution{{ count > 1 ? 's' : '' }}</div>

    <div v-if="breakdown.length" class="border-line flex flex-col gap-[3px] border-t pt-2">
      <div v-for="row in breakdown" :key="row.key" class="flex items-center justify-between gap-5">
        <span class="text-dim flex items-center gap-[6px]">
          <span class="bg-accent inline-block h-[5px] w-[5px] rounded-full"></span>
          {{ row.label }}
        </span>
        <span class="text-fg">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>
