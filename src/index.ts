import './styles/index.scss'
import type { App } from 'vue'
import Button from './components/Button/Button.vue'
import Collapse, { CollapseItem } from './components/Collapse'
import Tooltip from './components/Tooltip/Tooltip.vue'
import Dropdown from './components/Dropdown/Dropdown.vue'
import Message, { createMessage } from './components/Message'
import Switch from './components/Switch/Switch.vue'
import Tag from './components/Tag/Tag.vue'

const components = {
  Button,
  Collapse,
  CollapseItem,
  Tooltip,
  Dropdown,
  Message,
  Switch,
  Tag,
}

const install = (app: App) => {
  Object.values(components).forEach((component) => {
    app.component(component.name || 'Component', component)
  })
}

export {
  install,
  Button,
  Collapse,
  CollapseItem,
  Tooltip,
  Dropdown,
  Message,
  createMessage,
  Switch,
  Tag,
}

export default {
  install,
}
