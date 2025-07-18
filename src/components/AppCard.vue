<template>
  <router-link :to="to" class="app-card">
    <div class="app-card-inner">
      <div class="app-icon">
        <i :class="icon"></i>
      </div>
      <h3 class="app-title">{{ title }}</h3>
      <p class="app-desc">{{ description }}</p>
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
    }
  }
}
</script>

<style lang="scss" scoped>
.app-card {
  display: block;
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  .app-card-inner {
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .app-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .app-desc {
    color: #666;
    flex-grow: 1;
    margin: 0;
    line-height: 1.5;
  }
}
</style> 