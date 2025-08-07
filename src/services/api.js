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
        const url = `${apiClient.defaults.baseURL}/ai/keep_app/chat/sse/user?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
        return new EventSource(url, { withCredentials: true })
    },

    /**
     * 创建SSE连接 - AI超级智能体
     * @param {string} message 消息内容
     * @param {string} chatId 聊天室ID
     * @returns {EventSource} SSE连接实例
     */
    createManusSSEConnection(message, chatId) {
        const url = `${apiClient.defaults.baseURL}/ai/manus/chat/user?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}`
        return new EventSource(url, { withCredentials: true })
    },

    /**
     * 生成聊天室ID
     * @returns {string} 聊天室ID
     */
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
    },

    // ==================== 对话历史管理 ====================

    /**
     * 获取用户的历史对话列表
     * @returns {Promise} 对话列表
     */
    async getChatHistoryList() {
        try {
            console.log('正在调用 /chat/history/list API...');
            const response = await apiClient.get('/chat/history/list')
            console.log('API响应状态:', response.status);
            console.log('API原始响应数据:', response.data);

            if (response.data && response.data.code === 0) {
                const dialogues = response.data.data || [];
                console.log('成功获取对话列表，数量:', dialogues.length);
                console.log('对话列表详情:', dialogues);

                // 转换数据格式以适配前端
                const formattedDialogues = dialogues.map(item => ({
                    id: item.chatId,
                    title: item.lastMessage ? item.lastMessage.substring(0, 20) + '...' : '新对话',
                    type: 'fitness', // 默认类型，可以根据需要调整
                    createTime: item.createTime,
                    updateTime: item.updateTime,
                    lastMessage: item.lastMessage
                }));

                console.log('转换后的对话列表:', formattedDialogues);

                return {
                    code: 0,
                    data: formattedDialogues,
                    message: response.data.message || ''
                };
            } else {
                console.warn('API响应异常:', response.data);
                return response.data;
            }

        } catch (error) {
            console.error('获取对话列表API调用失败:', error);
            console.error('错误状态码:', error.response?.status);
            console.error('错误响应:', error.response?.data);
            throw error.response?.data || error
        }
    },

    /**
     * 获取单个对话的完整消息
     * @param {string} chatId 对话ID
     * @returns {Promise} 对话详情
     */
    async getChatHistoryDetail(chatId) {
        try {
            console.log('正在调用 /chat/history/detail API，chatId:', chatId);
            const response = await apiClient.get(`/chat/history/detail?chatId=${chatId}`)
            console.log('对话详情API响应状态:', response.status);
            console.log('对话详情API原始响应:', response.data);

            if (response.data && response.data.code === 0 && response.data.data) {
                const chatData = response.data.data;
                console.log('对话详情数据:', chatData);
                console.log('消息数组:', chatData.messages);

                // 确保返回正确的数据格式
                return {
                    code: 0,
                    data: {
                        chatId: chatData.chatId,
                        messages: chatData.messages || []
                    },
                    message: response.data.message || ''
                };
            } else {
                console.warn('对话详情API响应异常:', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('获取对话详情API调用失败:', error);
            console.error('错误状态码:', error.response?.status);
            console.error('错误响应:', error.response?.data);
            throw error.response?.data || error
        }
    },

    /**
     * 删除对话历史
     * @param {string} chatId 对话ID
     * @returns {Promise} 删除结果
     */
    async deleteChatHistory(chatId) {
        try {
            const response = await apiClient.delete(`/chat/history/delete?chatId=${chatId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取最新的聊天历史
     * @param {number} dialogueId 对话ID
     * @param {number} limit 限制数量，默认10
     * @returns {Promise} 最新聊天历史列表
     */
    async getLatestChatHistory(dialogueId, limit = 10) {
        try {
            const response = await apiClient.get(`/chatHistory/dialogue/${dialogueId}/latest?limit=${limit}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 添加聊天历史记录
     * @param {Object} chatData 聊天数据
     * @param {string} chatData.message 消息内容
     * @param {string} chatData.messageType 消息类型（user/ai）
     * @param {number} chatData.dialogueId 对话ID
     * @returns {Promise} 添加结果
     */
    async addChatHistory(chatData) {
        try {
            const response = await apiClient.post('/chatHistory/add', chatData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 保存用户消息
     * @param {string} dialogueId 对话ID
     * @param {string} message 消息内容
     * @returns {Promise} 保存结果
     */
    async saveUserMessage(dialogueId, message) {
        try {
            const response = await apiClient.post(`/chatHistory/save/user?message=${encodeURIComponent(message)}&dialogueId=${dialogueId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 保存AI消息
     * @param {string} dialogueId 对话ID
     * @param {string} message 消息内容
     * @returns {Promise} 保存结果
     */
    async saveAiMessage(dialogueId, message) {
        try {
            const response = await apiClient.post(`/chatHistory/save/ai?message=${encodeURIComponent(message)}&dialogueId=${dialogueId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 保存AI错误消息
     * @param {string} dialogueId 对话ID
     * @param {string} errorMessage 错误消息内容
     * @returns {Promise} 保存结果
     */
    async saveAiErrorMessage(dialogueId, errorMessage) {
        try {
            const response = await apiClient.post(`/chatHistory/save/ai/error?errorMessage=${encodeURIComponent(errorMessage)}&dialogueId=${dialogueId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 删除对话的所有聊天历史
     * @param {number} dialogueId 对话ID
     * @returns {Promise} 删除结果
     */
    async deleteChatHistoryByDialogue(dialogueId) {
        try {
            const response = await apiClient.delete(`/chatHistory/dialogue/${dialogueId}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== 对话管理 ====================

    /**
     * 获取用户的对话列表（使用历史对话接口）
     * @returns {Promise} 对话列表
     */
    async getDialogueList() {
        // 使用历史对话列表接口
        return await this.getChatHistoryList()
    },

    /**
     * 创建新对话
     * @param {Object} dialogueData 对话数据
     * @param {string} dialogueData.title 对话标题
     * @param {string} dialogueData.type 对话类型（fitness/agent）
     * @returns {Promise} 创建结果
     */
    async createDialogue(dialogueData) {
        try {
            // 生成新的对话ID
            const chatId = this.generateChatId();
            console.log('创建新对话，生成ID:', chatId);

            // 注意：不再预先保存初始消息
            // keep_report记录会在用户发送第一条消息时自动创建

            const newDialogue = {
                id: chatId,
                title: dialogueData.title || '新对话',
                type: dialogueData.type,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            }

            console.log('新对话创建成功:', newDialogue);
            return { code: 0, data: newDialogue }
        } catch (error) {
            console.error('创建对话失败:', error);
            throw error.response?.data || error
        }
    },

    /**
     * 更新对话信息
     * @param {number} dialogueId 对话ID
     * @param {Object} updateData 更新数据
     * @returns {Promise} 更新结果
     */
    // eslint-disable-next-line no-unused-vars
    async updateDialogue(dialogueId, updateData) {
        // 注意：这里需要根据实际的更新对话API来实现
        // 实际应该调用类似 /dialogue/update 的接口
        return { code: 0, data: true }
    },

    /**
     * 删除对话
     * @param {number} dialogueId 对话ID
     * @returns {Promise} 删除结果
     */
    async deleteDialogue(dialogueId) {
        try {
            // 先删除对话的所有聊天历史
            await this.deleteChatHistoryByDialogue(dialogueId)

            // 注意：这里需要根据实际的删除对话API来实现
            // 实际应该调用类似 /dialogue/delete 的接口
            return { code: 0, data: true }
        } catch (error) {
            throw error.response?.data || error
        }
    }
}

export default ApiService 