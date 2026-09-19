import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { SectionLink } from '@/types'

const SCROLL_OFFSET = 66

export function useKeyboardNavigation(sections: readonly SectionLink[]): void {
  // #region Data
  const theme = useThemeStore()
  // #endregion

  // #region Functions
  function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
  }

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function scrollToSection(id: string): void {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isEditableTarget(event.target)) return

    const key = event.key.toLowerCase()
    if (key === 'l') {
      theme.toggle()
      return
    }
    if (key === 'g') {
      scrollToTop()
      return
    }

    const index = Number.parseInt(key, 10)
    if (index >= 1 && index <= sections.length) {
      scrollToSection(sections[index - 1].id)
    }
  }
  // #endregion

  // #region Lifecycles
  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
  // #endregion
}
