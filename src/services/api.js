import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8123/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// API服务
const ApiService = {
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