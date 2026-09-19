<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import emailjs from '@emailjs/browser'
import SectionCard from '@/components/SectionCard.vue'
import AppIcon from '@/components/AppIcon.vue'
import AppButton from '@/components/AppButton.vue'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// #region Data
const form = reactive({ name: '', email: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const status = ref<Status>('idle')

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
// #endregion

// #region Computed
const isSending = computed(() => status.value === 'sending')
const isConfigured = computed(() => Boolean(serviceId && templateId && publicKey))
// #endregion

// #region Functions
function borderClass(hasError: string): string {
  return hasError ? 'border-red-400' : 'border-line'
}

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'champ obligatoire'
  errors.email = !form.email.trim()
    ? 'champ obligatoire'
    : EMAIL_PATTERN.test(form.email)
      ? ''
      : 'format email invalide'
  errors.message = form.message.trim() ? '' : 'champ obligatoire'

  return !errors.name && !errors.email && !errors.message
}

async function handleSubmit(): Promise<void> {
  if (!isConfigured.value || isSending.value) return
  if (!validate()) return

  status.value = 'sending'
  try {
    await emailjs.send(
      serviceId,
      templateId,
      { from_name: form.name, from_email: form.email, message: form.message },
      { publicKey },
    )
    status.value = 'success'
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    status.value = 'error'
  }
}
// #endregion
</script>

<template>
  <SectionCard id="contact" label="contact">
    <form
      v-if="isConfigured"
      novalidate
      class="flex flex-col gap-[14px]"
      @submit.prevent="handleSubmit"
    >
      <div class="grid grid-cols-2 gap-[14px]">
        <label class="flex flex-col gap-[6px] text-[0.78125rem]">
          <span class="text-dim">nom</span>
          <input
            v-model="form.name"
            type="text"
            autocomplete="name"
            :class="borderClass(errors.name)"
            class="bg-inset text-fg focus:border-accent w-full rounded-[3px] border px-[10px] py-2 text-[0.8125rem] transition-colors duration-150 outline-none"
            @input="errors.name = ''"
          />
          <span v-if="errors.name" class="text-[0.71875rem] text-red-400">{{ errors.name }}</span>
        </label>

        <label class="flex flex-col gap-[6px] text-[0.78125rem]">
          <span class="text-dim">email</span>
          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            :class="borderClass(errors.email)"
            class="bg-inset text-fg focus:border-accent w-full rounded-[3px] border px-[10px] py-2 text-[0.8125rem] transition-colors duration-150 outline-none"
            @input="errors.email = ''"
          />
          <span v-if="errors.email" class="text-[0.71875rem] text-red-400">{{ errors.email }}</span>
        </label>
      </div>

      <label class="flex flex-col gap-[6px] text-[0.78125rem]">
        <span class="text-dim">message</span>
        <textarea
          v-model="form.message"
          rows="5"
          :class="borderClass(errors.message)"
          class="bg-inset text-fg focus:border-accent w-full resize-none rounded-[3px] border px-[10px] py-2 text-[0.8125rem] transition-colors duration-150 outline-none"
          @input="errors.message = ''"
        />
        <span v-if="errors.message" class="text-[0.71875rem] text-red-400">{{
          errors.message
        }}</span>
      </label>

      <div class="flex items-center gap-[14px]">
        <AppButton type="submit" :disabled="isSending">
          <AppIcon
            :name="isSending ? 'loader' : 'send'"
            :size="14"
            :class="isSending && 'animate-spin'"
          />
          {{ isSending ? 'envoi...' : 'envoyer' }}
        </AppButton>

        <span
          v-if="status === 'success'"
          class="text-accent inline-flex items-center gap-[6px] text-[0.78125rem]"
        >
          <AppIcon name="success" :size="14" />
          message envoyé
        </span>
        <span
          v-else-if="status === 'error'"
          class="inline-flex items-center gap-[6px] text-[0.78125rem] text-red-400"
        >
          <AppIcon name="error" :size="14" />
          échec de l'envoi, réessaie plus tard
        </span>
      </div>
    </form>

    <div v-else class="text-dim text-[0.8125rem]">contact indisponible pour le moment.</div>
  </SectionCard>
</template>
