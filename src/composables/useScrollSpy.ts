import { onMounted, onUnmounted, ref } from 'vue'
import type { SectionLink } from '@/types'

/** Ligne de lecture : une section devient active quand son haut passe au-dessus de ce ratio du viewport. */
const READING_LINE = 0.35

export function useScrollSpy(sections: readonly SectionLink[]) {
  // #region Data
  const activeId = ref<string>(sections[0]?.id ?? '')
  let frame = 0
  // #endregion

  // #region Functions
  function update(): void {
    frame = 0
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    if (scrolledToBottom) {
      activeId.value = sections[sections.length - 1].id
      return
    }

    const line = window.innerHeight * READING_LINE
    let current = sections[0].id
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el && el.getBoundingClientRect().top <= line) current = section.id
    }
    activeId.value = current
  }

  function schedule(): void {
    if (!frame) frame = requestAnimationFrame(update)
  }
  // #endregion

  // #region Lifecycles
  onMounted(() => {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  })
  // #endregion

  return { activeId }
}
