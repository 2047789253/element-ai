import { withInstall } from '../../utils/withInstall'
import CodeHighlight from './index.vue'

// 导出为带 install 方法的组件，方便外部 app.use()
export const ElACodeHighlight = withInstall(CodeHighlight)

// 导出组件自身的 Props 类型，方便外部使用 TypeScript 提示
export * from './props'

export default ElACodeHighlight
