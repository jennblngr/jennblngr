import { ref } from 'vue'
import { defineStore } from 'pinia'

export const STEP_MS = 100
export const BOOT_LINE_DURATION_MS = 300

export const useBootStore = defineStore('boot', () => {
  // #region Data
  const isBooted = ref(false)
  // #endregion

  // #region Functions
  function complete(): void {
    isBooted.value = true
  }
  // #endregion

  return { isBooted, complete }
})
