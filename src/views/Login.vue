<template>
  <div class="login-container">
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
      loginForm,
      handleLogin,
      goToRegister,
      getParticleStyle
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
  background: var(--color-bg-1);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
  
  // 暗黑模式渐变背景
  body[arco-theme='dark'] & {
    background: linear-gradient(135deg, 
      rgba(15, 15, 35, 1) 0%, 
      rgba(26, 26, 46, 1) 25%, 
      rgba(22, 33, 62, 1) 50%, 
      rgba(15, 52, 96, 1) 75%, 
      rgba(30, 60, 114, 1) 100%
    );
  }
  
  // 白色模式渐变背景
  body:not([arco-theme='dark']) & {
    background: linear-gradient(135deg, 
      #f0f2f5 0%, 
      #e8ecf1 25%, 
      #dfe5ed 50%, 
      #d5dce6 75%, 
      #ccd4df 100%
    );
  }
}

.fitness-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  transition: all 0.3s ease;

  // 现代几何背景层
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(var(--primary-rgb), 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(var(--success-rgb), 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(var(--warning-rgb), 0.05) 0%, transparent 50%);
    animation: gradient-shift 20s ease infinite;
  }

  // 网格图案
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(var(--primary-rgb), 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--primary-rgb), 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-move 60s linear infinite;
    
    body[arco-theme='dark'] & {
      opacity: 0.3;
    }
    
    body:not([arco-theme='dark']) & {
      opacity: 0.15;
    }
  }

  // 几何形状装饰
  .fitness-silhouettes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .silhouette {
      position: absolute;
      opacity: 0;
      animation: geometric-float 15s ease-in-out infinite;
      
      body[arco-theme='dark'] & {
        opacity: 0.06;
        filter: brightness(1.2);
      }
      
      body:not([arco-theme='dark']) & {
        opacity: 0.08;
        filter: brightness(0.8) contrast(1.1);
      }

      path {
        body[arco-theme='dark'] & {
          fill: rgba(255, 255, 255, 0.08);
        }
        
        body:not([arco-theme='dark']) & {
          fill: rgba(0, 0, 0, 0.06);
        }
      }

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
        animation-delay: 5s;
      }

      &.kettlebell-1 {
        bottom: 20%;
        left: 12%;
        width: 40px;
        height: 60px;
        animation-delay: 10s;
      }

      &.treadmill-1 {
        top: 40%;
        right: 15%;
        width: 80px;
        height: 48px;
        animation-delay: 15s;
      }
    }
  }

  // 优雅的粒子系统
  .particle-system {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .particle {
      position: absolute;
      border-radius: 50%;
      animation: elegant-particle-float linear infinite;
      top: 110%;
      
      body[arco-theme='dark'] & {
        background: radial-gradient(circle, 
          rgba(var(--primary-rgb), 0.3) 0%, 
          rgba(var(--success-rgb), 0.2) 50%, 
          transparent 100%
        );
      }
      
      body:not([arco-theme='dark']) & {
        background: radial-gradient(circle, 
          rgba(var(--primary-rgb), 0.15) 0%, 
          rgba(var(--success-rgb), 0.1) 50%, 
          transparent 100%
        );
      }
    }
  }

  // 光影纹理层
  .muscle-texture {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: opacity 0.3s ease;
    
    body[arco-theme='dark'] & {
      background-image:
        radial-gradient(ellipse at 25% 20%, rgba(var(--primary-rgb), 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, rgba(var(--success-rgb), 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(var(--warning-rgb), 0.08) 0%, transparent 50%);
    }
    
    body:not([arco-theme='dark']) & {
      background-image:
        radial-gradient(ellipse at 25% 20%, rgba(var(--primary-rgb), 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, rgba(var(--success-rgb), 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(var(--warning-rgb), 0.04) 0%, transparent 50%);
    }
    
    animation: texture-pulse 12s ease-in-out infinite;
  }

  // 精致的浮动图标
  .floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .icon-item {
      position: absolute;
      font-size: 32px;
      animation: elegant-icon-float 12s ease-in-out infinite;
      transition: all 0.3s ease;
      
      body[arco-theme='dark'] & {
        color: rgba(255, 255, 255, 0.08);
        filter: drop-shadow(0 0 10px rgba(var(--primary-rgb), 0.15));
      }
      
      body:not([arco-theme='dark']) & {
        color: rgba(0, 0, 0, 0.05);
        filter: drop-shadow(0 0 10px rgba(var(--primary-rgb), 0.1));
      }

      :deep(svg) {
        width: 40px;
        height: 40px;
        transition: all 0.4s ease;
      }

      &:nth-child(1) {
        top: 10%;
        left: 8%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 20%;
        right: 10%;
        animation-delay: 1.5s;
      }

      &:nth-child(3) {
        top: 50%;
        left: 15%;
        animation-delay: 3s;
      }

      &:nth-child(4) {
        bottom: 20%;
        right: 12%;
        animation-delay: 4.5s;
      }

      &:nth-child(5) {
        bottom: 10%;
        left: 20%;
        animation-delay: 6s;
      }

      &:nth-child(6) {
        top: 35%;
        right: 20%;
        animation-delay: 7.5s;
      }

      &:nth-child(7) {
        top: 70%;
        right: 8%;
        animation-delay: 9s;
      }

      &:nth-child(8) {
        bottom: 35%;
        left: 5%;
        animation-delay: 10.5s;
      }
    }
  }
}

.login-card {
  width: 480px;
  background: var(--color-bg-2);
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 48px;
  position: relative;
  z-index: 2;
  border: 1px solid var(--color-border-2);
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  body[arco-theme='dark'] & {
    background: rgba(30, 30, 40, 0.85);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  body:not([arco-theme='dark']) & {
    background: rgba(255, 255, 255, 0.95);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  &:hover {
    transform: translateY(-6px);
    
    body[arco-theme='dark'] & {
      box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    
    body:not([arco-theme='dark']) & {
      box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    z-index: -1;
    opacity: 0.5;
    
    body[arco-theme='dark'] & {
      background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.08) 0%,
        transparent 50%,
        rgba(var(--success-rgb), 0.08) 100%);
    }
    
    body:not([arco-theme='dark']) & {
      background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.03) 0%,
        transparent 50%,
        rgba(var(--success-rgb), 0.03) 100%);
    }
  }
}

.login-header {
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
      rgba(255, 107, 107, 0.3) 25%,
      rgba(78, 205, 196, 0.3) 75%,
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
      background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffc371 100%);
      border-radius: 50%;
      box-shadow:
        0 12px 40px rgba(255, 107, 107, 0.4),
        inset 0 2px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow:
          0 16px 50px rgba(255, 107, 107, 0.5),
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
        border: 3px solid rgba(255, 107, 107, 0.4);
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
      rgba(255, 107, 107, 0.15) 0%,
      rgba(78, 205, 196, 0.12) 50%,
      rgba(255, 195, 113, 0.1) 100%);
    border-radius: 25px;
    border: 1px solid rgba(255, 107, 107, 0.25);
    box-shadow:
      0 4px 16px rgba(255, 107, 107, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 24px rgba(255, 107, 107, 0.2),
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
      background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
      z-index: 1;
    }
  }
}

.login-form {
  :deep(.arco-form-item-label) {
    font-weight: 700;
    color: #2c3e50;
    font-size: 16px;
    margin-bottom: 10px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 20px;
      height: 2px;
      background: linear-gradient(90deg, #ff6b6b 0%, #4ecdc4 100%);
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
        rgba(255, 107, 107, 0.1) 50%,
        transparent 100%);
      transition: left 0.6s ease;
    }

    &:hover {
      border-color: #ff6b6b;
      box-shadow:
        0 0 0 4px rgba(255, 107, 107, 0.12),
        0 4px 16px rgba(255, 107, 107, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);

      &::before {
        left: 100%;
      }
    }

    &.arco-input-focus {
      border-color: #ff6b6b;
      box-shadow:
        0 0 0 4px rgba(255, 107, 107, 0.2),
        0 8px 24px rgba(255, 107, 107, 0.15),
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
    background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffc371 100%);
    border: none;
    box-shadow:
      0 6px 20px rgba(255, 107, 107, 0.35),
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
        0 12px 32px rgba(255, 107, 107, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(-1px);
      box-shadow:
        0 4px 16px rgba(255, 107, 107, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    &.arco-btn-loading {
      &::before {
        animation: button-loading 1.5s linear infinite;
      }
    }
  }

  :deep(.arco-input-prefix) {
    color: #ff6b6b;
    font-size: 18px;
    margin-right: 4px;
    transition: all 0.3s ease;

    svg {
      filter: drop-shadow(0 1px 2px rgba(255, 107, 107, 0.3));
    }
  }

  :deep(.arco-input-wrapper:focus-within .arco-input-prefix) {
    color: #4ecdc4;
    transform: scale(1.1);

    svg {
      filter: drop-shadow(0 2px 4px rgba(78, 205, 196, 0.4));
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 36px;
  color: #718096;
  font-size: 16px;
  font-weight: 500;

  :deep(.arco-link) {
    color: #ff6b6b;
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
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%);
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      color: #4ecdc4;
      text-shadow: 0 0 12px rgba(78, 205, 196, 0.4);
      transform: translateY(-1px);

      &::before {
        opacity: 1;
      }
    }
  }
}

// 优化的动画效果系统
@keyframes gradient-shift {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(2%, -2%) rotate(1deg);
  }
  50% {
    transform: translate(-1%, 3%) rotate(-0.5deg);
  }
  75% {
    transform: translate(-2%, -1%) rotate(0.5deg);
  }
}

@keyframes grid-move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes geometric-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes elegant-particle-float {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  5% {
    opacity: 0.6;
    transform: scale(1);
  }
  95% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-120vh) translateX(30px) scale(0);
    opacity: 0;
  }
}

@keyframes texture-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}

@keyframes elegant-icon-float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(-10px) scale(1.05);
  }
  50% {
    transform: translateY(-5px) scale(1);
    opacity: 0.8;
  }
  75% {
    transform: translateY(8px) scale(1.02);
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
  .login-container {
    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 40px 28px;
    border-radius: 24px;
  }

  .login-header {
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
  .login-card {
    padding: 32px 20px;
    margin: 0 16px;
  }

  .login-header .logo {
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
