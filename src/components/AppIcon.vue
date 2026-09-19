<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ICONS, type IconName } from '@/data/icons'

// #region Data
const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
  }>(),
  {
    size: 15,
  },
)
// #endregion

// #region Computed
const entry = computed(() => ICONS[props.name])
// #endregion
</script>

<template>
  <FontAwesomeIcon
    v-if="entry.kind === 'fa'"
    :icon="entry.icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    class="flex-none"
  />
  <component :is="entry.icon" v-else :size="size" :stroke-width="1.7" class="flex-none" />
</template>
