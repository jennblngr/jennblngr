<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectItem } from '@/types'
import TypeBadge from '@/components/TypeBadge.vue'
import BaseButton from '@/components/BaseButton.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'

// #region Data
defineProps<{
  project: ProjectItem
  /** ≥ 840 px : 2 colonnes, la gauche alignée sur la bordure entre les cartes 2 et 3. */
  wide: boolean
}>()

defineEmits<{
  close: []
}>()

const lightbox = ref<InstanceType<typeof ImageLightbox> | null>(null)
// #endregion
</script>

<template>
  <div class="border-ink bg-surf flex flex-wrap border-r-[1.2px] border-b-[1.2px]">
    <div
      class="pj-col border-ink flex min-w-0 flex-col gap-3 p-5 sm:p-7"
      :class="
        wide ? 'flex-[0_0_calc(50%+0.4px)] border-r-[1.2px]' : 'flex-[1_1_100%] border-b-[1.2px]'
      "
    >
      <div
        v-if="project.type === 'script' && project.terminal"
        class="bg-ph text-label flex h-[240px] flex-col p-[17.6px] font-mono leading-[1.8] text-[#c9c2b5]"
      >
        <span v-for="(line, i) in project.terminal" :key="i">{{ line }}</span>
      </div>
      <template v-else>
        <!-- Clic sur l'aperçu : l'image s'ouvre en grand dans une lightbox -->
        <button
          v-if="project.image"
          type="button"
          class="pj-zoom bg-ph group relative block h-[192px] w-full cursor-zoom-in overflow-hidden sm:h-[240px]"
          :aria-label="`Agrandir la capture du projet ${project.name}`"
          @click="lightbox?.open()"
        >
          <img
            :src="project.image"
            :alt="`Capture du projet ${project.name}`"
            class="block h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            class="border-ink bg-surf text-ink absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center border-[1.2px] transition-transform duration-[var(--dur-fast)] group-hover:scale-110 [&>svg]:h-4 [&>svg]:w-4"
          >
            <AppSvgIcon name="zoom" />
          </span>
        </button>
        <div v-else class="bg-ph h-[192px] sm:h-[240px]"></div>
        <ImageLightbox
          v-if="project.image"
          ref="lightbox"
          :src="project.image"
          :alt="`Capture du projet ${project.name}`"
        />
        <div v-if="project.gallery?.length" class="grid grid-cols-3 gap-3">
          <div v-for="src in project.gallery.slice(0, 3)" :key="src" class="bg-ph h-[60.8px]">
            <img :src="src" alt="" loading="lazy" class="block h-full w-full object-cover" />
          </div>
        </div>
      </template>
    </div>

    <div
      class="pj-col flex min-w-0 flex-col gap-5 p-5 sm:p-7"
      :class="wide ? 'flex-[1_1_0]' : 'flex-[1_1_100%]'"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-2">
          <span class="flex flex-wrap items-center gap-[8px]">
            <TypeBadge :type="project.type" />
            <span class="text-muted text-meta font-mono">{{ project.year }}</span>
          </span>
          <h3
            class="text-title-sm sm:text-stat-sm m-0 leading-[1.05] font-bold tracking-[-0.02em] break-words"
          >
            {{ project.name }}
          </h3>
        </div>
        <BaseButton size="sm" @click="$emit('close')">
          <AppSvgIcon name="close" />
          Fermer
        </BaseButton>
      </div>

      <p class="text-ink3 text-body m-0 leading-[1.55]">{{ project.desc }}</p>

      <div class="flex flex-col gap-2">
        <span class="text-meta font-mono font-bold tracking-[0.1em]">MON RÔLE</span>
        <ul
          class="text-ink3 text-small m-0 flex list-disc flex-col gap-1.5 pl-[14.4px] leading-[1.5]"
        >
          <li v-for="item in project.did" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-meta font-mono font-bold tracking-[0.1em]">STACK</span>
        <span class="text-ink2 text-meta flex flex-wrap gap-1.5 font-mono">
          <span
            v-for="tech in project.stack"
            :key="tech"
            class="border-line2 border px-2 py-[2.4px]"
            >{{ tech }}</span
          >
        </span>
      </div>

      <!-- p-1 -m-1 : marge pour le focus soulevé -->
      <ButtonGroup wrap class="-m-1 mt-auto self-start p-1">
        <BaseButton variant="primary" :href="project.url" external>
          {{ project.primaryLabel }}
          <AppSvgIcon name="external" />
        </BaseButton>
        <BaseButton v-for="repo in project.repos" :key="repo.href" :href="repo.href" external>
          <AppSvgIcon name="code" />
          {{ repo.label }}
        </BaseButton>
      </ButtonGroup>
    </div>
  </div>
</template>
