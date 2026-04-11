<script setup lang="ts">
import { ref } from 'vue'
import CodeHighlight from '@/components/CodeHighlight/index.vue'

const expanded = ref(true)
const code = `const parse = (source: string) => {
  return source
    .split('\\n')
    .map((line) => line.trim())
    .filter(Boolean)
}`
</script>

<template>
  <div>
    <CodeHighlight
      :content="code"
      lang="ts"
      collapsible
      :expanded="expanded"
      copy-text="复制片段"
      copied-text="复制成功"
      @update:expanded="(value) => (expanded = value)"
      @copied="() => console.log('copied')"
    />
  </div>
</template>
