<script setup lang="ts">
import type { TagProps } from './types'
import { useNamespace } from '@/hooks'

defineOptions({
  name: 'VkTag',
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<TagProps>(), {
  type: 'primary',
})

const ns = useNamespace('tag')
</script>

<template>
  <span :class="[ns.b(), ns.m(type)]">
    <slot></slot>
  </span>
</template>
