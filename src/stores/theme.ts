import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ThemeMode } from '@/types'

const STORAGE_KEY = 'theme-mode'
/** --dur-base + marge, pour retirer la classe une fois la transition finie. */
const SWITCH_MS = 260

let switchTimer = 0

function getPreferredMode(): ThemeMode {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage unavailable — fall through to the browser preference
  }
  return getPreferredMode()
}

export const useThemeStore = defineStore('theme', () => {
  // #region Data
  const mode = ref<ThemeMode>(getInitialMode())
  // #endregion

  // #region Computed
  const isDark = computed<boolean>(() => mode.value === 'dark')
  const toggleLabel = computed<string>(() =>
    isDark.value ? 'Passer en thème clair' : 'Passer en thème sombre',
  )
  // #endregion

  // #region Functions
  function toggle(): void {
    // Transition des couleurs le temps de la bascule (voir .theme-switching dans style.css)
    const root = document.documentElement
    root.classList.add('theme-switching')
    window.clearTimeout(switchTimer)
    switchTimer = window.setTimeout(() => root.classList.remove('theme-switching'), SWITCH_MS)
    mode.value = isDark.value ? 'light' : 'dark'
  }
  // #endregion

  // #region Watchers
  watch(
    mode,
    (value) => {
      document.documentElement.setAttribute('data-theme', value)
    },
    { immediate: true },
  )

  watch(mode, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — theme just won't persist
    }
  })
  // #endregion

  return { mode, isDark, toggleLabel, toggle }
})
