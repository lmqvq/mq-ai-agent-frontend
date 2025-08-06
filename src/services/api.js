import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
    // 线上地址
    // baseURL: 'https://cozi.chat/api',
    // 本地开发地址
    baseURL: 'http://localhost:8123/api',
    timeout: 10000,
    withCredentials: true, // 支持跨域Cookie
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 确保每个请求都携带凭证
        config.withCredentials = true
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // 处理认证错误
        if (error.response?.status === 401) {
            console.log('用户未登录或登录已过期')
            // 可以在这里触发登录状态清除
        }
        return Promise.reject(error)
    }
)

// API服务
const ApiService = {
    /**
     * 用户登录
     * @param {Object} loginData 登录数据
     * @param {string} loginData.userAccount 用户账号
     * @param {string} loginData.userPassword 用户密码
     * @returns {Promise} 登录结果
     */
    async userLogin(loginData) {
        try {
            const response = await apiClient.post('/user/login', loginData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 用户注册
     * @param {Object} registerData 注册数据
     * @param {string} registerData.userAccount 用户账号
     * @param {string} registerData.userPassword 用户密码
     * @param {string} registerData.checkPassword 确认密码
     * @returns {Promise} 注册结果
     */
    async userRegister(registerData) {
        try {
            const response = await apiClient.post('/user/register', registerData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 用户登出
     * @returns {Promise} 登出结果
     */
    async userLogout() {
        try {
            const response = await apiClient.post('/user/logout')
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取当前登录用户信息
     * @returns {Promise} 用户信息
     */
    async getLoginUser() {
        try {
            const response = await apiClient.get('/user/get/login')
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 创建SSE连接 - AI健身教练
     * @param {string} message 消息内容
     * @param {string} chatId 聊天室ID
     * @returns {EventSource} SSE连接实例
     */
    createKeepAppSSEConnection(message, chatId) {
        const url = `${apiClient.defaults.baseURL}/ai/keep_app/chat/sse?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
        return new EventSource(url)
    },

    /**
     * 创建SSE连接 - AI超级智能体
     * @param {string} message 消息内容
     * @returns {EventSource} SSE连接实例
     */
    createManusSSEConnection(message) {
        const url = `${apiClient.defaults.baseURL}/ai/manus/chat?message=${encodeURIComponent(message)}`
        return new EventSource(url)
    },

    /**
     * 生成聊天室ID
     * @returns {string} 聊天室ID
     */
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
    }
}

export default ApiService 