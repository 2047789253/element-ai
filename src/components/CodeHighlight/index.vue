<template>
  <div :class="[ns.b(), ns.is('expanded', computedExpanded)]" :style="customStyle">
    <slot
      name="header"
      :content="rawCode"
      :language="rawLang"
      :displayLanguage="displayLang"
      :isCopied="copied"
      :onCopy="onCopy"
      :toggleExpanded="toggleExpanded"
      :expanded="computedExpanded"
    >
      <div v-if="props.showHeader" :class="ns.e('header')">
        <div :class="ns.e('left')">
          <button
            v-if="props.collapsible"
            type="button"
            :class="[ns.e('toggle'), ns.is('expanded', computedExpanded)]"
            @click="toggleExpanded"
          >
            <span :class="ns.e('toggle-icon')">▸</span>
          </button>

          <span :class="ns.e('lang')" @click="props.collapsible ? toggleExpanded() : undefined">
            {{ displayLang }}
          </span>
        </div>

        <div :class="ns.e('actions')">
          <button v-if="props.copyable" type="button" :class="ns.e('copy-btn')" @click="onCopy">
            <svg
              v-if="!copied"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="var(--ela-color-success, #67c23a)"
              stroke-width="2"
              fill="none"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span
              :class="ns.e('copy-text')"
              :style="{ color: copied ? 'var(--ela-color-success, #67c23a)' : '' }"
            >
              {{ copied ? props.copiedText : props.copyText }}
            </span>
          </button>
        </div>
      </div>
    </slot>

    <div
      v-show="computedExpanded"
      :class="[
        ns.e('body'),
        ns.is('line-numbers', props.showLineNumbers),
        ns.is('wrap-lines', props.wrapLines),
      ]"
    >
      <pre><code
        class="hljs"
        :class="highlightLang ? 'language-' + highlightLang : ''"
        v-html="renderedCode"
      ></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import hljs from 'highlight.js'
import { useNamespace } from '../../hooks'
import { codeHighlightProps, type CodeHighlightEmitsType } from './props'

defineOptions({
  name: 'ElACodeHighlight',
})

const props = defineProps(codeHighlightProps)
const emits = defineEmits<CodeHighlightEmitsType>()
const ns = useNamespace('code-highlight')

const copied = ref(false)
const innerExpanded = ref(props.defaultExpanded)
let copyTimer: ReturnType<typeof setTimeout> | null = null

const LANGUAGE_LABEL_MAP: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JavaScript React',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript React',
  vue: 'Vue',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  json: 'JSON',
  yml: 'YAML',
  yaml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  shell: 'Shell',
  sh: 'Shell',
  bash: 'Bash',
  ps1: 'PowerShell',
  powershell: 'PowerShell',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  kotlin: 'Kotlin',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  swift: 'Swift',
  sql: 'SQL',
  xml: 'XML',
  text: 'Plain Text',
  txt: 'Plain Text',
}

const HIGHLIGHT_LANG_ALIAS_MAP: Record<string, string> = {
  'c++': 'cpp',
  'c#': 'csharp',
  shell: 'bash',
  sh: 'bash',
  ps1: 'powershell',
  text: 'plaintext',
  txt: 'plaintext',
}

const rawCode = computed(() => props.content ?? props.code ?? '')
const renderCode = computed(() => rawCode.value.replace(/\r?\n$/, ''))
const rawLang = computed(() => (props.language ?? props.lang ?? 'text').trim())
const normalizedLang = computed(() => rawLang.value.toLowerCase())
const highlightLang = computed(() => {
  return HIGHLIGHT_LANG_ALIAS_MAP[normalizedLang.value] || normalizedLang.value
})

const computedExpanded = computed(() => {
  return props.expanded === undefined ? innerExpanded.value : props.expanded
})

const mergedLangLabelMap = computed<Record<string, string>>(() => {
  return {
    ...LANGUAGE_LABEL_MAP,
    ...props.languageLabelMap,
  }
})

const displayLang = computed(() => {
  const lang = rawLang.value || 'text'
  const normalized = lang.toLowerCase()
  return mergedLangLabelMap.value[normalized] || lang
})

const escapeHtml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 高亮计算
const highlightedCode = computed(() => {
  const lang = highlightLang.value
  const code = renderCode.value

  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch {}
  }

  if (props.autoDetectLanguage && code) {
    try {
      return hljs.highlightAuto(code).value
    } catch {}
  }

  return escapeHtml(code)
})

const renderedCode = computed(() => {
  if (!props.showLineNumbers) {
    return highlightedCode.value
  }

  const lineClass = ns.e('line')
  return highlightedCode.value
    .split('\n')
    .map((line) => `<span class="${lineClass}">${line || ' '}</span>`)
    .join('\n')
})

const clearCopyTimer = () => {
  if (copyTimer) {
    clearTimeout(copyTimer)
    copyTimer = null
  }
}

const onCopy = async () => {
  if (!props.copyable) return

  try {
    await navigator.clipboard.writeText(rawCode.value)
    copied.value = true
    emits('copied', rawCode.value)

    clearCopyTimer()
    if (props.copyDuration > 0) {
      copyTimer = setTimeout(() => {
        copied.value = false
      }, props.copyDuration)
    } else {
      copied.value = false
    }
  } catch (err) {
    console.error('复制失败', err)
  }
}

const toggleExpanded = () => {
  if (!props.collapsible) return

  const nextValue = !computedExpanded.value
  if (props.expanded === undefined) {
    innerExpanded.value = nextValue
  }
  emits('update:expanded', nextValue)
}

onBeforeUnmount(() => {
  clearCopyTimer()
})

// 核心：动态 CSS 变量映射
const customStyle = computed(() => {
  const styles: Record<string, string> = {}

  if (props.background) {
    styles[`--${ns.namespace.value}-code-bg`] = props.background
  }
  if (props.headerBackground) {
    styles[`--${ns.namespace.value}-code-header-bg`] = props.headerBackground
  }
  if (props.textColor) {
    styles[`--${ns.namespace.value}-code-text-color`] = props.textColor
    // 若未单独传 codeColor，则使用 textColor 作为代码正文基础色
    if (!props.codeColor) {
      styles[`--${ns.namespace.value}-code-token-text`] = props.textColor
    }
  }
  if (props.codeColor) {
    styles[`--${ns.namespace.value}-code-token-text`] = props.codeColor
  }
  if (props.codeFontFamily) {
    styles[`--${ns.namespace.value}-code-font-family`] = props.codeFontFamily
  }
  if (props.radius) {
    styles[`--${ns.namespace.value}-code-radius`] =
      typeof props.radius === 'number' ? `${props.radius}px` : props.radius
  }
  if (props.maxHeight) {
    styles[`--${ns.namespace.value}-code-max-height`] =
      typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  if (props.lineNumberColor) {
    styles[`--${ns.namespace.value}-code-line-number-color`] = props.lineNumberColor
  }

  return styles
})

defineExpose({
  onCopy,
  toggleExpanded,
})
</script>
