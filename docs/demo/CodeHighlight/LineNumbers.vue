<script setup lang="ts">
import CodeHighlight from '@/components/CodeHighlight/index.vue'

const code = `function getRandomInt(min: number, max: number): number {
  const start = Math.ceil(min)
  const end = Math.floor(max)
  return Math.floor(Math.random() * (end - start + 1)) + start
}

export function pickOne<T>(list: T[]): T | undefined {
  if (!list.length) return undefined
  return list[getRandomInt(0, list.length - 1)]
}`
</script>

<template>
  <CodeHighlight
    :content="code"
    language="typescript"
    show-line-numbers
    wrap-lines
    :max-height="220"
  />
</template>
