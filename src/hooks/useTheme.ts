import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'
export const THEME_ATTRIBUTE = 'data-el-ai-theme'

export const themeContextKey: InjectionKey<
  Ref<'light' | 'dark' | undefined> | ComputedRef<'light' | 'dark'>
> = Symbol('themeContextKey')

export const setTheme = (theme: ThemeMode, target?: HTMLElement | null) => {
  const themeTarget =
    target ?? (typeof document !== 'undefined' ? document.documentElement : null)

  if (!themeTarget) return
  themeTarget.setAttribute(THEME_ATTRIBUTE, theme)
}

export const useTheme = (propsTheme?: Ref<'light' | 'dark' | undefined>) => {
  const theme = inject(themeContextKey, ref('light'))
  return {
    theme: propsTheme?.value ? propsTheme : theme,
  }
}
