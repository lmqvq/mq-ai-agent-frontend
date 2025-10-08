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
     * 上传用户头像
     * @param {File} file 头像文件
     * @returns {Promise} 上传结果，返回头像URL
     */
    async uploadAvatar(file) {
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await apiClient.post('/user/avatar/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 更新用户头像
     * @param {string} avatarUrl 头像URL
     * @returns {Promise} 更新结果
     */
    async updateAvatar(avatarUrl) {
        try {
            const response = await apiClient.post('/user/avatar/update', null, {
                params: {
                    avatarUrl: avatarUrl
                }
            })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
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
                const formattedDialogues = dialogues.map(item => {
                    // 优化对话标题：使用用户的第一条消息作为标题
                    let title = '新对话';

                    if (item.messages && Array.isArray(item.messages) && item.messages.length > 0) {
                        // 查找第一条用户消息
                        const firstUserMessage = item.messages.find(msg =>
                            msg.messageType === 'USER' || msg.messageType === 'user'
                        );

                        if (firstUserMessage && firstUserMessage.message) {
                            const message = firstUserMessage.message.trim();
                            // 使用6-12个字符作为标题
                            if (message.length <= 12) {
                                title = message;
                            } else {
                                title = message.substring(0, 12) + '...';
                            }
                        }
                    } else if (item.lastMessage) {
                        // 如果没有消息数组，使用lastMessage
                        const message = item.lastMessage.trim();
                        if (message.length <= 12) {
                            title = message;
                        } else {
                            title = message.substring(0, 12) + '...';
                        }
                    }

                    return {
                        id: item.chatId,
                        title: title,
                        type: 'fitness', // 默认类型，可以根据需要调整
                        createTime: item.createTime,
                        updateTime: item.updateTime,
                        lastMessage: item.lastMessage
                    };
                });

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
            console.log('正在调用删除对话API，chatId:', dialogueId);
            const response = await apiClient.delete(`/chat/history/delete?chatId=${dialogueId}`)
            console.log('删除对话API响应状态:', response.status);
            console.log('删除对话API响应数据:', response.data);
            return response.data
        } catch (error) {
            console.error('删除对话API调用失败:', error);
            console.error('错误状态码:', error.response?.status);
            console.error('错误响应:', error.response?.data);
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
    },

    // ==================== 健身数据管理 ====================

    /**
     * 添加健身数据
     * @param {Object} fitnessData 健身数据
     * @param {number} fitnessData.weight 体重(kg)
     * @param {number} fitnessData.bodyFat 体脂率(%)
     * @param {number} fitnessData.height 身高(cm)
     * @param {string} fitnessData.dateRecorded 记录日期
     * @returns {Promise} 添加结果
     */
    async addFitnessData(fitnessData) {
        try {
            const response = await apiClient.post('/fitness/data/add', fitnessData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 更新健身数据
     * @param {Object} fitnessData 健身数据
     * @param {number} fitnessData.id 数据ID
     * @param {number} fitnessData.weight 体重(kg)
     * @param {number} fitnessData.bodyFat 体脂率(%)
     * @param {number} fitnessData.height 身高(cm)
     * @param {string} fitnessData.dateRecorded 记录日期
     * @returns {Promise} 更新结果
     */
    async updateFitnessData(fitnessData) {
        try {
            const response = await apiClient.post('/fitness/data/update', fitnessData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 删除健身数据
     * @param {number} id 数据ID
     * @returns {Promise} 删除结果
     */
    async deleteFitnessData(id) {
        try {
            const response = await apiClient.post('/fitness/data/delete', { id })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取健身数据详情
     * @param {number} id 数据ID
     * @returns {Promise} 数据详情
     */
    async getFitnessData(id) {
        try {
            const response = await apiClient.get(`/fitness/data/get?id=${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 分页查询我的健身数据
     * @param {Object} queryParams 查询参数
     * @param {number} queryParams.current 当前页
     * @param {number} queryParams.pageSize 页面大小
     * @param {string} queryParams.startDate 开始日期
     * @param {string} queryParams.endDate 结束日期
     * @returns {Promise} 分页数据
     */
    async getMyFitnessDataByPage(queryParams) {
        try {
            const response = await apiClient.post('/fitness/data/my/list/page', queryParams)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取健身数据趋势
     * @param {number} days 天数，默认30天
     * @returns {Promise} 趋势数据
     */
    async getFitnessTrends(days = 30) {
        try {
            const response = await apiClient.get(`/fitness/data/trends?days=${days}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== 运动记录管理 ====================

    /**
     * 添加运动记录
     * @param {Object} exerciseData 运动数据
     * @param {string} exerciseData.exerciseType 运动类型
     * @param {number} exerciseData.duration 运动时长(分钟)
     * @param {number} exerciseData.caloriesBurned 消耗卡路里
     * @param {string} exerciseData.dateRecorded 记录日期
     * @param {string} exerciseData.notes 备注
     * @returns {Promise} 添加结果
     */
    async addExerciseLog(exerciseData) {
        try {
            const response = await apiClient.post('/fitness/exercise/add', exerciseData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 更新运动记录
     * @param {Object} exerciseData 运动数据
     * @param {number} exerciseData.id 记录ID
     * @param {string} exerciseData.exerciseType 运动类型
     * @param {number} exerciseData.duration 运动时长(分钟)
     * @param {number} exerciseData.caloriesBurned 消耗卡路里
     * @param {string} exerciseData.dateRecorded 记录日期
     * @param {string} exerciseData.notes 备注
     * @returns {Promise} 更新结果
     */
    async updateExerciseLog(exerciseData) {
        try {
            const response = await apiClient.post('/fitness/exercise/update', exerciseData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 删除运动记录
     * @param {number} id 记录ID
     * @returns {Promise} 删除结果
     */
    async deleteExerciseLog(id) {
        try {
            const response = await apiClient.post('/fitness/exercise/delete', { id })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 分页查询我的运动记录
     * @param {Object} queryParams 查询参数
     * @param {number} queryParams.current 当前页
     * @param {number} queryParams.pageSize 页面大小
     * @param {string} queryParams.exerciseType 运动类型
     * @param {string} queryParams.startDate 开始日期
     * @param {string} queryParams.endDate 结束日期
     * @returns {Promise} 分页数据
     */
    async getMyExerciseLogByPage(queryParams) {
        try {
            const response = await apiClient.post('/fitness/exercise/my/list/page', queryParams)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取运动统计
     * @param {number} days 天数，默认7天
     * @returns {Promise} 统计数据
     */
    async getExerciseStats(days = 7) {
        try {
            const response = await apiClient.get(`/fitness/exercise/stats?days=${days}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取总卡路里消耗
     * @param {number} days 天数，默认7天
     * @returns {Promise} 卡路里数据
     */
    async getTotalCaloriesBurned(days = 7) {
        try {
            const response = await apiClient.get(`/fitness/exercise/calories?days=${days}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== 训练计划管理 ====================

    /**
     * 创建训练计划
     * @param {Object} planData 训练计划数据
     * @param {string} planData.planName 计划名称
     * @param {string} planData.planType 计划类型
     * @param {string} planData.planDetails 计划详情(JSON格式)
     * @param {number} planData.isDefault 是否默认计划(0/1)
     * @param {string} planData.startDate 开始日期
     * @param {string} planData.endDate 结束日期
     * @returns {Promise} 创建结果
     */
    async addTrainingPlan(planData) {
        try {
            const response = await apiClient.post('/fitness/plan/add', planData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 更新训练计划
     * @param {Object} planData 训练计划数据
     * @param {number} planData.id 计划ID
     * @param {string} planData.planName 计划名称
     * @param {string} planData.planType 计划类型
     * @param {string} planData.planDetails 计划详情(JSON格式)
     * @param {string} planData.startDate 开始日期
     * @param {string} planData.endDate 结束日期
     * @returns {Promise} 更新结果
     */
    async updateTrainingPlan(planData) {
        try {
            const response = await apiClient.post('/fitness/plan/update', planData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 删除训练计划
     * @param {number} id 计划ID
     * @returns {Promise} 删除结果
     */
    async deleteTrainingPlan(id) {
        try {
            const response = await apiClient.post('/fitness/plan/delete', { id })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取默认训练计划
     * @returns {Promise} 默认计划列表
     */
    async getDefaultTrainingPlans() {
        try {
            const response = await apiClient.get('/fitness/plan/default')
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 分页查询我的训练计划
     * @param {Object} queryParams 查询参数
     * @param {number} queryParams.current 当前页
     * @param {number} queryParams.pageSize 页面大小
     * @param {string} queryParams.planType 计划类型
     * @returns {Promise} 分页数据
     */
    async getMyTrainingPlanByPage(queryParams) {
        try {
            const response = await apiClient.post('/fitness/plan/my/list/page', queryParams)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== 健身目标管理 ====================

    /**
     * 创建健身目标
     * @param {Object} goalData 目标数据
     * @param {string} goalData.goalType 目标类型
     * @param {string} goalData.targetValue 目标值
     * @param {string} goalData.startDate 开始日期
     * @param {string} goalData.endDate 结束日期
     * @returns {Promise} 创建结果
     */
    async addFitnessGoal(goalData) {
        try {
            const response = await apiClient.post('/fitness/goal/add', goalData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 更新健身目标
     * @param {Object} goalData 目标数据
     * @param {number} goalData.id 目标ID
     * @param {string} goalData.goalType 目标类型
     * @param {string} goalData.targetValue 目标值
     * @param {string} goalData.progress 进度(JSON格式)
     * @param {number} goalData.isAchieved 是否达成(0/1)
     * @returns {Promise} 更新结果
     */
    async updateFitnessGoal(goalData) {
        try {
            const response = await apiClient.post('/fitness/goal/update', goalData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 删除健身目标
     * @param {number} id 目标ID
     * @returns {Promise} 删除结果
     */
    async deleteFitnessGoal(id) {
        try {
            const response = await apiClient.post('/fitness/goal/delete', { id })
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取进行中的健身目标
     * @returns {Promise} 活跃目标列表
     */
    async getActiveFitnessGoals() {
        try {
            const response = await apiClient.get('/fitness/goal/active')
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 分页查询我的健身目标
     * @param {Object} queryParams 查询参数
     * @param {number} queryParams.current 当前页
     * @param {number} queryParams.pageSize 页面大小
     * @param {string} queryParams.goalType 目标类型
     * @param {number} queryParams.isAchieved 是否达成(0/1)
     * @returns {Promise} 分页数据
     */
    async getMyFitnessGoalByPage(queryParams) {
        try {
            const response = await apiClient.post('/fitness/goal/my/list/page', queryParams)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== BMI计算相关 ====================

    /**
     * 计算BMI指数
     * @param {Object} bmiData BMI计算数据
     * @param {number} bmiData.weight 体重(kg)
     * @param {number} bmiData.height 身高(cm)
     * @returns {Promise} BMI计算结果
     */
    async calculateBMI(bmiData) {
        try {
            const response = await apiClient.post('/fitness/bmi/calculate', bmiData)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    // ==================== 健身排行榜相关 ====================

    /**
     * 获取排行榜列表
     * @param {Object} queryParams 查询参数
     * @param {number} queryParams.current 当前页
     * @param {number} queryParams.pageSize 页面大小
     * @param {string} queryParams.sortField 排序字段
     * @param {string} queryParams.sortOrder 排序方式
     * @param {string} queryParams.rankingType 排行榜类型
     * @returns {Promise} 排行榜数据
     */
    async getRankingList(queryParams) {
        try {
            const response = await apiClient.post('/fitness/ranking/list', queryParams)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    },

    /**
     * 获取我的排名
     * @param {string} rankingType 排行榜类型
     * @returns {Promise} 我的排名数据
     */
    async getMyRanking(rankingType) {
        try {
            const response = await apiClient.get(`/fitness/ranking/my?rankingType=${rankingType}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error
        }
    }
}

export default ApiService