import type { ExtractPropTypes, PropType } from 'vue'

export const codeHighlightProps = {
  // 兼容旧参数：代码内容
  code: {
    type: String,
    default: '',
  },
  // 兼容旧参数：语言
  lang: {
    type: String,
    default: 'text',
  },
  // 新参数：代码内容（优先级高于 code）
  content: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  // 新参数：语言（优先级高于 lang）
  language: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  // 自定义整个代码块的背景色
  background: {
    type: String,
    default: '',
  },
  // 自定义头部的背景色
  headerBackground: {
    type: String,
    default: '',
  },
  // 自定义头部文字/按钮的颜色
  textColor: {
    type: String,
    default: '',
  },
  // 自定义代码正文文字颜色（不含语法 token 独立色时的基础色）
  codeColor: {
    type: String,
    default: '',
  },
  // 自定义代码字体族
  codeFontFamily: {
    type: String,
    default: '',
  },
  // 自定义圆角
  radius: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  // 是否显示行号
  showLineNumbers: {
    type: Boolean,
    default: false,
  },
  // 行号颜色
  lineNumberColor: {
    type: String,
    default: '',
  },
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: true,
  },
  // 是否显示复制按钮
  copyable: {
    type: Boolean,
    default: true,
  },
  // 复制按钮文案
  copyText: {
    type: String,
    default: '复制代码',
  },
  // 复制成功文案
  copiedText: {
    type: String,
    default: '已复制',
  },
  // 复制状态持续时间（毫秒）
  copyDuration: {
    type: Number,
    default: 2000,
  },
  // 是否支持折叠
  collapsible: {
    type: Boolean,
    default: false,
  },
  // 受控折叠状态
  expanded: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  // 非受控默认展开状态
  defaultExpanded: {
    type: Boolean,
    default: true,
  },
  // 是否自动识别语言
  autoDetectLanguage: {
    type: Boolean,
    default: false,
  },
  // 是否开启自动换行
  wrapLines: {
    type: Boolean,
    default: false,
  },
  // 代码区最大高度
  maxHeight: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  // 自定义语言标签映射
  languageLabelMap: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },
}

export type CodeHighlightProps = ExtractPropTypes<typeof codeHighlightProps>

export type CodeHighlightEmitsType = {
  (e: 'update:expanded', value: boolean): void
  (e: 'copied', value: string): void
}
