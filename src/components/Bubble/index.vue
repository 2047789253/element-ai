<template>
  <div :class="[ns.b(), ns.m(placement)]">
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
          <ElAMarkdown :content="content" />
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
import { useNamespace } from '../../hooks'
import { bubbleProps } from './props'
import ElAMarkdown from '../Markdown/index.vue'

defineOptions({
  name: 'ElABubble',
})

defineProps(bubbleProps)
const ns = useNamespace('bubble')
</script>
