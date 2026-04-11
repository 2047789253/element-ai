<script setup lang="ts">
import Bubble from '@/components/Bubble/index.vue'
</script>

<template>
  <Bubble
    header="系统通知"
    shape="square"
    background="#ecfeff"
    text-color="#155e75"
    content="通过 background、textColor、shape 可以快速定制视觉风格。"
  />

  <Bubble
    placement="end"
    shape="round"
    background="#1d4ed8"
    text-color="#ffffff"
    content="这是一条强调样式的右侧气泡。"
  />
</template>
