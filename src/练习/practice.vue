<script setup lang="ts">
import { computed, ref } from 'vue'
const count = ref(0)
const isActive = ref(false)
const div=ref({
    innerHTML:'这是一个div元素',
    width:'100px',
    height:'100px',
    backgroundColor:'blue'
})
const isDisabled = computed(() => {
  return count.value > 60
})
const changeState = () => {
  count.value = 40
}
</script>

<template>
  <input placeholder="请输入数量" v-model="count" />
  <button @click="changeState" :disabled="isDisabled" class="practice">
    <h1>练习</h1>
  </button>
  <button
    :class="{ active: isActive }"
    :style="{ width:'20px',height:'20px',backgroundColor: 'red' }"
    disabled: true
  >
  </button>
  <div ref="div"></div>
</template>
