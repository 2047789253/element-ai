<template>
  <div :class="[ns.b(), ns.m(variant), ns.m(theme)]">
    <div :class="ns.e('content')">
      <textarea
        ref="inputRef"
        :class="ns.e('input')"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled || loading"
        rows="1"
        style="resize: none; overflow-y: auto"
        @input="handleInput"
        @compositionstart="isComposing = true"
        @compositionend="onCompositionEnd"
        @keydown="handleKeydown"
        @focus="emits('focus')"
        @blur="emits('blur')"
      ></textarea>
    </div>
    <div :class="ns.e('action')">
      <div :class="ns.em('action', 'other')">
        <slot name="action-list"></slot>
      </div>
      <slot v-if="loading" name="send-btn-loading">
        <div :class="ns.e('loading')" @click="emits('update:loading', false)">
          <span>●</span>
        </div>
      </slot>
      <slot v-else name="send-btn" :disabled="isEmpty">
        <div :class="[ns.e('send-btn'), ns.is('disabled', isEmpty || disabled)]" @click="onSend">
          <span>↑</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, ref, nextTick, watch } from 'vue'
import type { PropType } from 'vue'
import { useNamespace } from '../../hooks'
import type { SenderEmitsType } from './props'
import { senderProps } from './props'

const ns = useNamespace('sender')

const props = defineProps({
  ...senderProps,
  variant: {
    type: String as PropType<'default' | 'updown'>,
    default: 'default',
  },
})

const emits = defineEmits<SenderEmitsType>()
const inputRef = useTemplateRef('inputRef')

// --- 新增：核心状态 ---
const isComposing = ref(false) // 是否正在使用中文拼音输入法
const maxHeight = 200 // textarea 的最大高度 (px)，超出后内部滚动

const isEmpty = computed(() => {
  return !props.modelValue || props.modelValue.trim().length === 0
})

// --- 新增：高度自适应逻辑 ---
const adjustHeight = async () => {
  await nextTick()
  if (!inputRef.value) return
  // 必须先将高度设为 auto，才能获取到缩减后的真实 scrollHeight
  inputRef.value.style.height = 'auto'
  const scrollHeight = inputRef.value.scrollHeight
  inputRef.value.style.height = `${Math.min(scrollHeight, maxHeight)}px`
}

// 监听外部传入的 modelValue 变化（例如被父组件清空时），也需要重置高度
watch(
  () => props.modelValue,
  () => {
    adjustHeight()
  },
)

// --- 新增：输入与输入法拦截逻辑 ---
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emits('update:modelValue', target.value)
  adjustHeight()
}

const onCompositionEnd = (e: Event) => {
  isComposing.value = false
  // 中文输入结束时，手动触发一次高度计算和值的更新
  handleInput(e)
}

// --- 新增：按键监听逻辑 ---
const handleKeydown = (e: KeyboardEvent) => {
  // 如果正在拼写中文，拦截所有键盘事件的处理
  if (isComposing.value) return

  // Enter 发送，Shift + Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault() // 阻止默认的换行行为
    onSend()
  }
}

// --- 发送逻辑 ---
const onSend = () => {
  if (isEmpty.value || props.loading || props.disabled) return
  emits('send', props.modelValue)
  emits('update:modelValue', '')

  // 发送后重置输入框高度
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  },
  clear: () => {
    emits('update:modelValue', '')
    nextTick(() => {
      if (inputRef.value) inputRef.value.style.height = 'auto'
    })
  },
})
</script>
