<script setup lang="ts" generic="T">
defineProps<{
  items: readonly T[]
}>()

defineSlots<{
  default(props: { item: T; index: number }): unknown
}>()
</script>

<template>
  <template v-for="(item, index) in items" :key="index">
    <slot :item="item" :index="index" />
  </template>
</template>
