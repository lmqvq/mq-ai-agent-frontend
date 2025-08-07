/**
 * 本地存储服务
 * 用于管理对话历史和消息的本地缓存
 */

const STORAGE_KEYS = {
  DIALOGUE_LIST: 'chat_dialogue_list',
  CHAT_HISTORY: 'chat_history_',
  CURRENT_DIALOGUE: 'current_dialogue_id',
  USER_PREFERENCES: 'user_preferences'
};

class LocalStorageService {
  /**
   * 安全地获取localStorage数据
   * @param {string} key 存储键
   * @param {*} defaultValue 默认值
   * @returns {*} 存储的数据或默认值
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  }

  /**
   * 安全地设置localStorage数据
   * @param {string} key 存储键
   * @param {*} value 要存储的值
   * @returns {boolean} 是否成功存储
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  }

  /**
   * 删除localStorage数据
   * @param {string} key 存储键
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage remove error:', error);
    }
  }

  /**
   * 清空所有聊天相关的本地存储
   */
  static clearChatData() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chat_') || key.includes('dialogue') || key.includes('history')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }

  // ==================== 对话列表管理 ====================

  /**
   * 获取缓存的对话列表
   * @returns {Array} 对话列表
   */
  static getDialogueList() {
    return this.get(STORAGE_KEYS.DIALOGUE_LIST, []);
  }

  /**
   * 缓存对话列表
   * @param {Array} dialogueList 对话列表
   */
  static setDialogueList(dialogueList) {
    this.set(STORAGE_KEYS.DIALOGUE_LIST, dialogueList);
  }

  /**
   * 添加新对话到缓存
   * @param {Object} dialogue 新对话
   */
  static addDialogue(dialogue) {
    const list = this.getDialogueList();
    list.unshift(dialogue);
    this.setDialogueList(list);
  }

  /**
   * 从缓存中删除对话
   * @param {string} dialogueId 对话ID
   */
  static removeDialogue(dialogueId) {
    const list = this.getDialogueList();
    const filteredList = list.filter(d => d.id !== dialogueId);
    this.setDialogueList(filteredList);
  }

  // ==================== 聊天历史管理 ====================

  /**
   * 获取指定对话的聊天历史
   * @param {string} dialogueId 对话ID
   * @returns {Array} 消息列表
   */
  static getChatHistory(dialogueId) {
    return this.get(STORAGE_KEYS.CHAT_HISTORY + dialogueId, []);
  }

  /**
   * 缓存指定对话的聊天历史
   * @param {string} dialogueId 对话ID
   * @param {Array} messages 消息列表
   */
  static setChatHistory(dialogueId, messages) {
    this.set(STORAGE_KEYS.CHAT_HISTORY + dialogueId, messages);
  }

  /**
   * 添加消息到指定对话的历史
   * @param {string} dialogueId 对话ID
   * @param {Object} message 消息对象
   */
  static addMessage(dialogueId, message) {
    const history = this.getChatHistory(dialogueId);
    history.push(message);
    this.setChatHistory(dialogueId, history);
  }

  /**
   * 删除指定对话的聊天历史
   * @param {string} dialogueId 对话ID
   */
  static removeChatHistory(dialogueId) {
    this.remove(STORAGE_KEYS.CHAT_HISTORY + dialogueId);
  }

  // ==================== 当前状态管理 ====================

  /**
   * 获取当前对话ID
   * @returns {string|null} 当前对话ID
   */
  static getCurrentDialogueId() {
    return this.get(STORAGE_KEYS.CURRENT_DIALOGUE);
  }

  /**
   * 设置当前对话ID
   * @param {string} dialogueId 对话ID
   */
  static setCurrentDialogueId(dialogueId) {
    this.set(STORAGE_KEYS.CURRENT_DIALOGUE, dialogueId);
  }

  /**
   * 清除当前对话ID
   */
  static clearCurrentDialogueId() {
    this.remove(STORAGE_KEYS.CURRENT_DIALOGUE);
  }

  // ==================== 用户偏好设置 ====================

  /**
   * 获取用户偏好设置
   * @returns {Object} 用户偏好设置
   */
  static getUserPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES, {
      autoSave: true,
      cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
      maxCachedDialogues: 50
    });
  }

  /**
   * 设置用户偏好
   * @param {Object} preferences 偏好设置
   */
  static setUserPreferences(preferences) {
    this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  // ==================== 缓存管理 ====================

  /**
   * 检查缓存是否过期
   * @param {string} timestamp 时间戳
   * @returns {boolean} 是否过期
   */
  static isCacheExpired(timestamp) {
    const preferences = this.getUserPreferences();
    const now = new Date().getTime();
    const cacheTime = new Date(timestamp).getTime();
    return (now - cacheTime) > preferences.cacheExpiry;
  }

  /**
   * 清理过期的缓存
   */
  static cleanExpiredCache() {
    try {
      const dialogueList = this.getDialogueList();
      const validDialogues = dialogueList.filter(dialogue => {
        return !this.isCacheExpired(dialogue.updateTime);
      });
      
      if (validDialogues.length !== dialogueList.length) {
        this.setDialogueList(validDialogues);
        
        // 清理对应的聊天历史
        dialogueList.forEach(dialogue => {
          if (this.isCacheExpired(dialogue.updateTime)) {
            this.removeChatHistory(dialogue.id);
          }
        });
      }
    } catch (error) {
      console.error('Clean expired cache error:', error);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  static getCacheStats() {
    try {
      const dialogueList = this.getDialogueList();
      let totalMessages = 0;
      
      dialogueList.forEach(dialogue => {
        const history = this.getChatHistory(dialogue.id);
        totalMessages += history.length;
      });

      return {
        dialogueCount: dialogueList.length,
        totalMessages,
        storageUsed: JSON.stringify(localStorage).length
      };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return { dialogueCount: 0, totalMessages: 0, storageUsed: 0 };
    }
  }
}

export default LocalStorageService;
