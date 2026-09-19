<script setup lang="ts">
import { SKILL_CATEGORIES } from '@/data/portfolio'
import SectionCard from '@/components/SectionCard.vue'
import ListRenderer from '@/components/ListRenderer.vue'
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <SectionCard id="skills" label="skills">
    <div class="flex flex-wrap gap-3.5">
      <ListRenderer v-slot="{ item: category }" :items="SKILL_CATEGORIES">
        <div class="bg-inset min-w-0 flex-[1_1_190px] rounded-md px-[18px] py-4">
          <div class="border-line text-dim mb-[11px] border-b pb-2 text-[0.71875rem]">
            {{ category.title }}
          </div>
          <div class="flex flex-col gap-[9px]">
            <ListRenderer v-slot="{ item }" :items="category.items">
              <div class="flex items-center gap-2 text-[0.8125rem]">
                <AppIcon :name="item.icon" class="text-dim" />
                {{ item.label }}
              </div>
            </ListRenderer>
          </div>
        </div>
      </ListRenderer>
    </div>
  </SectionCard>
</template>
