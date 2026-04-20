---
title: Sender | Element AI
description: Sender 组件文档
---

# Sender 发送框

用于聊天输入与发送动作，支持多行输入、回车行为控制、标签前缀、粘贴文件事件和插槽扩展。

## 基础用法

<preview path="../demo/Sender/Basic.vue" title="基础示例" description="v-model + send + action-list"></preview>

## Props

| 名称                | 说明                  | 类型                           | 默认值              |
| ------------------- | --------------------- | ------------------------------ | ------------------- |
| modelValue          | 输入框内容（v-model） | string                         | ''                  |
| placeholder         | 占位文本              | string                         | 'Type a message...' |
| loading             | 是否加载中            | boolean                        | false               |
| disabled            | 是否禁用              | boolean                        | false               |
| theme               | 主题模式              | 'light' \| 'dark'              | ''                  |
| variant             | 布局模式              | 'default' \| 'updown'          | 'default'           |
| enterBreak          | Enter 是否换行        | boolean                        | false               |
| showInputTagPrefix  | 是否显示输入标签      | boolean                        | false               |
| inputTagPrefixValue | 输入标签文本          | string                         | ''                  |
| inputTagVariant     | 输入标签样式          | 'default' \| 'updown'          | 'default'           |
| maxHeight           | 输入区最大高度        | number                         | 200                 |
| onHandleKeyDown     | 按键拦截钩子          | (event: KeyboardEvent) => void | -                   |

## Events

| 事件名                    | 说明                     | 参数                    |
| ------------------------- | ------------------------ | ----------------------- |
| send                      | 点击发送或回车发送时触发 | (content: string)       |
| enterPressed              | Enter 发送路径触发       | -                       |
| update:modelValue         | v-model 更新             | (value: string)         |
| update:showInputTagPrefix | 更新标签显示状态         | (value: boolean)        |
| update:loading            | 更新 loading 状态        | (loading: boolean)      |
| paste                     | 粘贴触发                 | (event: ClipboardEvent) |
| pasteFile                 | 粘贴文件触发             | (files: File[])         |
| focus                     | 聚焦触发                 | -                       |
| blur                      | 失焦触发                 | -                       |

## Slots

| 插槽名           | 说明                |
| ---------------- | ------------------- |
| prefix           | 输入框前缀区域      |
| input-tag-prefix | 输入标签区域        |
| action-list      | 操作区左侧按钮区    |
| send-btn         | 自定义发送按钮      |
| send-btn-loading | 自定义 loading 按钮 |

## Expose

| 方法名           | 说明             |
| ---------------- | ---------------- |
| focus            | 聚焦输入框       |
| blur             | 失焦输入框       |
| clear            | 清空输入内容     |
| editor().getText | 获取当前输入文本 |
