import type { ExtractPropTypes, PropType, VNode, Component } from 'vue'

export const bubbleProps = {
  // 气泡位置：start (左侧，通常是 AI)，end (右侧，通常是用户)
  placement: {
    type: String as PropType<'start' | 'end'>,
    default: 'start',
  },
  // 内容
  content: {
    type: String,
    default: '',
  },
  // 头像配置：可以是一个 URL 字符串，或者一个 Vue 组件/VNode
  avatar: {
    type: [String, Object] as PropType<string | VNode | Component>,
    default: '',
  },
  // 头部元数据：比如角色名称
  header: {
    type: String,
    default: '',
  },
  // 底部元数据：比如发布时间
  footer: {
    type: String,
    default: '',
  },
  // 是否正在加载（流式输出中的转圈状态）
  loading: {
    type: Boolean,
    default: false,
  },
  // 是否开启打字机效果
  typing: {
    type: Boolean,
    default: false,
  },
}

export type BubbleProps = ExtractPropTypes<typeof bubbleProps>
