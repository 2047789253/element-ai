import type { ExtractPropTypes, PropType } from 'vue'
import type { MiddlewarePluginItem } from '../../utils/markdown-parse'
import type { CodeHighlightProps } from '../CodeHighlight/props'

export const markdownProps = {
  theme: {
    type: String as PropType<'dark' | 'light'>,
    default: undefined,
  },
  content: {
    type: String,
    default: '',
  },
  remarkPlugins: {
    type: Array as PropType<MiddlewarePluginItem[]>,
    default: () => [],
  },
  codeHighlightProps: {
    type: Object as PropType<Partial<CodeHighlightProps>>,
    default: () => ({}),
  },
}

export type MarkdownPropsType = Partial<ExtractPropTypes<typeof markdownProps>>
