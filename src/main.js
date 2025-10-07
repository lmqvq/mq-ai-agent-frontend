import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import './assets/styles/theme.css'
import {
    IconRobot,
    IconTrophy,
    IconApps,
    IconSend,
    IconHome,
    IconBook,
    IconHeart,
    IconRight
} from '@arco-design/web-vue/es/icon'

// 创建Pinia实例
const pinia = createPinia()
const app = createApp(App)

// 注册Arco Design图标
const icons = [
    IconRobot,
    IconTrophy,
    IconApps,
    IconSend,
    IconHome,
    IconBook,
    IconHeart,
    IconRight
]
icons.forEach(icon => {
    app.component(icon.name, icon)
})

// 注册Pinia（必须在router之前）
app.use(pinia)
app.use(router)
app.use(ArcoVue)

app.mount('#app')
