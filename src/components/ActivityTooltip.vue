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

const github = props.detail?.github ?? 0
const gitlab = props.detail?.gitlab ?? 0

const gitlabBreakdown = TYPE_ORDER.map((type) => ({
  key: type,
  label: TYPE_LABELS[type],
  value: props.detail?.gitlabByType?.[type] ?? 0,
})).filter((row) => row.value > 0)
</script>

<template>
  <div class="font-mono text-[0.71875rem]">
    <div class="text-fg mb-0.5 font-semibold capitalize">{{ dateLabel }}</div>
    <div class="text-dim mb-2">{{ count }} contribution{{ count > 1 ? 's' : '' }}</div>

    <div v-if="github || gitlab" class="border-line flex flex-col gap-[3px] border-t pt-2">
      <div v-if="github" class="flex items-center justify-between gap-5">
        <span class="text-dim flex items-center gap-[6px]">
          <span class="bg-fg inline-block h-[5px] w-[5px] rounded-full"></span>
          GitHub
        </span>
        <span class="text-fg">{{ github }}</span>
      </div>

      <template v-if="gitlab">
        <div class="flex items-center justify-between gap-5">
          <span class="text-dim flex items-center gap-[6px]">
            <span class="bg-accent inline-block h-[5px] w-[5px] rounded-full"></span>
            GitLab
          </span>
          <span class="text-fg">{{ gitlab }}</span>
        </div>
        <div
          v-for="row in gitlabBreakdown"
          :key="row.key"
          class="flex items-center justify-between gap-5 pl-[11px]"
        >
          <span class="text-dim">{{ row.label }}</span>
          <span class="text-dim">{{ row.value }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
