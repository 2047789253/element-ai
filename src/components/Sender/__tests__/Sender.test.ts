import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Sender from '../index.vue'

describe('Sender', () => {
  let wrapper: VueWrapper<any> | null = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  it('应该渲染默认 BEM 类名', () => {
    wrapper = mount(Sender)

    expect(wrapper.classes()).toContain('el-ai-sender')
    expect(wrapper.find('.el-ai-sender__content').exists()).toBe(true)
    expect(wrapper.find('.el-ai-sender__input').exists()).toBe(true)
    expect(wrapper.find('.el-ai-sender__send-btn').exists()).toBe(true)
  })

  it('应该根据 variant 渲染修饰类并支持 prefix 插槽', () => {
    wrapper = mount(Sender, {
      props: {
        variant: 'updown',
      },
      slots: {
        prefix: '<div class="prefix-slot">Prefix</div>',
      },
    })

    expect(wrapper.classes()).toContain('el-ai-sender--updown')
    expect(wrapper.find('.prefix-slot').exists()).toBe(true)
  })

  it('应该在 disabled 或 loading 下禁用输入并阻止发送', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: 'hello',
        disabled: true,
      },
    })

    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    await wrapper.find('.el-ai-sender__send-btn').trigger('click')
    expect(wrapper.emitted('send')).toBeFalsy()

    await wrapper.setProps({ disabled: false, loading: true })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.el-ai-sender__send-btn').exists()).toBe(false)
    await wrapper.find('.el-ai-sender__loading').trigger('click')
    expect(wrapper.emitted('update:loading')).toEqual([[false]])
    expect(wrapper.emitted('send')).toBeFalsy()
  })

  it('应该在输入变化时触发 update:modelValue', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: '',
      },
    })

    await wrapper.find('textarea').setValue('new message')

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeTruthy()
    expect(updateEvents?.[0]).toEqual(['new message'])
  })

  it('应该在 Enter 发送并触发 enterPressed', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: 'hello',
      },
    })

    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('enterPressed')).toHaveLength(1)
    expect(wrapper.emitted('send')).toEqual([['hello']])

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents?.[updateEvents.length - 1]).toEqual([''])
  })

  it('应该在 enterBreak=true 时允许换行而不触发发送', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: 'hello',
        enterBreak: true,
      },
    })

    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('enterPressed')).toBeFalsy()
    expect(wrapper.emitted('send')).toBeFalsy()
  })

  it('应该支持 onHandleKeyDown 拦截发送', async () => {
    const onHandleKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault()
    })

    wrapper = mount(Sender, {
      props: {
        modelValue: 'hello',
        onHandleKeyDown,
      },
    })

    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })

    expect(onHandleKeyDown).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('send')).toBeFalsy()
    expect(wrapper.emitted('enterPressed')).toBeFalsy()
  })

  it('应该在粘贴文件时触发 paste 与 pasteFile 事件', async () => {
    const file = new File(['demo'], 'demo.txt', { type: 'text/plain' })
    const clipboardData = {
      items: [
        {
          kind: 'file',
          getAsFile: () => file,
        },
      ],
    }

    wrapper = mount(Sender)
    await wrapper.find('textarea').trigger('paste', { clipboardData } as any)

    expect(wrapper.emitted('paste')).toHaveLength(1)

    const pasteFileEvents = wrapper.emitted('pasteFile')
    expect(pasteFileEvents).toHaveLength(1)
    expect((pasteFileEvents?.[0]?.[0] as File[])[0].name).toBe('demo.txt')
  })

  it('应该渲染 input-tag-prefix 并在点击移除后触发更新事件', async () => {
    wrapper = mount(Sender, {
      props: {
        showInputTagPrefix: true,
        inputTagPrefixValue: 'DeepSeek-R1',
      },
    })

    const prefix = wrapper.find('.el-ai-sender__input-tag-prefix')
    expect(prefix.exists()).toBe(true)
    expect(prefix.text()).toContain('DeepSeek-R1')

    await wrapper.find('.el-ai-sender__input-tag-prefix-remove').trigger('click')
    expect(wrapper.emitted('update:showInputTagPrefix')).toEqual([[false]])
  })

  it('应该在 updown 模式渲染对应的 input-tag-prefix 修饰类', () => {
    wrapper = mount(Sender, {
      props: {
        variant: 'updown',
        inputTagVariant: 'updown',
        showInputTagPrefix: true,
        inputTagPrefixValue: 'Model',
      },
    })

    expect(wrapper.find('.el-ai-sender__input-tag-prefix--updown').exists()).toBe(true)
  })

  it('应该支持 action-list / send-btn / send-btn-loading 插槽', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: 'hello',
      },
      slots: {
        'action-list': '<button class="custom-action">Action</button>',
        'send-btn': '<button class="custom-send">Send</button>',
        'send-btn-loading': '<div class="custom-loading">Loading</div>',
      },
    })

    expect(wrapper.find('.custom-action').exists()).toBe(true)
    expect(wrapper.find('.custom-send').exists()).toBe(true)

    await wrapper.setProps({ loading: true })
    await nextTick()

    expect(wrapper.find('.custom-loading').exists()).toBe(true)
  })

  it('应该暴露 focus / blur / clear / editor API', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: 'Hello world',
      },
    })

    const textarea = wrapper.find('textarea').element as HTMLTextAreaElement
    const focusSpy = vi.spyOn(textarea, 'focus')
    const blurSpy = vi.spyOn(textarea, 'blur')

    expect(typeof wrapper.vm.focus).toBe('function')
    expect(typeof wrapper.vm.blur).toBe('function')
    expect(typeof wrapper.vm.clear).toBe('function')
    expect(typeof wrapper.vm.editor).toBe('function')

    wrapper.vm.focus()
    wrapper.vm.blur()
    wrapper.vm.clear()
    await nextTick()

    expect(focusSpy).toHaveBeenCalledTimes(1)
    expect(blurSpy).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.editor().getText()).toBe('Hello world')
    expect(wrapper.emitted('update:modelValue')).toContainEqual([''])
  })

  it('应该触发 focus 与 blur 事件', async () => {
    wrapper = mount(Sender)

    await wrapper.find('textarea').trigger('focus')
    await wrapper.find('textarea').trigger('blur')

    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('应该在空内容时禁用发送按钮', async () => {
    wrapper = mount(Sender, {
      props: {
        modelValue: '   ',
      },
    })

    const sendBtn = wrapper.find('.el-ai-sender__send-btn')
    expect(sendBtn.classes()).toContain('disabled')

    await sendBtn.trigger('click')
    expect(wrapper.emitted('send')).toBeFalsy()
  })
})
