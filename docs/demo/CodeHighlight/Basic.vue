<script setup lang="ts">
import CodeHighlight from '@/components/CodeHighlight/index.vue'

const code = `interface MessageItem {
  id: string | number
  content: string
  role: 'user' | 'assistant'
  typing?: boolean
}`
</script>

<template>
  <CodeHighlight :content="code" language="typescript" />
</template>
