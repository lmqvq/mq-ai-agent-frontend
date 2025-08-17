<template>
  <div class="register-container">
    <!-- 健身主题背景 -->
    <div class="fitness-background">
      <!-- 健身器材剪影背景 -->
      <div class="fitness-silhouettes">
        <svg class="silhouette dumbbell-1" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 15 L15 15 L15 10 L25 10 L25 30 L15 30 L15 25 L10 25 Z M75 15 L85 15 L85 10 L90 10 L90 30 L85 30 L85 25 L75 25 Z M25 18 L75 18 L75 22 L25 22 Z" fill="rgba(255,255,255,0.03)"/>
        </svg>
        <svg class="silhouette barbell-1" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10 L15 10 L15 5 L20 5 L20 25 L15 25 L15 20 L5 20 Z M100 10 L110 10 L110 5 L115 5 L115 25 L110 25 L110 20 L100 20 Z M20 13 L100 13 L100 17 L20 17 Z" fill="rgba(255,255,255,0.04)"/>
        </svg>
        <svg class="silhouette kettlebell-1" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 10 L35 10 L35 5 L40 5 L40 15 L35 15 L35 20 L45 25 L45 65 C45 70 40 75 35 75 L25 75 C20 75 15 70 15 65 L15 25 L25 20 Z" fill="rgba(255,255,255,0.03)"/>
        </svg>
        <svg class="silhouette treadmill-1" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 40 L90 40 L90 50 L10 50 Z M20 20 L30 20 L30 40 L20 40 Z M70 15 L80 15 L80 25 L70 25 Z M15 50 C12 50 10 52 10 55 C10 58 12 60 15 60 C18 60 20 58 20 55 C20 52 18 50 15 50 Z M85 50 C82 50 80 52 80 55 C80 58 82 60 85 60 C88 60 90 58 90 55 C90 52 88 50 85 50 Z" fill="rgba(255,255,255,0.04)"/>
        </svg>
      </div>

      <!-- 动态粒子效果 -->
      <div class="particle-system">
        <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
      </div>

      <!-- 增强的肌肉纹理背景 -->
      <div class="muscle-texture"></div>

      <!-- 升级的浮动图标 -->
      <div class="floating-icons">
        <div class="icon-item" v-for="i in 8" :key="i">
          <icon-trophy v-if="i % 4 === 1" />
          <icon-fire v-else-if="i % 4 === 2" />
          <icon-heart v-else-if="i % 4 === 3" />
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 11.8 12.8 14 10 14S5 11.8 5 9V7L3 7V9C3 12.9 6.1 16 10 16V22H14V16C17.9 16 21 12.9 21 9Z"/>
          </svg>
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

    /**
     * 生成粒子样式
     */
    const getParticleStyle = (index) => {
      const size = Math.random() * 4 + 2
      const left = Math.random() * 100
      const animationDelay = (Math.random() + index * 0.1) * 10
      const animationDuration = Math.random() * 20 + 15

      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`
      }
    }

    return {
      loading,
      registerForm,
      validatePassword,
      handleRegister,
      goToLogin,
      getParticleStyle
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
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1e3c72 100%);
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

  // 健身器材剪影背景
  .fitness-silhouettes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .silhouette {
      position: absolute;
      opacity: 0.8;
      animation: float-silhouette 8s ease-in-out infinite;

      &.dumbbell-1 {
        top: 15%;
        left: 8%;
        width: 80px;
        height: 32px;
        animation-delay: 0s;
      }

      &.barbell-1 {
        top: 70%;
        right: 10%;
        width: 100px;
        height: 25px;
        animation-delay: 2s;
      }

      &.kettlebell-1 {
        bottom: 20%;
        left: 12%;
        width: 40px;
        height: 60px;
        animation-delay: 4s;
      }

      &.treadmill-1 {
        top: 40%;
        right: 15%;
        width: 80px;
        height: 48px;
        animation-delay: 6s;
      }
    }
  }

  // 动态粒子系统
  .particle-system {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .particle {
      position: absolute;
      background: radial-gradient(circle, rgba(78, 205, 196, 0.6) 0%, rgba(255, 195, 113, 0.4) 50%, transparent 100%);
      border-radius: 50%;
      animation: particle-float linear infinite;
      top: 100%;
    }
  }

  // 增强的肌肉纹理背景
  .muscle-texture {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(ellipse at 25% 20%, rgba(78, 205, 196, 0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 75% 30%, rgba(255, 195, 113, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 40% 70%, rgba(255, 107, 107, 0.1) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(138, 43, 226, 0.08) 0%, transparent 60%),
      linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%);
    animation: muscle-pulse 6s ease-in-out infinite;
  }

  // 升级的浮动图标系统
  .floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .icon-item {
      position: absolute;
      color: rgba(255, 255, 255, 0.12);
      font-size: 28px;
      animation: enhanced-float 8s ease-in-out infinite;
      filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.3));

      :deep(svg) {
        width: 36px;
        height: 36px;
        transition: all 0.3s ease;
      }

      &:hover :deep(svg) {
        transform: scale(1.2);
        filter: drop-shadow(0 0 12px rgba(255, 195, 113, 0.6));
      }

      &:nth-child(1) {
        top: 12%;
        left: 8%;
        animation-delay: 0s;
        color: rgba(78, 205, 196, 0.15);
      }

      &:nth-child(2) {
        top: 22%;
        right: 12%;
        animation-delay: 1s;
        color: rgba(255, 195, 113, 0.15);
      }

      &:nth-child(3) {
        top: 55%;
        left: 12%;
        animation-delay: 2s;
        color: rgba(255, 107, 107, 0.15);
      }

      &:nth-child(4) {
        bottom: 25%;
        right: 18%;
        animation-delay: 3s;
        color: rgba(138, 43, 226, 0.15);
      }

      &:nth-child(5) {
        bottom: 12%;
        left: 22%;
        animation-delay: 4s;
        color: rgba(78, 205, 196, 0.12);
      }

      &:nth-child(6) {
        top: 35%;
        right: 25%;
        animation-delay: 5s;
        color: rgba(255, 195, 113, 0.12);
      }

      &:nth-child(7) {
        top: 65%;
        right: 8%;
        animation-delay: 6s;
        color: rgba(255, 107, 107, 0.12);
      }

      &:nth-child(8) {
        bottom: 40%;
        left: 5%;
        animation-delay: 7s;
        color: rgba(138, 43, 226, 0.12);
      }
    }
  }
}

.register-card {
  width: 480px;
  background: rgba(255, 255, 255, 0.98);
  -webkit-backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
  border-radius: 28px;
  padding: 52px;
  box-shadow:
    0 32px 100px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.35);
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow:
      0 40px 120px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.05) 100%);
    border-radius: 28px;
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 50%;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%);
    border-radius: 27px 27px 0 0;
    z-index: -1;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 44px;
  position: relative;

  // 添加装饰性背景元素
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(78, 205, 196, 0.3) 25%,
      rgba(255, 195, 113, 0.3) 75%,
      transparent 100%);
    border-radius: 2px;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;

    .logo-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 50%, #ffc371 100%);
      border-radius: 50%;
      box-shadow:
        0 12px 40px rgba(78, 205, 196, 0.4),
        inset 0 2px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow:
          0 16px 50px rgba(78, 205, 196, 0.5),
          inset 0 2px 0 rgba(255, 255, 255, 0.4);
      }

      :deep(svg) {
        width: 38px;
        height: 38px;
        color: white;
        z-index: 2;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      .pulse-ring {
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border: 3px solid rgba(78, 205, 196, 0.4);
        border-radius: 50%;
        animation: enhanced-pulse-ring 3s ease-out infinite;
      }

      // 添加内部光晕效果
      &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        z-index: 1;
      }
    }

    h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      letter-spacing: -0.5px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
        border-radius: 1px;
      }
    }
  }

  p {
    margin: 0 0 20px 0;
    color: #555;
    font-size: 17px;
    font-weight: 500;
    line-height: 1.4;
    opacity: 0.9;
  }

  .fitness-motto {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg,
      rgba(78, 205, 196, 0.15) 0%,
      rgba(255, 195, 113, 0.12) 50%,
      rgba(255, 107, 107, 0.1) 100%);
    border-radius: 25px;
    border: 1px solid rgba(78, 205, 196, 0.25);
    box-shadow:
      0 4px 16px rgba(78, 205, 196, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 24px rgba(78, 205, 196, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%);
      animation: shimmer 3s ease-in-out infinite;
    }

    span {
      font-size: 15px;
      font-weight: 700;
      background: linear-gradient(135deg, #4ecdc4 0%, #ffc371 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
      z-index: 1;
    }
  }
}

.register-form {
  :deep(.arco-form-item-label) {
    font-weight: 700;
    color: #2c3e50;
    font-size: 10px;
    margin-bottom: 10px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 20px;
      height: 2px;
      background: linear-gradient(90deg, #4ecdc4 0%, #ffc371 100%);
      border-radius: 1px;
    }
  }

  :deep(.arco-input-wrapper) {
    border-radius: 16px;
    border: 2px solid #e1e8ed;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.9);
    -webkit-backdrop-filter: blur(15px);
    backdrop-filter: blur(15px);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(78, 205, 196, 0.1) 50%,
        transparent 100%);
      transition: left 0.6s ease;
    }

    &:hover {
      border-color: #4ecdc4;
      box-shadow:
        0 0 0 4px rgba(78, 205, 196, 0.12),
        0 4px 16px rgba(78, 205, 196, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);

      &::before {
        left: 100%;
      }
    }

    &.arco-input-focus {
      border-color: #4ecdc4;
      box-shadow:
        0 0 0 4px rgba(78, 205, 196, 0.2),
        0 8px 24px rgba(78, 205, 196, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
    }
  }

  :deep(.arco-input) {
    font-size: 16px;
    padding: 14px 18px;
    background: transparent;
    font-weight: 500;
    color: #2c3e50;

    &::placeholder {
      color: #a0aec0;
      font-weight: 400;
    }
  }

  :deep(.arco-btn-primary) {
    border-radius: 16px;
    font-weight: 700;
    font-size: 17px;
    height: 54px;
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 50%, #ffc371 100%);
    border: none;
    box-shadow:
      0 6px 20px rgba(78, 205, 196, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    letter-spacing: 0.5px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%);
      transition: left 0.6s ease;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow:
        0 12px 32px rgba(78, 205, 196, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(-1px);
      box-shadow:
        0 4px 16px rgba(78, 205, 196, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    &.arco-btn-loading {
      &::before {
        animation: button-loading 1.5s linear infinite;
      }
    }
  }

  :deep(.arco-input-prefix) {
    color: #4ecdc4;
    font-size: 18px;
    margin-right: 4px;
    transition: all 0.3s ease;

    svg {
      filter: drop-shadow(0 1px 2px rgba(78, 205, 196, 0.3));
    }
  }

  :deep(.arco-input-wrapper:focus-within .arco-input-prefix) {
    color: #ffc371;
    transform: scale(1.1);

    svg {
      filter: drop-shadow(0 2px 4px rgba(255, 195, 113, 0.4));
    }
  }
}

.register-footer {
  text-align: center;
  margin-top: 36px;
  color: #718096;
  font-size: 16px;
  font-weight: 500;

  :deep(.arco-link) {
    color: #4ecdc4;
    font-weight: 700;
    margin-left: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    padding: 2px 8px;
    border-radius: 8px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(255, 195, 113, 0.1) 100%);
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      color: #ff6b6b;
      text-shadow: 0 0 12px rgba(255, 107, 107, 0.4);
      transform: translateY(-1px);

      &::before {
        opacity: 1;
      }
    }
  }
}

// 增强的动画效果系统
@keyframes muscle-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes enhanced-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-12px) rotate(3deg) scale(1.05);
  }
  50% {
    transform: translateY(-8px) rotate(-2deg) scale(1.02);
  }
  75% {
    transform: translateY(6px) rotate(4deg) scale(1.03);
  }
}

@keyframes float-silhouette {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.8;
  }
  33% {
    transform: translateY(-8px) rotate(2deg);
    opacity: 0.6;
  }
  66% {
    transform: translateY(4px) rotate(-1deg);
    opacity: 0.9;
  }
}

@keyframes particle-float {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(20px) scale(0);
    opacity: 0;
  }
}

@keyframes enhanced-pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes button-loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 增强的响应式设计
@media (max-width: 768px) {
  .register-container {
    padding: 20px;
  }

  .register-card {
    width: 100%;
    max-width: 420px;
    padding: 40px 28px;
    border-radius: 24px;
  }

  .register-header {
    margin-bottom: 36px;

    .logo {
      gap: 16px;

      .logo-icon {
        width: 64px;
        height: 64px;

        :deep(svg) {
          width: 32px;
          height: 32px;
        }
      }

      h1 {
        font-size: 30px;
      }
    }
  }

  .fitness-background {
    .fitness-silhouettes .silhouette {
      &.dumbbell-1 {
        width: 60px;
        height: 24px;
      }

      &.barbell-1 {
        width: 80px;
        height: 20px;
      }

      &.kettlebell-1 {
        width: 32px;
        height: 48px;
      }

      &.treadmill-1 {
        width: 64px;
        height: 38px;
      }
    }

    .floating-icons .icon-item {
      :deep(svg) {
        width: 28px;
        height: 28px;
      }
    }
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 32px 20px;
    margin: 0 16px;
  }

  .register-header .logo {
    flex-direction: column;
    gap: 12px;

    h1 {
      font-size: 26px;
    }
  }

  :deep(.arco-btn-primary) {
    height: 48px;
    font-size: 16px;
  }
}
</style>
