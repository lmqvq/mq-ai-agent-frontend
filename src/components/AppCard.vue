<template>
  <router-link :to="to" class="app-card" :style="{'background-color': bgColor}">
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
        'icon-heart': 'icon-green'
      };
      return iconMap[this.icon] || '';
    }
  }
}
</script>

<style lang="scss" scoped>
.app-card {
  display: block;
  width: 100%;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  height: 100%;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
    
    .arrow-icon {
      transform: translateX(6px) rotate(-45deg);
      opacity: 1;
      background-color: rgba(102, 126, 234, 0.2);
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
    color: #1a202c;
    letter-spacing: -0.3px;
    line-height: 1.3;
  }

  .app-desc {
    color: #5a6c7d;
    margin: 0;
    line-height: 1.6;
    font-size: 15px;
    font-weight: 400;
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
</style> 