import { onMounted, ref } from 'vue'
import type { ExperienceStatsPayload } from '@/types'

export function useExperienceStats() {
  // #region Data
  const stats = ref<ExperienceStatsPayload>({})
  // #endregion

  // #region Functions
  async function loadStats(): Promise<void> {
    try {
      const response = await fetch('/experience-stats.json')
      if (!response.ok) return
      stats.value = (await response.json()) as ExperienceStatsPayload
    } catch {
      // fichier absent : les valeurs de repli codées en dur restent affichées
    }
  }
  // #endregion

  // #region Lifecycles
  onMounted(loadStats)
  // #endregion

  return { stats }
}
