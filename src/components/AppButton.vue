<script setup lang="ts">
type ButtonSize = 'small' | 'regular'

// #region Data
const props = withDefaults(
  defineProps<{
    size?: ButtonSize
    href?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    size: 'regular',
    href: undefined,
    type: 'button',
    disabled: false,
  },
)

// regular = small × 2 on both axes, so the two sizes share the same shape
const SIZE_CLASSES: Record<ButtonSize, string> = {
  small: 'px-2 py-1 text-[0.71875rem]',
  regular: 'px-4 py-2 text-[0.78125rem]',
}
// #endregion
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="!href ? type : undefined"
    :disabled="!href ? disabled : undefined"
    class="border-line text-dim hover:border-accent hover:text-accent inline-flex cursor-pointer items-center gap-2 rounded-[3px] border no-underline transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
    :class="SIZE_CLASSES[props.size]"
  >
    <slot />
  </component>
</template>
