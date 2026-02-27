import { render, h } from 'vue'
import type { CreateMessageProps, MessageContext } from './types'
import MessageConstructor from './Message.vue'
let seed = 1
const instances: MessageContext[] = []
export const createMessage = (props: CreateMessageProps) => {
  const id = `message_${seed++}`
  const container = document.createElement('div')
  const destroy = () => {
    //删除数组中的实例
    const index = instances.findIndex((instance) => instance.id === id)
    if (index === -1) return
    else instances.splice(index, 1)
    render(null, container)
  }
  // 在 render 之前捕获前一个实例的引用，闭包传给组件
  const prevInstance = instances.length > 0 ? instances[instances.length - 1] : null
  const getLastBottomOffset = () => {
    if (!prevInstance) return 0
    return prevInstance.vm.exposed?.bottomOffset.value ?? 0
  }

  const newProps = {
    ...props,
    id,
    onDestroy: destroy,
    getLastBottomOffset,
  }

  const vnode = h(MessageConstructor, newProps)
  render(vnode, container)
  //非空断言操作符
  document.body.appendChild(container.firstElementChild!)
  const vm = vnode.component!
  const instance = {
    id,
    vnode,
    vm,
    props: newProps,
  }
  instances.push(instance)
  return instance
}

// export const getLastInstance = () => {
//   return instances[instances.length - 1]
// }

// export const getLastBottomOffset = (id: string) => {
//   const idx = instances.findIndex((instance) => instance.id === id)
//   if (idx <= 0) return 0
//   else {
//     const prev = instances[idx - 1]
//     return prev?.vm.exposed!.bottomOffset.value ?? 0
//   }
// }
