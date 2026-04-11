import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import { toHtml } from 'hast-util-to-html'
import { transformToVNode } from './hast-to-vnode'
import type { VNode } from 'vue'

export interface ProcessMarkdownOptions {
  onError?: (error: Error) => void
}

export interface MiddlewarePluginItem {
  key: string
  plugin: any
  options?: any
}

// 默认的 Katex 配置 (原配置在 constants 中，这里为了方便直接提取过来)
export const katexConfig = { strict: false }

export const defaultCustomPlugins: MiddlewarePluginItem[] = [
  { key: 'remark-math', plugin: remarkMath },
  { key: 'remark-rehype', plugin: remarkRehype, options: { allowDangerousHtml: true } },
  { key: 'rehype-katex', plugin: rehypeKatex, options: katexConfig },
]

export const createBaseProcessor = (middlewarePlugins: MiddlewarePluginItem[]) => {
  const baseProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkBreaks)
  middlewarePlugins.forEach((item) => {
    baseProcessor.use(item.plugin, item.options)
  })
  return baseProcessor
}

export interface MarkdownPart {
  type: 'html' | 'code'
  content: string | VNode | null | any
  language?: string
  loading?: boolean
}

export type ProcessorType = ReturnType<typeof createBaseProcessor>

export const processMarkdownToParts = async (
  content: string,
  processor: ProcessorType,
): Promise<MarkdownPart[]> => {
  const tree = (await processor.run(processor.parse(content), { value: content } as any)) as any
  const parts: MarkdownPart[] = []
  let currentHtmlNodes: any[] = []

  const flushHtml = () => {
    if (currentHtmlNodes.length > 0) {
      const root = { type: 'root', children: currentHtmlNodes, data: tree.data }
      const vnode = transformToVNode(root as any)
      parts.push({ type: 'html', content: vnode })
      currentHtmlNodes = []
    }
  }

  if (tree.children) {
    for (const node of tree.children) {
      let codeNode: any = null
      if (node.type === 'element' && node.tagName === 'pre') {
        codeNode = node.children.find((c: any) => c.type === 'element' && c.tagName === 'code')
      }

      if (codeNode) {
        flushHtml()
        let language = ''
        const className = codeNode.properties?.className
        if (Array.isArray(className)) {
          const langClass = className.find((c: any) => String(c).startsWith('language-'))
          if (langClass) {
            language = String(langClass).replace('language-', '')
          }
        }
        const codeContent = codeNode.children.map((c: any) => c.value || '').join('')
        const loading = !!codeNode.properties?.loading

        parts.push({ type: 'code', content: codeContent, language, loading })
      } else {
        currentHtmlNodes.push(node)
      }
    }
  }
  flushHtml()
  return parts
}

export const katexProcess = (content: string): string => {
  let resultContent = content
  resultContent = resultContent.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => `$$${formula}$$`)
  resultContent = resultContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => `$${formula}$`)
  resultContent = resultContent.replace(
    /(\$\$[\s\S]*?\$\$)|(\$([\s\S]*?)\$)/g,
    (match, doubleDollar, singleDollar, singleContent) => {
      if (doubleDollar) return match
      if (singleContent && singleContent.includes('\n')) return `$$${singleContent}$$`
      return match
    },
  )
  resultContent = resultContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    if (formula.includes('\n')) return `\n$$${formula}$$\n`
    return match
  })
  return resultContent
}

export const processMarkdownToHtml = async (
  content: string,
  processor: ProcessorType,
): Promise<string> => {
  const tree = (await processor.run(processor.parse(content), { value: content } as any)) as any
  return toHtml(tree, { allowDangerousHtml: true })
}
