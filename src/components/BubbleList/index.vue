<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useNamespace } from '../../hooks'
import { bubbleListProps } from './props'
import Bubble from '../Bubble/index.vue'

defineOptions({
  name: 'BubbleList',
})

const props = defineProps({
  ...bubbleListProps,
})

// 新增：抛出触顶加载事件
const emits = defineEmits<{
  (e: 'load-more'): void
}>()

const ns = useNamespace('bubble-list')
const listRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)
const isUserScrolling = ref(false)
const isNearTop = ref(false)
let observer: MutationObserver | null = null
let mutationFrameId: number | null = null

const isAtBottom = (el: HTMLElement) => {
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  return distanceToBottom <= props.bottomThreshold
}

const handleScroll = () => {
  if (!listRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listRef.value

  // 基于阈值判断是否处于底部，避免细微偏差导致自动滚动抖动。
  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  isUserScrolling.value = distanceToBottom > props.bottomThreshold

  // 仅在“越过顶部阈值”时触发一次，避免连续滚动时重复发请求。
  const nextNearTop = scrollTop <= props.topLoadThreshold
  if (nextNearTop && !isNearTop.value) {
    emits('load-more')
  }
  isNearTop.value = nextNearTop
}

const scrollToBottom = async (force = false, behavior: ScrollBehavior = 'smooth') => {
  if (isUserScrolling.value && !force) return
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTo({
      top: listRef.value.scrollHeight,
      behavior,
    })
    isUserScrolling.value = false
  }
}

const scrollToTop = async (behavior: ScrollBehavior = 'smooth') => {
  await nextTick()
  if (!listRef.value) return
  listRef.value.scrollTo({
    top: 0,
    behavior,
  })
  isUserScrolling.value = true
}

const scrollToIndex = async (index: number, behavior: ScrollBehavior = 'smooth') => {
  await nextTick()
  if (!listRef.value || !innerRef.value) return

  const targetElement = innerRef.value.children[index] as HTMLElement | undefined
  if (!targetElement) return

  listRef.value.scrollTo({
    top: targetElement.offsetTop,
    behavior,
  })
  isUserScrolling.value = !isAtBottom(listRef.value)
}

const forceScrollToBottom = (behavior: ScrollBehavior = 'smooth') => scrollToBottom(true, behavior)

const scheduleAutoScroll = () => {
  if (mutationFrameId !== null) return
  mutationFrameId = window.requestAnimationFrame(() => {
    mutationFrameId = null
    scrollToBottom()
  })
}

onMounted(() => {
  forceScrollToBottom('auto')

  if (innerRef.value) {
    observer = new MutationObserver(scheduleAutoScroll)
    observer.observe(innerRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (mutationFrameId !== null) {
    window.cancelAnimationFrame(mutationFrameId)
    mutationFrameId = null
  }
})

defineExpose({
  scrollToBottom: forceScrollToBottom,
  scrollToTop,
  scrollToIndex,
})
</script>

<template>
  <div ref="listRef" :class="ns.b()" @scroll="handleScroll">
    <div ref="innerRef" :class="ns.e('inner')">
      <div v-for="item in data" :key="item.id" :class="ns.e('item')">
        <slot name="item" :data="item">
          <Bubble
            :content="item.content"
            :typing="item.typing"
            :placement="item.role === 'user' ? 'end' : 'start'"
            :variant="item.role === 'user' ? 'filled' : 'borderless'"
            is-markdown
          >
            <template #avatar v-if="item.role === 'assistant'">
              <div style="font-size: 22px; user-select: none">✨</div>
            </template>
          </Bubble>
        </slot>
      </div>

      <div v-if="loading" :class="ns.e('item')">
        <Bubble loading placement="start" variant="borderless">
          <template #avatar>
            <div style="font-size: 22px; user-select: none">✨</div>
          </template>
        </Bubble>
      </div>
    </div>

    <Transition name="fade">
      <div v-show="isUserScrolling" :class="ns.e('float-actions')">
        <slot
          name="bottom-action"
          :scrollToBottom="forceScrollToBottom"
          :scrollToTop="scrollToTop"
          :scrollToIndex="scrollToIndex"
        >
          <div :class="ns.e('float-btn')" @click="forceScrollToBottom('smooth')">
            <svg
              :class="ns.e('float-icon')"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4.5 6.5L8 10L11.5 6.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>
