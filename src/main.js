import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import {
    IconRobot,
    IconTrophy,
    IconApps,
    IconSend
} from '@arco-design/web-vue/es/icon'

const app = createApp(App)

// 注册Arco Design图标
const icons = [IconRobot, IconTrophy, IconApps, IconSend]
icons.forEach(icon => {
    app.component(icon.name, icon)
})

app.use(router)
app.use(ArcoVue)

app.mount('#app')
