<script setup lang="ts">
import CodeHighlight from '@/components/CodeHighlight/index.vue'

const code = `SELECT id, name, status
FROM users
WHERE status = 'active'
ORDER BY created_at DESC`
</script>

<template>
  <CodeHighlight
    :content="code"
    language="sql"
    background="#0f172a"
    header-background="#111827"
    text-color="#d1d5db"
    :radius="12"
    :language-label-map="{ sql: 'PostgreSQL' }"
  >
    <template #header="{ displayLanguage, isCopied, onCopy }">
      <div style="display: flex; width: 100%; align-items: center; justify-content: space-between">
        <strong>{{ displayLanguage }}</strong>
        <button type="button" @click="onCopy">
          {{ isCopied ? '已复制' : '复制 SQL' }}
        </button>
      </div>
    </template>
  </CodeHighlight>
</template>
