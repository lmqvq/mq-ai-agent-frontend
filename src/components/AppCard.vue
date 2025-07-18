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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  height: 100%;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    
    .arrow-icon {
      transform: translateX(4px);
      opacity: 1;
    }
  }

  .app-card-inner {
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    min-height: 180px;
  }
  
  .card-content {
    flex-grow: 1;
    margin-bottom: 20px;
  }

  .app-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }

  .app-desc {
    color: #666;
    margin: 0;
    line-height: 1.5;
    font-size: 14px;
  }
  
  .app-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    
    &.icon-orange {
      background: linear-gradient(135deg, #ff9a9e, #fad0c4);
    }
    
    &.icon-blue {
      background: linear-gradient(135deg, #84fab0, #8fd3f4);
    }
    
    &.icon-purple {
      background: linear-gradient(135deg, #a18cd1, #fbc2eb);
    }
    
    &.icon-green {
      background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
    }
    
    i {
      font-size: 20px;
    }
  }
  
  .arrow-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.06);
    opacity: 0.6;
    transition: all 0.3s ease;
    
    &::before {
      content: '→';
      font-size: 14px;
      color: #555;
    }
  }
}
</style> 