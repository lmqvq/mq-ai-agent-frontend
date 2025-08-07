<template>
  <div class="fitness-master">
    <chat-manager
      title="AI健身教练"
      description="您的专业健身教练，为您提供个性化的健身建议和计划"
      chat-type="fitness"
    />
  </div>
</template>

<script>
import ChatManager from '@/components/ChatManager.vue';

export default {
  name: 'FitnessMaster',
  components: {
    ChatManager
  }
};
</script>

<style lang="scss" scoped>
.fitness-master {
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .fitness-master {
    height: 100vh;
    overflow: hidden;
  }
}
</style>