import { ref, computed } from 'vue'
import ApiService from '@/services/api'

// 用户状态管理
const userInfo = ref(null)
const isLoggedIn = computed(() => !!userInfo.value)

// 本地存储键名
const USER_INFO_KEY = 'user_info'

/**
 * 用户状态管理store
 */
export const useUserStore = () => {
  /**
   * 设置用户信息
   * @param {Object} user 用户信息
   */
  const setUserInfo = (user) => {
    userInfo.value = user
    if (user) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  /**
   * 从本地存储获取用户信息
   */
  const loadUserInfo = () => {
    try {
      const stored = localStorage.getItem(USER_INFO_KEY)
      if (stored) {
        userInfo.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  /**
   * 用户登录
   * @param {Object} loginData 登录数据
   * @returns {Promise} 登录结果
   */
  const login = async (loginData) => {
    try {
      const response = await ApiService.userLogin(loginData)
      if (response.code === 0 && response.data) {
        setUserInfo(response.data)
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return {
        success: false,
        message: error.message || '网络错误，请稍后重试'
      }
    }
  }

  /**
   * 用户注册
   * @param {Object} registerData 注册数据
   * @returns {Promise} 注册结果
   */
  const register = async (registerData) => {
    try {
      const response = await ApiService.userRegister(registerData)
      if (response.code === 0) {
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '注册失败' }
      }
    } catch (error) {
      console.error('注册失败:', error)
      return {
        success: false,
        message: error.message || '网络错误，请稍后重试'
      }
    }
  }

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  const logout = async () => {
    try {
      await ApiService.userLogout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 无论服务器响应如何，都清除本地用户信息
      setUserInfo(null)
    }
  }

  /**
   * 检查登录状态
   * @returns {Promise} 检查结果
   */
  const checkLoginStatus = async () => {
    try {
      const response = await ApiService.getLoginUser()
      if (response.code === 0 && response.data) {
        setUserInfo(response.data)
        return true
      } else {
        // 如果返回码不是0，说明未登录
        setUserInfo(null)
        return false
      }
    } catch (error) {
      // 如果是401错误或者包含"未登录"信息，说明确实未登录，不需要报错
      if (error.response?.status === 401 ||
        error.message?.includes('未登录') ||
        error.response?.data?.message?.includes('未登录')) {
        setUserInfo(null)
        return false
      }

      // 其他错误才打印日志
      console.error('检查登录状态失败:', error)
      setUserInfo(null)
      return false
    }
  }

  /**
   * 更新用户头像
   * @param {string} avatarUrl 新的头像URL
   * @returns {Promise} 更新结果
   */
  const updateUserAvatar = async (avatarUrl) => {
    try {
      const response = await ApiService.updateAvatar(avatarUrl)
      if (response.code === 0) {
        // 更新本地用户信息
        if (userInfo.value) {
          const updatedUser = { ...userInfo.value, userAvatar: avatarUrl }
          setUserInfo(updatedUser)
        }
        return { success: true }
      } else {
        return { success: false, message: response.message || '头像更新失败' }
      }
    } catch (error) {
      console.error('更新头像失败:', error)
      return {
        success: false,
        message: error.message || '网络错误，请稍后重试'
      }
    }
  }

  /**
   * 获取用户角色文本
   * @param {string} role 用户角色
   * @returns {string} 角色文本
   */
  const getRoleText = (role) => {
    const roleMap = {
      'admin': '管理员',
      'user': '普通用户',
      'vip': 'VIP用户'
    }
    return roleMap[role] || '普通用户'
  }

  return {
    // 状态
    userInfo: computed(() => userInfo.value),
    isLoggedIn,

    // 方法
    setUserInfo,
    loadUserInfo,
    login,
    register,
    logout,
    checkLoginStatus,
    updateUserAvatar,
    getRoleText
  }
}

// 初始化时加载用户信息
const { loadUserInfo } = useUserStore()
loadUserInfo()
