import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: {
            title: '首页 - AI健身大师'
        }
    },
    {
        path: '/fitness',
        name: 'FitnessMaster',
        component: () => import('../views/FitnessMaster.vue'),
        meta: {
            title: 'AI健身大师'
        }
    },
    {
        path: '/agent',
        name: 'SuperAgent',
        component: () => import('../views/SuperAgent.vue'),
        meta: {
            title: 'AI超级智能体'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局前置守卫设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

export default router 