<script setup lang="ts">
import { computed } from 'vue'
import type { SwitchProps, SwitchEmits, SwitchValueType } from './types'
defineOptions({
  name: 'VkSwitch',
  inheritAttrs: false,
})
const props = withDefaults(defineProps<SwitchProps>(), {
  activeValue: true,
  inactiveValue: false,
})
const emits = defineEmits<SwitchEmits>()
const innerValue = defineModel<SwitchValueType>()
//现在是否被选中
const checked = computed(() => innerValue.value === props.activeValue)
const switchValue = () => {
  if (props.disabled) return
  const newVal = checked.value ? props.inactiveValue : props.activeValue
  innerValue.value = newVal
  emits('change', newVal)
}
</script>

<template>
  <div
    class="vk-switch"
    :class="{
      [`vk-switch--${props.size}`]: props.size,
      'is-disabled': props.disabled,
      'is-checked': checked,
    }"
    @click="switchValue"
    @keydown.enter="switchValue"
    @keydown.space.prevent="switchValue"
  >
    <input
      class="vk-switch__input"
      type="checkbox"
      role="switch"
      :name="props.name"
      :disabled="props.disabled"
      :checked="checked"
    />
    <div class="vk-switch__core">
      <div class="vk-switch__core-inner">
        <span v-if="activeText || inactiveText" class="vk-switch__core-inner-text">
          {{ checked ? props.activeText : props.inactiveText }}
        </span>
      </div>
      <div class="vk-switch__core-action"></div>
    </div>
  </div>
</template>
