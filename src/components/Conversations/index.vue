<template>
  <div :class="[ns.b(), ns.m(theme)]">
    <div :class="ns.e('header')">
      <slot name="header"></slot>
    </div>
    <div ref="scrollRef" :class="ns.e('scroll')" @scroll="handleScroll">
      <slot name="scroll"></slot>
      <Loading v-if="hasMore" :class="ns.e('loading')" :loading="loading" @next="loadMore">
        <slot name="loading"> </slot>
      </Loading>
    </div>
    <div :class="ns.e('footer')">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNamespace, useTheme } from '../../hooks'
import { conversationsProps } from './props'
import Loading from './loading.vue'
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

defineOptions({
  name: 'ElAConversations',
})

const props = defineProps({
  ...conversationsProps,
})

const ns = useNamespace('conversations')

const themeRef = computed(() => props.theme)
const { theme } = useTheme(themeRef)

const loading = ref(false)

const loadMore = async () => {
  loading.value = true
  try {
    await props?.onNext?.()
  } finally {
    loading.value = false
  }
}

// ================= 新增：智能滚动核心逻辑 =================

const scrollRef = ref<HTMLElement | null>(null)
const isUserScrolling = ref(false) // 是否处于用户主动查阅历史的状态
let observer: MutationObserver | null = null

// 1. 监听滚动事件，判断用户意图
const handleScroll = () => {
  if (!scrollRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollRef.value
  // 如果当前可视区域底部距离真实内容底部超过 50px，
  // 认定用户正在往上翻看历史记录，此时中断自动滚动
  isUserScrolling.value = scrollHeight - scrollTop - clientHeight > 50
}

// 2. 滚动到底部的执行函数
const scrollToBottom = async (force = false) => {
  // 如果用户正在看历史，且非强制执行，则不打扰用户（放弃滚动）
  if (isUserScrolling.value && !force) return

  await nextTick()
  if (scrollRef.value) {
    // 平滑滚动到底部（如果在 CSS 中对 scroll 容器设置了 scroll-behavior: smooth 体验更好）
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

onMounted(() => {
  // 初始加载时，强制先滚动到底部
  scrollToBottom(true)

  // 3. 使用 MutationObserver 监听 DOM 变化
  if (scrollRef.value) {
    observer = new MutationObserver(() => {
      // 只要内部内容有任何变化（新增消息、打字机打出新字），就尝试滚动到底部
      scrollToBottom()
    })

    observer.observe(scrollRef.value, {
      childList: true, // 监听子节点的增删（发送新消息）
      subtree: true, // 监听所有后代节点
      characterData: true, // 监听文本节点变化（打字机效果吐字）
    })
  }
})

onBeforeUnmount(() => {
  // 组件销毁前断开观察者，防止内存泄漏
  if (observer) {
    observer.disconnect()
  }
})

// 暴露方法给外部，允许父组件在“用户主动发送新消息”时强制滚动到底部
defineExpose({
  scrollToBottom: () => scrollToBottom(true),
})
</script>
