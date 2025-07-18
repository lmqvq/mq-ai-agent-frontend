<template>
  <div class="fitness-master">
    <chat-interface
      title="AI健身大师"
      description="您的专业健身教练，为您提供个性化的健身建议和计划"
      chat-type="fitness"
    />
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';

export default {
  name: 'FitnessMaster',
  components: {
    ChatInterface
  }
};
</script>

<style lang="scss" scoped>
.fitness-master {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f0f2f5;
}

@media (max-width: 768px) {
  .fitness-master {
    padding: 10px;
  }
}
</style> 