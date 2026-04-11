<template>
  <div class="ela-code-block">
    <div class="ela-code-header">
      <span class="ela-code-lang">{{ lang }}</span>

      <div class="ela-code-actions">
        <button class="ela-code-copy-btn" @click="handleCopy">
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
            stroke="#67c23a"
            stroke-width="2"
            fill="none"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="btn-text" :style="{ color: copied ? '#67c23a' : '' }">
            {{ copied ? '已复制' : '复制代码' }}
          </span>
        </button>
      </div>
    </div>
    <div class="ela-code-body">
      <pre><code class="hljs" :class="'language-' + lang" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  code: { type: String, default: '' },
  lang: { type: String, default: 'text' },
})

const copied = ref(false)

// 高亮计算
const highlightedCode = computed(() => {
  if (props.lang && hljs.getLanguage(props.lang)) {
    try {
      return hljs.highlight(props.code, { language: props.lang, ignoreIllegals: true }).value
    } catch {}
  }
  // 简单的 HTML 转义兜底
  return props.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
})

// 复制逻辑
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败', err)
  }
}
</script>
<style scoped>
.ela-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 这一行最关键：让两端的元素分别靠左和靠右 */
  padding: 8px 16px; /* 根据你的组件库整体风格调整间距 */
  background-color: #282c34; /* 代码块头部的背景色，可根据你的主题调整 */
  color: rgb(33, 95, 210); /* 语言文字的颜色 */
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-size: 14px;
}

.ela-code-actions {
  display: flex;
  align-items: center;
}

.ela-code-copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #abb2bf;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.ela-code-copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
