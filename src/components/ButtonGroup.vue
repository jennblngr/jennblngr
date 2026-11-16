<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Passe à la ligne sur petit écran en gardant les bordures fusionnées. */
    wrap?: boolean
    tag?: string
  }>(),
  { wrap: false, tag: 'div' },
)
</script>

<template>
  <component :is="tag" class="btn-group" :class="{ 'btn-group--wrap': wrap }">
    <slot />
  </component>
</template>
