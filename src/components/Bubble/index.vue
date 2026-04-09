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
            <div v-if="isMarkdown" class="markdown-body" v-html="parsedMarkdown"></div>
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
import MarkdownIt from 'markdown-it' // 引入 Markdown 解析库

const slots = useSlots()
const hasHeader = computed(() => !!slots.header)
const hasAvatar = computed(() => !!slots.avatar)
const hasFooter = computed(() => !!slots.footer)

defineOptions({
  name: 'ElABubble',
})
const props = defineProps({
  ...bubbleProps,
})
const ns = useNamespace('bubble')
const themeRef = computed(() => props.theme)
useTheme(themeRef)

const {
  content: typerwriterContent,
  setText,
  start,
  setConfig,
  done: overTyperwriter,
} = useTyperwriter()

// --- 新增：初始化 Markdown 解析器 ---
// 配置项：html: false 可以防止基本的 XSS 攻击；breaks: true 支持回车换行
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

// 当前应该显示的原始文本数据
const contentData = computed(() => {
  if (props.typing) {
    return typerwriterContent.value
  }
  return props.content
})

// --- 新增：计算解析后的 Markdown HTML ---
const parsedMarkdown = computed(() => {
  if (!props.isMarkdown || !contentData.value) return ''
  return md.render(contentData.value)
})

watch(
  () => props.content,
  (newVal) => {
    if (props.typing) {
      setText(newVal)
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => props.typingOver,
  (newVal, oldVal) => {
    setConfig({
      staticText: newVal ? '' : '',
    })
    if (oldVal === false && newVal === true) {
      overTyperwriter()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => props.loading,
  () => {
    if (props.loading === false && props.typing) {
      start()
    }
  },
  {
    immediate: true,
  },
)

defineExpose({
  overTyperwriter,
})
</script>

<style scoped>
/* 建议在这里或全局样式中补充一些基础的 markdown 样式。
  如果时间紧，也可以直接在项目中引入 github-markdown-css 库。
*/
.markdown-body {
  word-break: break-word;
}
:deep(.markdown-body p) {
  margin: 0 0 8px 0;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}
:deep(.markdown-body code) {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
