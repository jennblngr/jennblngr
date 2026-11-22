<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'

// #region Data
defineProps<{
  src: string
  alt: string
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)
// #endregion

// #region Functions
function open(): void {
  dialogEl.value?.showModal()
}

function close(): void {
  dialogEl.value?.close()
}

/** Un clic n'importe où (fond ou image) ferme la lightbox, comme dans la plupart des visionneuses. */
function handleClick(): void {
  close()
}

defineExpose({ open, close })
// #endregion
</script>

<template>
  <!-- <dialog> natif : Échap, focus piégé et rendu du focus au déclencheur sont gérés par le navigateur -->
  <!-- @keydown.stop : les raccourcis de la page (Échap qui ferme le panneau, navigation) restent inactifs -->
  <dialog ref="dialogEl" class="lightbox" :aria-label="alt" @click="handleClick" @keydown.stop>
    <img :src="src" :alt="alt" class="lightbox-img" />
    <BaseButton class="lightbox-close" size="sm" aria-label="Fermer l'image" @click="close">
      <AppSvgIcon name="close" />
      Fermer
    </BaseButton>
  </dialog>
</template>

<style scoped>
.lightbox {
  /* Plein écran : le <dialog> sert de fond cliquable, l'image est centrée dedans */
  box-sizing: border-box;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 56px 16px 16px;
  border: 0;
  background: transparent;
  place-items: center;
  cursor: zoom-out;
  opacity: 0;
  transition:
    opacity var(--dur-base) var(--ease-move),
    overlay var(--dur-base) allow-discrete,
    display var(--dur-base) allow-discrete;
}

.lightbox[open] {
  display: grid;
  opacity: 1;
}

.lightbox::backdrop {
  background: rgb(12 11 10 / 0.88);
  opacity: 0;
  transition:
    opacity var(--dur-base) var(--ease-move),
    overlay var(--dur-base) allow-discrete,
    display var(--dur-base) allow-discrete;
}

.lightbox[open]::backdrop {
  opacity: 1;
}

.lightbox-img {
  display: block;
  max-width: min(100%, 1536px);
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 24px 64px -16px rgb(0 0 0 / 0.6);
  transform: scale(0.97);
  transition: transform var(--dur-base) var(--ease-move);
}

.lightbox[open] .lightbox-img {
  transform: none;
}

/* La croix reste lisible sur le fond sombre, quel que soit le thème */
.lightbox-close {
  position: absolute;
  top: 12px;
  right: 16px;
  border-color: #f1ede3;
  color: #f1ede3;
  cursor: pointer;
}

@starting-style {
  .lightbox[open],
  .lightbox[open]::backdrop {
    opacity: 0;
  }

  .lightbox[open] .lightbox-img {
    transform: scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lightbox,
  .lightbox::backdrop,
  .lightbox-img {
    transition: none;
  }
}
</style>
