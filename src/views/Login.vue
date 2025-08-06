<template>
  <div class="login-container">
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

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <icon-robot />
            <div class="pulse-ring"></div>
          </div>
          <h1>AI健身教练</h1>
        </div>
        <p>欢迎回来，开始您的健身之旅</p>
        <div class="fitness-motto">
          <span>💪 塑造更强的自己</span>
        </div>
      </div>
      
      <div class="login-form">
        <a-form :model="loginForm" @submit="handleLogin" layout="vertical">
          <a-form-item 
            label="账号" 
            field="userAccount"
            :rules="[{ required: true, message: '请输入账号' }]"
          >
            <a-input 
              v-model="loginForm.userAccount" 
              placeholder="请输入您的账号"
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
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <a-input-password 
              v-model="loginForm.userPassword" 
              placeholder="请输入您的密码"
              size="large"
              :disabled="loading"
              @keyup.enter="handleLogin"
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
              @click="handleLogin"
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
        
        <div class="login-footer">
          <span>还没有账号？</span>
          <a-link @click="goToRegister">去注册</a-link>
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
  name: 'LoginPage',
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
    const loginForm = reactive({
      userAccount: '',
      userPassword: ''
    })

    /**
     * 处理登录
     */
    const handleLogin = async () => {
      // 表单验证
      if (!loginForm.userAccount.trim()) {
        Message.error('请输入账号')
        return
      }
      
      if (!loginForm.userPassword.trim()) {
        Message.error('请输入密码')
        return
      }
      
      loading.value = true
      
      try {
        const result = await userStore.login({
          userAccount: loginForm.userAccount.trim(),
          userPassword: loginForm.userPassword.trim()
        })
        
        if (result.success) {
          Message.success('登录成功')
          // 跳转到首页
          router.push('/')
        } else {
          Message.error(result.message)
        }
      } catch (error) {
        console.error('登录错误:', error)
        Message.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    /**
     * 跳转到注册页面
     */
    const goToRegister = () => {
      router.push('/register')
    }

    return {
      loading,
      loginForm,
      handleLogin,
      goToRegister
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
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

.login-card {
  width: 450px;
  background: rgba(255, 255, 255, 0.95);
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

.login-header {
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
      background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
      border-radius: 50%;
      box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);

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
        border: 2px solid rgba(255, 107, 107, 0.3);
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
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%);
    border-radius: 20px;
    border: 1px solid rgba(255, 107, 107, 0.2);

    span {
      font-size: 14px;
      font-weight: 600;
      color: #ff6b6b;
    }
  }
}

.login-form {
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
    backdrop-filter: blur(10px);

    &:hover {
      border-color: #ff6b6b;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    &.arco-input-focus {
      border-color: #ff6b6b;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
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
    background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  :deep(.arco-input-prefix) {
    color: #ff6b6b;
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  color: #666;
  font-size: 15px;

  :deep(.arco-link) {
    color: #ff6b6b;
    font-weight: 600;
    margin-left: 4px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #4ecdc4;
      text-shadow: 0 0 8px rgba(78, 205, 196, 0.3);
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
  .login-card {
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
