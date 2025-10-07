<template>
  <router-link :to="to" class="app-card" :class="cardClass">
    <div class="app-card-inner">
      <div class="card-content">
        <h3 class="app-title">{{ title }}</h3>
        <p class="app-desc">{{ description }}</p>
      </div>
      <div class="app-footer">
        <div class="app-icon" :class="iconColor">
          <i :class="icon"></i>
        </div>
        <div class="arrow-icon">
          <i class="icon-right"></i>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'icon-apps'
    },
    to: {
      type: [String, Object],
      required: true
    },
    bgColor: {
      type: String,
      default: '#fff'
    }
  },
  computed: {
    iconColor() {
      const iconMap = {
        'icon-trophy': 'icon-orange',
        'icon-robot': 'icon-blue',
        'icon-book': 'icon-purple',
        'icon-heart': 'icon-green',
        'icon-bar-chart': 'icon-green'
      };
      return iconMap[this.icon] || '';
    },
    cardClass() {
      // 根据图标类型返回对应的卡片样式类
      const classMap = {
        'icon-trophy': 'card-theme-orange',
        'icon-robot': 'card-theme-blue',
        'icon-bar-chart': 'card-theme-green',
        'icon-book': 'card-theme-purple'
      };
      return classMap[this.icon] || 'card-theme-default';
    }
  }
}
</script>

<style lang="scss" scoped>
.app-card {
  display: block;
  width: 100%;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  color: var(--text-primary);
  overflow: hidden;
  height: 100%;
  position: relative;
  border: 2px solid var(--border-color);
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--card-bg-gradient);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-hover);
    
    &::before {
      opacity: 1;
    }
    
    .arrow-icon {
      transform: translateX(6px) rotate(-45deg);
      opacity: 1;
      background-color: var(--primary-light);
    }
    
    .app-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .app-card-inner {
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    min-height: 220px;
    position: relative;
    z-index: 1;
  }
  
  .card-content {
    flex-grow: 1;
    margin-bottom: 20px;
  }

  .app-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 14px;
    color: var(--text-heading);
    letter-spacing: -0.3px;
    line-height: 1.3;
  }

  .app-desc {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    font-size: 15px;
    font-weight: 500;
  }
  
  .app-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &.icon-orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    &.icon-blue {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    &.icon-purple {
      background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
    }
    
    &.icon-green {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    }
    
    i {
      font-size: 26px;
    }
  }
  
  .arrow-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(102, 126, 234, 0.1);
    opacity: 0.7;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &::before {
      content: '→';
      font-size: 16px;
      color: #667eea;
      font-weight: 600;
    }
  }
}

// 不同主题的卡片样式（白色模式）
.app-card.card-theme-orange {
  &::before {
    background: linear-gradient(135deg, rgba(255, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.1) 100%);
  }
}

.app-card.card-theme-blue {
  &::before {
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.1) 100%);
  }
}

.app-card.card-theme-green {
  &::before {
    background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(56, 249, 215, 0.1) 100%);
  }
}

.app-card.card-theme-purple {
  &::before {
    background: linear-gradient(135deg, rgba(161, 140, 209, 0.15) 0%, rgba(251, 194, 235, 0.1) 100%);
  }
}

// 暗黑模式样式
:global(.dark-theme) {
  .app-card {
    // 使用更具层次感的背景渐变
    background: linear-gradient(135deg, rgba(40, 42, 54, 0.95) 0%, rgba(32, 34, 45, 0.95) 100%) !important;
    border: 2px solid rgba(141, 154, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(141, 154, 255, 0.15) inset,
                0 2px 16px rgba(141, 154, 255, 0.2);
    backdrop-filter: blur(12px);
    
    &:hover {
      border-color: rgba(141, 154, 255, 0.6);
      box-shadow: 0 16px 48px rgba(141, 154, 255, 0.35),
                  0 0 60px rgba(141, 154, 255, 0.25),
                  0 0 0 2px rgba(141, 154, 255, 0.3) inset;
      background: linear-gradient(135deg, rgba(45, 47, 60, 0.98) 0%, rgba(37, 39, 51, 0.98) 100%) !important;
    }
    
    .app-title {
      // 纯白色标题，增强发光效果
      color: #ffffff !important;
      text-shadow: 0 2px 12px rgba(141, 154, 255, 0.6),
                   0 0 30px rgba(141, 154, 255, 0.4);
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    
    .app-desc {
      // 亮灰色描述，增强可读性
      color: #d8d8d8 !important;
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .arrow-icon {
      background: linear-gradient(135deg, rgba(141, 154, 255, 0.25) 0%, rgba(157, 125, 197, 0.2) 100%);
      box-shadow: 0 2px 8px rgba(141, 154, 255, 0.2);
      
      &::before {
        color: #a5b4ff;
        text-shadow: 0 0 8px rgba(141, 154, 255, 0.5);
      }
    }
    
    // 增强图标的发光效果
    .app-icon {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4),
                  0 0 30px rgba(141, 154, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    
    // 不同主题卡片的背景微调 - 增强一些
    &.card-theme-orange {
      &::before {
        background: linear-gradient(135deg, rgba(255, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.1) 100%);
      }
      
      &:hover::before {
        opacity: 1.5;
      }
    }
    
    &.card-theme-blue {
      &::before {
        background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.1) 100%);
      }
      
      &:hover::before {
        opacity: 1.5;
      }
    }
    
    &.card-theme-green {
      &::before {
        background: linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(56, 249, 215, 0.1) 100%);
      }
      
      &:hover::before {
        opacity: 1.5;
      }
    }
    
    &.card-theme-purple {
      &::before {
        background: linear-gradient(135deg, rgba(161, 140, 209, 0.15) 0%, rgba(251, 194, 235, 0.1) 100%);
      }
      
      &:hover::before {
        opacity: 1.5;
      }
    }
  }
}
</style>
