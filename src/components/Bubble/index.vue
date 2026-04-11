<template>
  <div :class="[ns.b(), ns.m(placement), ns.m(`shape-${shape}`)]" :style="customStyle">
    <div :class="ns.e('avatar')">
      <slot name="avatar">
        <template v-if="typeof avatar === 'string'">
          <img v-if="avatar" :src="avatar" alt="avatar" />
          <div v-else :class="ns.e('avatar-placeholder')">
            {{ (header.charAt(0) || 'A').toUpperCase() }}
          </div>
        </template>
        <component :is="avatar" v-else-if="avatar" />
      </slot>
    </div>

    <div :class="ns.e('main')">
      <div v-if="header || $slots.header" :class="ns.e('header')">
        <slot name="header">{{ header }}</slot>
      </div>

      <div :class="ns.e('content')">
        <slot>
          <ElAMarkdown v-if="content" :content="content" />
        </slot>

        <div v-if="loading" :class="ns.e('loading')">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <div v-if="footer || $slots.footer" :class="ns.e('footer')">
        <slot name="footer">{{ footer }}</slot>
      </div>
    </div>

    <div v-if="$slots.actions" :class="ns.e('actions')">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNamespace } from '../../hooks'
import { bubbleProps } from './props'
import ElAMarkdown from '../Markdown/index.vue'

defineOptions({
  name: 'ElABubble',
})

const props = defineProps(bubbleProps)
const ns = useNamespace('bubble')

// 核心逻辑：将 Props 转化为动态 CSS 变量
const customStyle = computed(() => {
  const styles: Record<string, string> = {}
  if (props.background) {
    // 例如：生成 --ela-bubble-bg-color: #ff0000
    styles[`--${ns.namespace.value}-bubble-bg-color`] = props.background
  }
  if (props.textColor) {
    styles[`--${ns.namespace.value}-bubble-text-color`] = props.textColor
  }
  return styles
})
</script>
