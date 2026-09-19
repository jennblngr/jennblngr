import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { ThemeMode } from '@/types'

const STORAGE_KEY = 'theme-mode'

function getPreferredMode(): ThemeMode {
  try {
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
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
  const toggleLabel = computed<string>(() => (mode.value === 'dark' ? 'light_mode' : 'dark_mode'))
  // #endregion

  // #region Functions
  function toggle(): void {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }
  // #endregion

  // #region Watchers
  watch(mode, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — theme just won't persist
    }
  })
  // #endregion

  return { mode, toggleLabel, toggle }
})
