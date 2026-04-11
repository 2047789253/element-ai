import type { ExtractPropTypes, PropType, VNode, Component } from 'vue'

export const bubbleProps = {
  // 气泡位置：start (左侧 AI)，end (右侧 用户)
  placement: {
    type: String as PropType<'start' | 'end'>,
    default: 'start',
  },
  // 消息内容
  content: {
    type: String,
    default: '',
  },
  // 头像：支持 URL 字符串、VNode 或组件
  avatar: {
    type: [String, Object] as PropType<string | VNode | Component>,
    default: '',
  },
  // 头部元数据（如角色名）
  header: {
    type: String,
    default: '',
  },
  // 底部元数据（如发布时间）
  footer: {
    type: String,
    default: '',
  },
  // 是否正在加载（显示三个打点动画）
  loading: {
    type: Boolean,
    default: false,
  },
  // 气泡形状：round (大圆角) / square (小圆角)
  shape: {
    type: String as PropType<'round' | 'square'>,
    default: 'round',
  },
  // 自定义背景色（由用户传入）
  background: {
    type: String,
    default: '',
  },
  // 自定义文字颜色（由用户传入）
  textColor: {
    type: String,
    default: '',
  },
}

export type BubbleProps = ExtractPropTypes<typeof bubbleProps>
