<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'sm'

// #region Data
const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    selected?: boolean
    /** Bouton icône seule : `aria-label` obligatoire côté appelant. */
    iconOnly?: boolean
    href?: string
    /** Lien externe : ouvre dans un nouvel onglet. */
    external?: boolean
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Rendu non interactif (ex. dans une carte déjà cliquable). */
    decorative?: boolean
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    selected: false,
    iconOnly: false,
    href: undefined,
    external: false,
    type: 'button',
    disabled: false,
    decorative: false,
  },
)
// #endregion

// #region Computed
const tag = computed(() => (props.decorative ? 'span' : props.href ? 'a' : 'button'))

const classes = computed(() => [
  'btn',
  {
    'btn--primary': props.variant === 'primary',
    'btn--sm': props.size === 'sm',
    'btn--icon': props.iconOnly,
    'is-sel': props.selected,
  },
])

const attrs = computed(() => {
  if (tag.value === 'a') {
    return props.external
      ? { href: props.href, target: '_blank', rel: 'noreferrer' }
      : { href: props.href }
  }
  if (tag.value === 'button') return { type: props.type, disabled: props.disabled }
  return { 'aria-hidden': 'true' }
})
// #endregion
</script>

<template>
  <component :is="tag" :class="classes" v-bind="attrs">
    <slot />
  </component>
</template>
