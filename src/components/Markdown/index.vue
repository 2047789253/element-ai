<template>
  <div :class="[ns.b(), ns.e('markdown-body'), theme === 'dark' ? ns.m('dark') : '']">
    <template v-for="(part, index) in parts" :key="index">
      <slot
        v-if="part.type === 'code'"
        name="code"
        v-bind="props.codeHighlightProps"
        :content="part.content"
        :language="part.language"
        :theme="theme"
      >
        <CodeHighlight v-bind="props.codeHighlightProps" :code="part.content" :lang="part.language">
          <template #header="props">
            <slot name="code-highlight-header" v-bind="props"></slot>
          </template>
        </CodeHighlight>
      </slot>

      <VNodeRenderer v-else :content="part.content" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { mergeWith } from 'lodash-es'

// 引入刚刚写的解析工具
import {
  processMarkdownToParts,
  type MarkdownPart,
  defaultCustomPlugins,
  createBaseProcessor,
  katexProcess,
} from '../../utils/markdown-parse'

// 引入你的 Hook 和 组件
import { useNamespace, useTheme } from '../../hooks'
import CodeHighlight from '../CodeHighlight/index.vue'
import { markdownProps } from './types.ts'

defineOptions({
  name: 'ElAMarkdown',
})

const ns = useNamespace('markdown')
const props = defineProps(markdownProps)

// VNode 渲染器，由于我们把 AST 转成了 VNode，在 Vue 里可以直接返回它
const VNodeRenderer = (vnodeParams: { content: any }) => {
  return vnodeParams.content
}

const parts = ref<MarkdownPart[]>([])
const themeRef = computed(() => props.theme)
const { theme } = useTheme(themeRef)

const processor = computed(() => {
  const plugins = mergeWith([], defaultCustomPlugins, props.remarkPlugins)
  return createBaseProcessor(plugins)
})

watch(
  [() => props.content, () => processor.value],
  async () => {
    if (!props.content) {
      parts.value = []
      return
    }

    parts.value = await processMarkdownToParts(katexProcess(props.content), processor.value)
  },
  { immediate: true },
)
</script>
