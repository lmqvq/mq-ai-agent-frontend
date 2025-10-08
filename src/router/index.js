import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: {
            title: '首页 - AI健身教练'
        }
    },
    {
        path: '/fitness',
        name: 'FitnessMaster',
        component: () => import('../views/FitnessMaster.vue'),
        meta: {
            title: 'AI健身教练'
        }
    },
    {
        path: '/agent',
        name: 'SuperAgent',
        component: () => import('../views/SuperAgent.vue'),
        meta: {
            title: 'AI超级智能体'
        }
    },
    {
        path: '/profile',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue'),
        meta: {
            title: '个人中心 - AI健身教练'
        }
    },
    {
        path: '/data',
        name: 'FitnessData',
        component: () => import('../views/FitnessData.vue'),
        meta: {
            title: '健身数据 - AI健身教练'
        }
    },
    {
        path: '/knowledge',
        name: 'FitnessKnowledge',
        component: () => import('../views/FitnessKnowledge.vue'),
        meta: {
            title: '健身知识库 - AI健身教练'
        }
    },
    {
        path: '/ranking',
        name: 'FitnessRanking',
        component: () => import('../views/FitnessRanking.vue'),
        meta: {
            title: '健身排行榜 - AI健身教练'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: {
            title: '登录 - AI健身教练'
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: {
            title: '注册 - AI健身教练'
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