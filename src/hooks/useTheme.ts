import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject, ref } from 'vue'

export const themeContextKey: InjectionKey<
  Ref<'light' | 'dark' | undefined> | ComputedRef<'light' | 'dark'>
> = Symbol('themeContextKey')

export const useTheme = (propsTheme?: Ref<'light' | 'dark' | undefined>) => {
  const theme = inject(themeContextKey, ref('light'))
  return {
    theme: propsTheme?.value ? propsTheme : theme,
  }
}
