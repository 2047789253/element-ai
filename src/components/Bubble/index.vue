<template>
  <div :class="[ns.b(), ns.b(placement), ns.m(footerTrigger + '-footer')]">
    <div v-if="hasAvatar" :class="ns.e('avatar')">
      <slot name="avatar"></slot>
    </div>
    <div :class="ns.e('content-wrapper')">
      <div v-if="loading" :class="ns.e('loading')">
        <span :class="ns.em('loading', 'dot')"></span>
        <span :class="ns.em('loading', 'dot')"></span>
        <span :class="ns.em('loading', 'dot')"></span>
      </div>
      <template v-else>
        <div v-if="hasHeader" :class="ns.e('header')">
          <slot name="header"></slot>
        </div>
        <div :class="ns.e('content')">
          <div
            :class="[ns.em('content', 'text'), ns.em('content', variant), ns.em('content', shape)]"
          >
            <div
              v-if="isMarkdown"
              class="markdown-body"
              v-html="parsedMarkdown"
              @click="handleCodeCopy"
            ></div>
            <slot v-else :content="contentData">
              {{ contentData }}
            </slot>
          </div>
        </div>
        <div v-if="hasFooter" :class="ns.e('footer')">
          <slot name="footer"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNamespace, useTheme, useTyperwriter } from '../../hooks'
import { bubbleProps } from './props'
import { computed, watch, useSlots } from 'vue'
import MarkdownIt from 'markdown-it'
// 引入代码高亮库及其深色主题
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// 注入 vue 作为 xml/html 的别名以支持高亮
hljs.registerAliases(['vue', 'html'], { languageName: 'xml' })

defineOptions({ name: 'Bubble' })

const props = defineProps({ ...bubbleProps })
const ns = useNamespace('bubble')
const themeRef = computed(() => props.theme)
useTheme(themeRef)
const slots = useSlots()
const hasHeader = computed(() => !!slots.header)
const hasAvatar = computed(() => !!slots.avatar)
const hasFooter = computed(() => !!slots.footer)

const {
  content: typerwriterContent,
  setText,
  start,
  setConfig,
  done: overTyperwriter,
} = useTyperwriter()

// ==================== Markdown 与高亮核心逻辑 ====================

const md: MarkdownIt = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  // 配置 highlight.js
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch {
        // 捕获异常但不处理
      }
    }
    // 返回空字符串，markdown-it 会默认进行转义并渲染
    return ''
  },
})

// 拦截默认的 fence (代码块) 渲染规则，升级高亮组件视觉体验
md.renderer.rules.fence = function (tokens: any[], idx: number, options: any): string {
  const token = tokens[idx]
  const code = token.content // 原始代码文本
  const lang = token.info ? token.info.trim() : 'text'

  // 映射常见语言的标准名称，提升专业感
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    typescript: 'TypeScript',
    js: 'JavaScript',
    javascript: 'JavaScript',
    vue: 'Vue',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    bash: 'Bash',
    sh: 'Bash',
    python: 'Python',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    go: 'Go',
    sql: 'SQL',
    xml: 'XML',
    yaml: 'YAML',
    text: 'Plaintext',
  }
  // 取映射表中的规范命名，没有则直接用用户输入的原始文字
  const displayLang = langMap[lang.toLowerCase()] || lang

  let highlightedCode = ''
  if (options.highlight) {
    highlightedCode = options.highlight(code, lang, '')
  }
  // 如果没有高亮成功（比如不支持的语言如 vue 等），必须降级并对其进行 HTML 转义
  if (!highlightedCode) {
    highlightedCode = md.utils.escapeHtml(code)
  }

  const encodedCode = encodeURIComponent(code)

  return `
    <div class="ela-code-block">
      <div class="ela-code-header">
        <div class="ela-code-lang">${displayLang}</div>
        <div class="ela-code-action">
          <button class="ela-code-copy-btn" data-code="${encodedCode}" title="复制代码">
            <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="success-icon" style="display:none;" viewBox="0 0 24 24" width="14" height="14" stroke="#67c23a" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="btn-text">复制代码</span>
          </button>
        </div>
      </div>
      <div class="ela-code-content">
        <pre><code class="hljs language-${lang}">${highlightedCode}</code></pre>
      </div>
    </div>
  `
}

const contentData = computed(() => (props.typing ? typerwriterContent.value : props.content))

const parsedMarkdown = computed(() => {
  if (!props.isMarkdown || !contentData.value) return ''
  return md.render(contentData.value)
})

// ==================== 事件委托：处理复制点击 ====================
const handleCodeCopy = async (e: MouseEvent) => {
  const target = (e.target as HTMLElement).closest('.ela-code-copy-btn') as HTMLElement
  if (!target) return

  const encodedCode = target.getAttribute('data-code')
  if (encodedCode) {
    try {
      const codeToCopy = decodeURIComponent(encodedCode)
      await navigator.clipboard.writeText(codeToCopy)

      const textSpan = target.querySelector('.btn-text')
      const copyIcon = target.querySelector('.copy-icon') as HTMLElement
      const successIcon = target.querySelector('.success-icon') as HTMLElement

      if (textSpan && copyIcon && successIcon) {
        textSpan.innerHTML = '复制成功'
        target.classList.add('is-copied')
        copyIcon.style.display = 'none'
        successIcon.style.display = 'inline-block'

        setTimeout(() => {
          textSpan.innerHTML = '复制代码'
          target.classList.remove('is-copied')
          copyIcon.style.display = 'inline-block'
          successIcon.style.display = 'none'
        }, 2000)
      }
    } catch (err) {
      console.error('复制失败', err)
    }
  }
}

watch(
  () => props.content,
  (newVal) => {
    if (props.typing) setText(newVal)
  },
  { immediate: true },
)
watch(
  () => props.typingOver,
  (newVal, oldVal) => {
    setConfig({ staticText: newVal ? '' : '' })
    if (oldVal === false && newVal === true) overTyperwriter()
  },
  { immediate: true },
)
watch(
  () => props.loading,
  () => {
    if (props.loading === false && props.typing) start()
  },
  { immediate: true },
)

defineExpose({ overTyperwriter })
</script>
