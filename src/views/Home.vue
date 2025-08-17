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
        <router-link to="/profile" class="menu-item" active-class="active" v-if="isLoggedIn">
          <icon-user />
          <span>个人中心</span>
        </router-link>
        <router-link to="/management" class="menu-item" active-class="active" v-if="isLoggedIn">
          <icon-dashboard />
          <span>健身管理</span>
        </router-link>
        <router-link to="/data" class="menu-item" active-class="active" v-if="isLoggedIn">
          <icon-bar-chart />
          <span>健身数据</span>
        </router-link>
        <router-link to="/plans" class="menu-item" active-class="active" v-if="isLoggedIn">
          <icon-calendar />
          <span>健身计划</span>
        </router-link>
        <router-link to="/knowledge" class="menu-item" active-class="active">
          <icon-book />
          <span>健身知识</span>
        </router-link>
      </div>

      <!-- 用户区域 -->
      <div class="user-area">
        <!-- 未登录状态 -->
        <div v-if="!isLoggedIn" class="login-button" @click="goToLogin">
          <icon-user />
          <span>登录</span>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-info" @click="toggleUserMenu" ref="userInfoRef">
          <div class="user-avatar">
            <img v-if="userInfo.userAvatar" :src="userInfo.userAvatar" :alt="userInfo.userName" />
            <icon-user v-else />
          </div>
          <div class="user-details">
            <div class="user-name">{{ userInfo.userName || '用户' }}</div>
            <div class="user-role">{{ getRoleText(userInfo.userRole) }}</div>
          </div>

          <!-- 用户菜单 -->
          <div v-show="showUserMenu" class="user-menu">
            <div class="menu-header">
              <div class="menu-avatar">
                <img v-if="userInfo.userAvatar" :src="userInfo.userAvatar" :alt="userInfo.userName" />
                <icon-user v-else />
              </div>
              <div class="menu-user-info">
                <div class="menu-user-name">{{ userInfo.userName || '用户' }}</div>
                <div class="menu-user-role">{{ getRoleText(userInfo.userRole) }}</div>
              </div>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-items">
              <div class="menu-item" @click="goToProfile">
                <icon-edit />
                <span>修改信息</span>
              </div>
              <div class="menu-item logout" @click="handleLogout">
                <icon-poweroff />
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="welcome-section">
        <div class="welcome-icon">
          <icon-robot />
        </div>
        <h1>欢迎使用LMQ-AI健身教练</h1>
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

      <!-- 健身数据概览 -->
      <div class="fitness-overview">
        <h2>您的健身数据</h2>
        <div class="overview-cards">
          <div class="overview-card">
            <div class="card-icon">
              <icon-trophy />
            </div>
            <div class="card-content">
              <h3>本周训练</h3>
              <div class="value">5 <span>次</span></div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-icon">
              <icon-fire />
            </div>
            <div class="card-content">
              <h3>消耗卡路里</h3>
              <div class="value">1,250 <span>kcal</span></div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-icon">
              <icon-clock-circle />
            </div>
            <div class="card-content">
              <h3>训练时长</h3>
              <div class="value">3.5 <span>小时</span></div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-icon">
              <icon-heart />
            </div>
            <div class="card-content">
              <h3>连续天数</h3>
              <div class="value">7 <span>天</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AppCard from '@/components/AppCard.vue';
import {
  IconHome, IconUser, IconBarChart, IconCalendar, IconTrophy, IconDashboard,
  IconFire, IconClockCircle, IconHeart, IconBook, IconEdit, IconPoweroff, IconRobot
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/stores/user';

export default {
  name: 'HomePage',
  components: {
    AppCard,
    IconHome,
    IconUser,
    IconBarChart,
    IconCalendar,
    IconTrophy,
    IconDashboard,
    IconFire,
    IconClockCircle,
    IconHeart,
    IconBook,
    IconEdit,
    IconPoweroff,
    IconRobot
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const showUserMenu = ref(false);
    const userInfoRef = ref(null);

    // 应用列表
    const apps = [
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
        description: '强大的智能助手，可以回答问题、提供建议、协助创作和分析信息',
        icon: 'icon-robot',
        route: '/agent',
        bgColor: 'rgba(218, 243, 243, 0.5)'
      },
      {
        id: 'plans',
        title: '个性化健身计划',
        description: 'AI为您量身定制专业健身计划，科学训练，高效达成目标',
        icon: 'icon-calendar',
        route: '/plans',
        bgColor: 'rgba(230, 247, 255, 0.5)'
      },
      {
        id: 'data',
        title: '健身数据中心',
        description: '记录和追踪您的健身进展，让数据指导您的健身之路',
        icon: 'icon-bar-chart',
        route: '/data',
        bgColor: 'rgba(246, 255, 237, 0.5)'
      },
      {
        id: 'knowledge',
        title: '健身知识库',
        description: '专业的健身知识，科学的训练方法，助您成为健身达人',
        icon: 'icon-book',
        route: '/knowledge',
        bgColor: 'rgba(255, 247, 230, 0.5)'
      }
    ];

    // 跳转到登录页面
    const goToLogin = () => {
      router.push('/login');
    };

    // 切换用户菜单显示状态
    const toggleUserMenu = (event) => {
      event.stopPropagation();
      showUserMenu.value = !showUserMenu.value;
    };

    // 点击外部区域关闭菜单
    const handleClickOutside = (event) => {
      if (userInfoRef.value && !userInfoRef.value.contains(event.target)) {
        showUserMenu.value = false;
      }
    };

    // 跳转到个人中心
    const goToProfile = () => {
      router.push('/profile');
      showUserMenu.value = false;
    };

    // 处理登出
    const handleLogout = async () => {
      try {
        await userStore.logout();
        Message.success('已退出登录');
        showUserMenu.value = false;
      } catch (error) {
        console.error('登出失败:', error);
        Message.error('登出失败');
      }
    };

    // 获取角色文本
    const getRoleText = (role) => {
      return userStore.getRoleText(role);
    };

    // 组件挂载时检查登录状态
    onMounted(async () => {
      await userStore.checkLoginStatus();
      // 添加全局点击事件监听
      document.addEventListener('click', handleClickOutside);
    });

    // 组件卸载时移除事件监听
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      apps,
      showUserMenu,
      userInfoRef,
      isLoggedIn: userStore.isLoggedIn,
      userInfo: userStore.userInfo,
      goToLogin,
      toggleUserMenu,
      goToProfile,
      handleLogout,
      getRoleText
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
  position: relative;

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
    flex: 1;

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

  .user-area {
    padding: 16px 20px;
    border-top: 1px solid #eaedf1;

    .login-button {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #4080ff;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;

      :deep(svg) {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }

      &:hover {
        background: #3070ef;
        transform: translateY(-1px);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background-color: #f2f5fa;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(45deg, #4080ff, #40a9ff);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        :deep(svg) {
          width: 16px;
          height: 16px;
          color: white;
        }
      }

      .user-details {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }
      }

      .user-menu {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        border: 1px solid #eaedf1;
        z-index: 1000;
        margin-bottom: 8px;

        .menu-header {
          display: flex;
          align-items: center;
          padding: 16px;

          .menu-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(45deg, #4080ff, #40a9ff);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            :deep(svg) {
              width: 20px;
              height: 20px;
              color: white;
            }
          }

          .menu-user-info {
            flex: 1;

            .menu-user-name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }

            .menu-user-role {
              font-size: 12px;
              color: #666;
            }
          }
        }

        .menu-divider {
          height: 1px;
          background: #eaedf1;
          margin: 0 16px;
        }

        .menu-items {
          padding: 8px 0;

          .menu-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            color: #333;

            :deep(svg) {
              width: 16px;
              height: 16px;
              margin-right: 12px;
              color: #666;
            }

            &:hover {
              background-color: #f2f5fa;
              color: #4080ff;

              :deep(svg) {
                color: #4080ff;
              }
            }

            &.logout {
              color: #f53f3f;

              :deep(svg) {
                color: #f53f3f;
              }

              &:hover {
                background-color: #fff2f0;
                color: #f53f3f;

                :deep(svg) {
                  color: #f53f3f;
                }
              }
            }
          }
        }
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 40px;
  padding-bottom: 60px; /* 为页脚留出空间 */
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
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  animation: slideUp 0.6s ease-out;
  animation-fill-mode: both;
  margin-bottom: 48px;
  
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

    &:nth-child(5) {
      animation-delay: 0.5s;
    }
  }
}

.fitness-overview {
  margin-bottom: 48px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;
    text-align: center;
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-4px);
      }

      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(45deg, #4080ff, #40a9ff);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        :deep(svg) {
          width: 20px;
          height: 20px;
          color: white;
        }
      }

      .card-content {
        h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .value {
          font-size: 24px;
          font-weight: 700;
          color: #333;

          span {
            font-size: 14px;
            color: #666;
            font-weight: 400;
          }
        }
      }
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

  .fitness-overview .overview-cards {
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

  .fitness-overview .overview-cards {
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