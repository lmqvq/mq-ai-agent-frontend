<template>
  <div class="home-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="sidebar-logo">
        <icon-robot class="logo-icon" />
        <span class="logo-text">LMQ</span>
      </div>
      <div class="sidebar-menu">
        <router-link to="/" class="menu-item" active-class="active" exact>
          <icon-home />
          <span>主页</span>
        </router-link>
        <router-link to="/fitness" class="menu-item" active-class="active">
          <icon-trophy />
          <span>AI健身教练</span>
        </router-link>
        <router-link to="/agent" class="menu-item" active-class="active">
          <icon-robot />
          <span>AI超级智能体</span>
        </router-link>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="welcome-section">
        <div class="welcome-icon">
          <icon-robot />
        </div>
        <h1>欢迎使用Lmq-AI聊天应用</h1>
        <p>智能助手，让健身更轻松</p>
      </div>

      <div class="apps-grid">
        <div v-for="app in apps" :key="app.id" class="app-item">
          <app-card
            :title="app.title"
            :description="app.description"
            :icon="app.icon"
            :to="app.route"
            :bg-color="app.bgColor"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppCard from '@/components/AppCard.vue';
import { IconHome } from '@arco-design/web-vue/es/icon';

export default {
  name: 'HomePage',
  components: {
    AppCard,
    IconHome
  },
  data() {
    return {
      apps: [
        {
          id: 'fitness',
          title: 'AI健身教练',
          description: '专业的健身教练，为您提供个性化的健身建议和计划',
          icon: 'icon-trophy',
          route: '/fitness',
          bgColor: 'rgba(255, 235, 218, 0.5)'
        },
        {
          id: 'agent',
          title: 'AI超级智能体',
          description: '强大的智能助手，可以回答问题、提供建议、协助创作和分析信息。',
          icon: 'icon-robot',
          route: '/agent',
          bgColor: 'rgba(218, 243, 243, 0.5)'
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f9fafc;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #eaedf1;
  height: 100%;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);

  .sidebar-logo {
    display: flex;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 30px;
    
    .logo-icon {
      font-size: 24px;
      color: #4080ff;
    }
    
    .logo-text {
      margin-left: 10px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .sidebar-menu {
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #5c6572;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      text-decoration: none;
      
      &:hover, &.active {
        background-color: #f2f5fa;
        color: #4080ff;
      }
      
      :deep(i) {
        font-size: 16px;
        margin-right: 8px;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeIn 0.8s ease-in;
  
  .welcome-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #4080ff;
    color: white;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(64, 128, 255, 0.2);
    
    :deep(svg) {
      width: 40px;
      height: 40px;
    }
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #333;
    text-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  p {
    font-size: 16px;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  animation: slideUp 0.6s ease-out;
  animation-fill-mode: both;
  
  .app-item {
    animation: fadeIn 0.4s ease-in;
    animation-fill-mode: both;
    
    &:nth-child(1) {
      animation-delay: 0.1s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
    
    &:nth-child(4) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .apps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #eaedf1;
    padding: 15px 0;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-section {
    margin-bottom: 30px;
    
    h1 {
      font-size: 24px;
    }
  }
}
</style> 