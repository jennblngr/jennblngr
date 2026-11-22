<script lang="ts">
/** Icônes trait de la maquette (24 × 24, trait 2.2, couleur du texte). */
export type SvgIconName =
  'send' | 'external' | 'code' | 'plus' | 'minus' | 'close' | 'moon' | 'sun' | 'zoom'
</script>

<script setup lang="ts">
defineProps<{
  name: SvgIconName
}>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="name === 'moon' || name === 'sun' ? 2 : 2.2"
    stroke-linejoin="round"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <template v-if="name === 'send'">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </template>
    <template v-else-if="name === 'external'">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </template>
    <template v-else-if="name === 'code'">
      <path d="M8 6l-6 6 6 6" />
      <path d="M16 6l6 6-6 6" />
      <path d="M14 3l-4 18" />
    </template>
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <path v-else-if="name === 'minus'" d="M5 12h14" />
    <path v-else-if="name === 'close'" d="M6 6l12 12M18 6L6 18" />
    <template v-else-if="name === 'zoom'">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5-5M11 8v6M8 11h6" />
    </template>
    <path v-else-if="name === 'moon'" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"
      />
    </template>
  </svg>
</template>
