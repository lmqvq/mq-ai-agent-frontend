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
    // 使用更亮的背景渐变，提升对比度
    background: linear-gradient(135deg, rgba(48, 52, 68, 0.98) 0%, rgba(40, 44, 58, 0.98) 100%) !important;
    border: 3px solid rgba(141, 154, 255, 0.5);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7),
                0 0 0 1px rgba(141, 154, 255, 0.25) inset,
                0 4px 24px rgba(141, 154, 255, 0.3),
                0 0 80px rgba(141, 154, 255, 0.15);
    backdrop-filter: blur(16px);
    position: relative;
    
    // 添加顶部光晕效果
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(141, 154, 255, 0.6) 20%, 
        rgba(141, 154, 255, 0.8) 50%, 
        rgba(141, 154, 255, 0.6) 80%, 
        transparent
      );
      opacity: 0.8;
    }
    
    &:hover {
      border-color: rgba(141, 154, 255, 0.7);
      box-shadow: 0 20px 60px rgba(141, 154, 255, 0.45),
                  0 0 100px rgba(141, 154, 255, 0.35),
                  0 0 150px rgba(141, 154, 255, 0.2),
                  0 0 0 3px rgba(141, 154, 255, 0.5) inset;
      background: linear-gradient(135deg, rgba(55, 60, 78, 1) 0%, rgba(47, 51, 67, 1) 100%) !important;
      
      &::after {
        opacity: 1;
        box-shadow: 0 0 20px rgba(141, 154, 255, 0.6);
      }
    }
    
    .app-title {
      // 超亮白色标题，增强发光效果
      color: #ffffff !important;
      text-shadow: 0 3px 16px rgba(141, 154, 255, 0.8),
                   0 0 40px rgba(141, 154, 255, 0.5),
                   0 0 60px rgba(141, 154, 255, 0.3);
      font-weight: 900;
      letter-spacing: -0.5px;
      filter: brightness(1.15);
      font-size: 24px;
    }
    
    .app-desc {
      // 超亮灰色描述，显著增强可读性
      color: #e8e8e8 !important;
      font-weight: 600;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4),
                   0 0 20px rgba(141, 154, 255, 0.15);
      font-size: 16px;
      line-height: 1.7;
    }
    
    .arrow-icon {
      background: linear-gradient(135deg, rgba(141, 154, 255, 0.35) 0%, rgba(157, 125, 197, 0.3) 100%);
      box-shadow: 0 3px 12px rgba(141, 154, 255, 0.3),
                  0 0 20px rgba(141, 154, 255, 0.2);
      
      &::before {
        color: #b4c0ff;
        font-weight: 700;
        text-shadow: 0 0 12px rgba(141, 154, 255, 0.7),
                     0 0 24px rgba(141, 154, 255, 0.4);
      }
    }
    
    // 显著增强图标的发光效果和立体感
    .app-icon {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                  0 0 40px rgba(141, 154, 255, 0.4),
                  0 0 60px rgba(141, 154, 255, 0.3),
                  inset 0 2px 4px rgba(255, 255, 255, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.25);
      transform: scale(1.02);
      
      i {
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
      }
    }
    
    // 不同主题卡片的背景微调 - 显著增强
    &.card-theme-orange {
      border-color: rgba(255, 147, 251, 0.4);
      
      &::before {
        background: linear-gradient(135deg, rgba(255, 147, 251, 0.18) 0%, rgba(245, 87, 108, 0.12) 100%);
      }
      
      &::after {
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 147, 251, 0.5) 20%, 
          rgba(245, 87, 108, 0.6) 50%, 
          rgba(255, 147, 251, 0.5) 80%, 
          transparent
        );
      }
      
      &:hover {
        border-color: rgba(255, 147, 251, 0.6);
        
        &::before {
          opacity: 1.5;
        }
      }
    }
    
    &.card-theme-blue {
      border-color: rgba(79, 172, 254, 0.4);
      
      &::before {
        background: linear-gradient(135deg, rgba(79, 172, 254, 0.18) 0%, rgba(0, 242, 254, 0.12) 100%);
      }
      
      &::after {
        background: linear-gradient(90deg, 
          transparent, 
          rgba(79, 172, 254, 0.5) 20%, 
          rgba(0, 242, 254, 0.6) 50%, 
          rgba(79, 172, 254, 0.5) 80%, 
          transparent
        );
      }
      
      &:hover {
        border-color: rgba(79, 172, 254, 0.6);
        
        &::before {
          opacity: 1.5;
        }
      }
    }
    
    &.card-theme-green {
      border-color: rgba(67, 233, 123, 0.4);
      
      &::before {
        background: linear-gradient(135deg, rgba(67, 233, 123, 0.18) 0%, rgba(56, 249, 215, 0.12) 100%);
      }
      
      &::after {
        background: linear-gradient(90deg, 
          transparent, 
          rgba(67, 233, 123, 0.5) 20%, 
          rgba(56, 249, 215, 0.6) 50%, 
          rgba(67, 233, 123, 0.5) 80%, 
          transparent
        );
      }
      
      &:hover {
        border-color: rgba(67, 233, 123, 0.6);
        
        &::before {
          opacity: 1.5;
        }
      }
    }
    
    &.card-theme-purple {
      border-color: rgba(161, 140, 209, 0.4);
      
      &::before {
        background: linear-gradient(135deg, rgba(161, 140, 209, 0.18) 0%, rgba(251, 194, 235, 0.12) 100%);
      }
      
      &::after {
        background: linear-gradient(90deg, 
          transparent, 
          rgba(161, 140, 209, 0.5) 20%, 
          rgba(251, 194, 235, 0.6) 50%, 
          rgba(161, 140, 209, 0.5) 80%, 
          transparent
        );
      }
      
      &:hover {
        border-color: rgba(161, 140, 209, 0.6);
        
        &::before {
          opacity: 1.5;
        }
      }
    }
  }
}
</style>
