<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    marginTopClass?: string
    paddingBottomClass?: string
  }>(),
  {
    marginTopClass: 'mt-[34px]',
    paddingBottomClass: 'pb-[30px]',
  },
)
</script>

<template>
  <section
    :id="id"
    :class="[
      'border-line relative z-0 scroll-mt-[70px] rounded-lg border px-6 pt-[30px] has-[.group:hover]:z-10',
      marginTopClass,
      paddingBottomClass,
    ]"
  >
    <div class="absolute -top-[13px] left-5 flex items-center gap-2">
      <span class="bg-bg px-[9px] transition-colors duration-300 ease-out">
        <span class="text-accent inline-block text-[0.84375rem] font-semibold">$ {{ label }}</span>
      </span>
      <span v-if="$slots.badge" class="bg-bg px-[9px] transition-colors duration-300 ease-out">
        <slot name="badge" />
      </span>
    </div>
    <slot />
  </section>
</template>
