<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import emailjs from '@emailjs/browser'
import SectionHeading from '@/components/SectionHeading.vue'
import AppIcon from '@/components/AppIcon.vue'
import AppSvgIcon from '@/components/AppSvgIcon.vue'
import BaseButton from '@/components/BaseButton.vue'

type Status = 'idle' | 'sending' | 'success' | 'error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LABEL_CLASS = 'text-ink2 font-mono text-label tracking-[0.1em]'
const FIELD_CLASS =
  'bg-field text-ink w-full border-[1.5px] font-sans text-body outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const ERROR_CLASS = 'text-accent font-mono text-meta tracking-[0.06em]'

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
function borderClass(error: string): string {
  return error ? 'border-accent' : 'border-ink'
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
  <section id="contact" class="flex flex-col gap-5">
    <SectionHeading>/contact</SectionHeading>

    <form
      v-if="isConfigured"
      novalidate
      class="border-ink bg-surf flex flex-col gap-[22px] border-[1.5px] p-5 sm:p-8"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-wrap gap-5">
        <div class="flex flex-[1_1_260px] flex-col gap-2">
          <label for="contact-name" :class="LABEL_CLASS">NOM</label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            :aria-invalid="Boolean(errors.name)"
            :class="[FIELD_CLASS, borderClass(errors.name)]"
            class="h-12 px-[14px]"
            @input="errors.name = ''"
          />
          <span v-if="errors.name" :class="ERROR_CLASS">{{ errors.name }}</span>
        </div>

        <div class="flex flex-[1_1_260px] flex-col gap-2">
          <label for="contact-email" :class="LABEL_CLASS">EMAIL</label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :class="[FIELD_CLASS, borderClass(errors.email)]"
            class="h-12 px-[14px]"
            @input="errors.email = ''"
          />
          <span v-if="errors.email" :class="ERROR_CLASS">{{ errors.email }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="contact-message" :class="LABEL_CLASS">MESSAGE</label>
        <textarea
          id="contact-message"
          v-model="form.message"
          rows="5"
          :aria-invalid="Boolean(errors.message)"
          :class="[FIELD_CLASS, borderClass(errors.message)]"
          class="resize-y p-[14px]"
          @input="errors.message = ''"
        />
        <span v-if="errors.message" :class="ERROR_CLASS">{{ errors.message }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <BaseButton variant="primary" type="submit" :disabled="isSending">
          <AppIcon v-if="isSending" name="loader" :size="14" class="animate-spin" />
          <AppSvgIcon v-else name="send" />
          {{ isSending ? 'Envoi…' : 'Envoyer' }}
        </BaseButton>

        <span
          v-if="status === 'success'"
          role="status"
          class="text-sage text-label inline-flex items-center gap-1.5 font-mono tracking-[0.06em]"
        >
          <AppIcon name="success" :size="14" />
          Message envoyé, merci !
        </span>
        <span
          v-else-if="status === 'error'"
          role="alert"
          class="text-accent text-label inline-flex items-center gap-1.5 font-mono tracking-[0.06em]"
        >
          <AppIcon name="error" :size="14" />
          Échec de l'envoi, réessaie plus tard.
        </span>
      </div>
    </form>

    <div v-else class="border-ink bg-surf text-ink2 text-body border-[1.5px] p-8">
      Contact indisponible pour le moment.
    </div>
  </section>
</template>
