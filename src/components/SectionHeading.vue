<template>
  <div
    class="flex flex-wrap justify-between gap-4"
    :class="$slots.actions ? 'items-end' : 'items-baseline'"
  >
    <h2 class="text-h2 m-0 leading-[1.1] font-bold tracking-[-0.02em]">
      <slot />
    </h2>
    <span v-if="$slots.meta" class="text-muted text-label font-mono tracking-[0.08em] uppercase">
      <slot name="meta" />
    </span>
    <!-- Boutons à droite du titre : défilent sur mobile, marge de 4 px pour le focus soulevé -->
    <div
      v-if="$slots.actions"
      class="-m-1 max-w-[calc(100%+8px)] min-w-0 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
