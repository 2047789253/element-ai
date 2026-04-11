import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import BubbleList from '../index.vue'
import type { MessageItem } from '../props'

const mockData: MessageItem[] = [
  { id: 1, content: 'Message 1', role: 'user' },
  { id: 2, content: 'Message 2', role: 'assistant' },
]

const setScrollMetrics = (
  el: HTMLElement,
  metrics: { scrollTop: number; scrollHeight: number; clientHeight: number },
) => {
  Object.defineProperty(el, 'scrollTop', {
    value: metrics.scrollTop,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(el, 'scrollHeight', {
    value: metrics.scrollHeight,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(el, 'clientHeight', {
    value: metrics.clientHeight,
    writable: true,
    configurable: true,
  })
}

describe('BubbleList', () => {
  let wrapper: VueWrapper<any> | null = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  it('应该正确渲染组件并应用 BEM 类名', () => {
    wrapper = mount(BubbleList, {
      props: { data: mockData },
    })

    expect(wrapper.classes()).toContain('el-ai-bubble-list')
    expect(wrapper.find('.el-ai-bubble-list__inner').exists()).toBe(true)
  })

  it('应该支持自定义 item 插槽', () => {
    wrapper = mount(BubbleList, {
      props: { data: mockData },
      slots: {
        item: '<div class="custom-item">{{ data.content }}</div>',
      },
    })

    expect(wrapper.find('.custom-item').exists()).toBe(true)
  })

  it('应该根据 bottomThreshold 决定是否显示回到底部按钮', async () => {
    wrapper = mount(BubbleList, {
      props: {
        data: mockData,
        bottomThreshold: 80,
      },
    })

    const listEl = wrapper.find('.el-ai-bubble-list').element as HTMLElement
    const actionsEl = wrapper.find('.el-ai-bubble-list__float-actions')

    setScrollMetrics(listEl, {
      scrollTop: 260,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')
    expect(actionsEl.attributes('style') ?? '').toContain('display: none')

    setScrollMetrics(listEl, {
      scrollTop: 180,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')
    await nextTick()

    expect(actionsEl.attributes('style') ?? '').not.toContain('display: none')
  })

  it('应该在越过顶部阈值时触发 load-more 且避免重复触发', async () => {
    wrapper = mount(BubbleList, {
      props: {
        data: mockData,
        topLoadThreshold: 10,
      },
    })

    const listEl = wrapper.find('.el-ai-bubble-list').element as HTMLElement

    setScrollMetrics(listEl, {
      scrollTop: 8,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    setScrollMetrics(listEl, {
      scrollTop: 6,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    setScrollMetrics(listEl, {
      scrollTop: 20,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')

    setScrollMetrics(listEl, {
      scrollTop: 4,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')

    expect(wrapper.emitted('load-more')).toHaveLength(2)
  })

  it('应该暴露并支持 scrollToBottom / scrollToTop / scrollToIndex', async () => {
    wrapper = mount(BubbleList, {
      props: { data: mockData },
    })

    const listEl = wrapper.find('.el-ai-bubble-list').element as HTMLElement
    const scrollTo = vi.fn()
    Object.defineProperty(listEl, 'scrollTo', {
      value: scrollTo,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(listEl, 'scrollHeight', {
      value: 500,
      writable: true,
      configurable: true,
    })

    const secondItem = wrapper.findAll('.el-ai-bubble-list__item')[1].element as HTMLElement
    Object.defineProperty(secondItem, 'offsetTop', {
      value: 120,
      writable: true,
      configurable: true,
    })

    expect(typeof wrapper.vm.scrollToBottom).toBe('function')
    expect(typeof wrapper.vm.scrollToTop).toBe('function')
    expect(typeof wrapper.vm.scrollToIndex).toBe('function')

    await wrapper.vm.scrollToBottom('auto')
    await wrapper.vm.scrollToTop('auto')
    await wrapper.vm.scrollToIndex(1, 'auto')

    expect(scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'auto' })
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    expect(scrollTo).toHaveBeenCalledWith({ top: 120, behavior: 'auto' })
  })

  it('应该支持自定义 bottom-action 插槽', async () => {
    wrapper = mount(BubbleList, {
      props: { data: mockData },
      slots: {
        'bottom-action': ({
          scrollToBottom,
        }: {
          scrollToBottom: (behavior?: ScrollBehavior) => void
        }) =>
          h(
            'button',
            {
              class: 'custom-bottom-action',
              onClick: () => scrollToBottom('auto'),
            },
            '返回底部',
          ),
      },
    })

    const listEl = wrapper.find('.el-ai-bubble-list').element as HTMLElement
    const scrollTo = vi.fn()
    Object.defineProperty(listEl, 'scrollTo', {
      value: scrollTo,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(listEl, 'scrollHeight', {
      value: 520,
      writable: true,
      configurable: true,
    })

    setScrollMetrics(listEl, {
      scrollTop: 100,
      scrollHeight: 600,
      clientHeight: 300,
    })
    await wrapper.trigger('scroll')

    const action = wrapper.find('.custom-bottom-action')
    expect(action.exists()).toBe(true)

    await action.trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'auto' })
  })
})
