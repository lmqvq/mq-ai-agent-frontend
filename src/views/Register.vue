<template>
  <div class="register-container">
    <!-- 健身主题背景 -->
    <div class="fitness-background">
      <div class="muscle-lines"></div>
      <div class="floating-icons">
        <div class="icon-item" v-for="i in 6" :key="i">
          <icon-trophy v-if="i % 3 === 1" />
          <icon-fire v-else-if="i % 3 === 2" />
          <icon-heart v-else />
        </div>
      </div>
    </div>

    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <div class="logo-icon">
            <icon-robot />
            <div class="pulse-ring"></div>
          </div>
          <h1>AI健身教练</h1>
        </div>
        <p>创建账号，开启您的健身之旅</p>
        <div class="fitness-motto">
          <span>🚀 开始您的蜕变之路</span>
        </div>
      </div>
      
      <div class="register-form">
        <a-form :model="registerForm" @submit="handleRegister" layout="vertical">
          <a-form-item 
            label="账号" 
            field="userAccount"
            :rules="[
              { required: true, message: '请输入账号' },
              { minLength: 4, message: '账号至少4个字符' }
            ]"
          >
            <a-input 
              v-model="registerForm.userAccount" 
              placeholder="请输入您的账号（至少4个字符）"
              size="large"
              :disabled="loading"
            >
              <template #prefix>
                <icon-user />
              </template>
            </a-input>
          </a-form-item>
          
          <a-form-item 
            label="密码" 
            field="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { minLength: 6, message: '密码至少8个字符' }
            ]"
          >
            <a-input-password 
              v-model="registerForm.userPassword" 
              placeholder="请输入您的密码（至少8个字符）"
              size="large"
              :disabled="loading"
            >
              <template #prefix>
                <icon-lock />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item 
            label="确认密码" 
            field="checkPassword"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validatePassword }
            ]"
          >
            <a-input-password 
              v-model="registerForm.checkPassword" 
              placeholder="请再次输入密码"
              size="large"
              :disabled="loading"
              @keyup.enter="handleRegister"
            >
              <template #prefix>
                <icon-lock />
              </template>
            </a-input-password>
          </a-form-item>
          
          <a-form-item>
            <a-button 
              type="primary" 
              size="large" 
              long 
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </a-button>
          </a-form-item>
        </a-form>
        
        <div class="register-footer">
          <span>已有账号？</span>
          <a-link @click="goToLogin">去登录</a-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { IconRobot, IconUser, IconLock, IconTrophy, IconFire, IconHeart } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'RegisterPage',
  components: {
    IconRobot,
    IconUser,
    IconLock,
    IconTrophy,
    IconFire,
    IconHeart
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const loading = ref(false)
    const registerForm = reactive({
      userAccount: '',
      userPassword: '',
      checkPassword: ''
    })

    /**
     * 验证确认密码
     */
    const validatePassword = (value, callback) => {
      if (value !== registerForm.userPassword) {
        callback('两次输入的密码不一致')
      } else {
        callback()
      }
    }

    /**
     * 处理注册
     */
    const handleRegister = async () => {
      // 表单验证
      if (!registerForm.userAccount.trim()) {
        Message.error('请输入账号')
        return
      }
      
      if (registerForm.userAccount.trim().length < 4) {
        Message.error('账号至少4个字符')
        return
      }
      
      if (!registerForm.userPassword.trim()) {
        Message.error('请输入密码')
        return
      }
      
      if (registerForm.userPassword.trim().length < 6) {
        Message.error('密码至少8个字符')
        return
      }
      
      if (!registerForm.checkPassword.trim()) {
        Message.error('请确认密码')
        return
      }
      
      if (registerForm.userPassword !== registerForm.checkPassword) {
        Message.error('两次输入的密码不一致')
        return
      }
      
      loading.value = true
      
      try {
        const result = await userStore.register({
          userAccount: registerForm.userAccount.trim(),
          userPassword: registerForm.userPassword.trim(),
          checkPassword: registerForm.checkPassword.trim()
        })
        
        if (result.success) {
          Message.success('注册成功，请登录')
          // 跳转到登录页面
          router.push('/login')
        } else {
          Message.error(result.message)
        }
      } catch (error) {
        console.error('注册错误:', error)
        Message.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    /**
     * 跳转到登录页面
     */
    const goToLogin = () => {
      router.push('/login')
    }

    return {
      loading,
      registerForm,
      validatePassword,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.fitness-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .muscle-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(255, 195, 113, 0.1) 0%, transparent 50%);
    animation: pulse 4s ease-in-out infinite;
  }

  .floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .icon-item {
      position: absolute;
      color: rgba(255, 255, 255, 0.1);
      font-size: 24px;
      animation: float 6s ease-in-out infinite;

      :deep(svg) {
        width: 32px;
        height: 32px;
      }

      &:nth-child(1) {
        top: 15%;
        left: 10%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 25%;
        right: 15%;
        animation-delay: 1s;
      }

      &:nth-child(3) {
        top: 60%;
        left: 15%;
        animation-delay: 2s;
      }

      &:nth-child(4) {
        bottom: 30%;
        right: 20%;
        animation-delay: 3s;
      }

      &:nth-child(5) {
        bottom: 15%;
        left: 25%;
        animation-delay: 4s;
      }

      &:nth-child(6) {
        top: 40%;
        right: 30%;
        animation-delay: 5s;
      }
    }
  }
}

.register-card {
  width: 450px;
  background: rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 24px;
    z-index: -1;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;

    .logo-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      border-radius: 50%;
      box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);

      :deep(svg) {
        width: 32px;
        height: 32px;
        color: white;
        z-index: 2;
      }

      .pulse-ring {
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid rgba(78, 205, 196, 0.3);
        border-radius: 50%;
        animation: pulse-ring 2s ease-out infinite;
      }
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  p {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 16px;
    font-weight: 500;
  }

  .fitness-motto {
    display: inline-block;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(255, 195, 113, 0.1) 100%);
    border-radius: 20px;
    border: 1px solid rgba(78, 205, 196, 0.2);

    span {
      font-size: 14px;
      font-weight: 600;
      color: #4ecdc4;
    }
  }
}

.register-form {
  :deep(.arco-form-item-label) {
    font-weight: 600;
    color: #333;
    font-size: 15px;
    margin-bottom: 8px;
  }

  :deep(.arco-input-wrapper) {
    border-radius: 12px;
    border: 2px solid #e8e8e8;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);

    &:hover {
      border-color: #4ecdc4;
      box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
    }

    &.arco-input-focus {
      border-color: #4ecdc4;
      box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
    }
  }

  :deep(.arco-input) {
    font-size: 16px;
    padding: 12px 16px;
    background: transparent;
  }

  :deep(.arco-btn-primary) {
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    height: 48px;
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(78, 205, 196, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(78, 205, 196, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.arco-input-prefix) {
    color: #4ecdc4;
  }
}

.register-footer {
  text-align: center;
  margin-top: 32px;
  color: #666;
  font-size: 15px;

  :deep(.arco-link) {
    color: #4ecdc4;
    font-weight: 600;
    margin-left: 4px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #ff6b6b;
      text-shadow: 0 0 8px rgba(255, 107, 107, 0.3);
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(5deg);
  }
  66% {
    transform: translateY(5px) rotate(-3deg);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .register-card {
    width: 90%;
    max-width: 400px;
    padding: 32px 24px;
  }
  
  .background-decoration .decoration-circle {
    &.circle-1 {
      width: 120px;
      height: 120px;
    }
    
    &.circle-2 {
      width: 100px;
      height: 100px;
    }
    
    &.circle-3 {
      width: 80px;
      height: 80px;
    }
  }
}
</style>
