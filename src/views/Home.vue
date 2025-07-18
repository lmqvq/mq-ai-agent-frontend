<template>
  <div class="home-container">
    <div class="home-header">
      <h1>AI健身大师平台</h1>
      <p>智能助手，让健身更轻松</p>
    </div>
    
    <div class="apps-grid">
      <div class="app-item" v-for="app in apps" :key="app.id">
        <app-card
          :title="app.title"
          :description="app.description"
          :icon="app.icon"
          :to="app.route"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AppCard from '@/components/AppCard.vue';

export default {
  name: 'HomePage',
  components: {
    AppCard
  },
  data() {
    return {
      apps: [
        {
          id: 'fitness',
          title: 'AI健身大师',
          description: '专业的健身教练，为您提供个性化的健身建议和计划',
          icon: 'icon-trophy',
          route: '/fitness'
        },
        {
          id: 'agent',
          title: 'AI超级智能体',
          description: '解答各种问题的智能助手，知识丰富，回答准确',
          icon: 'icon-robot',
          route: '/agent'
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.home-header {
  text-align: center;
  margin-bottom: 60px;
  
  h1 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #333;
  }
  
  p {
    font-size: 18px;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  
  .app-item {
    height: 100%;
    transition: all 0.3s ease;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .home-header {
    margin-bottom: 40px;
    
    h1 {
      font-size: 28px;
    }
    
    p {
      font-size: 16px;
    }
  }
  
  .apps-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style> 