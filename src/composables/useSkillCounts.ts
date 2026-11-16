import { onMounted, ref } from 'vue'
import type { SkillCountsData } from '@/types'

/** Nombre de dépôts GitHub par techno, généré par scripts/sync-skills.mjs. */
export function useSkillCounts() {
  // #region Data
  const counts = ref<Record<string, number>>({})
  // #endregion

  // #region Functions
  async function loadCounts(): Promise<void> {
    try {
      const response = await fetch('/skills.json')
      if (!response.ok) return
      counts.value = ((await response.json()) as SkillCountsData).counts
    } catch {
      // fichier absent : les technos s'affichent sans chiffre
    }
  }
  // #endregion

  // #region Lifecycles
  onMounted(loadCounts)
  // #endregion

  return { counts }
}
