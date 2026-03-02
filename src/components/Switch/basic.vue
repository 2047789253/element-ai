<script setup lang="ts">
import { ref } from 'vue'
import Switch from './Switch.vue'
const test = ref('right')
</script>

<template>
  <Switch
    v-model="test"
    active-text="ON"
    inactive-text="OFF"
    activeValue="right"
    inactiveValue="wrong"
  />
  <h4>{{ test }}</h4>
</template>
