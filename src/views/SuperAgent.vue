<template>
  <div class="super-agent">
    <chat-manager
      title="AI超级智能体"
      description="解答各种问题的智能助手，知识丰富，回答准确"
      chat-type="agent"
    />
  </div>
</template>

<script>
import ChatManager from '@/components/ChatManager.vue';

export default {
  name: 'SuperAgent',
  components: {
    ChatManager
  }
};
</script>

<style lang="scss" scoped>
.super-agent {
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  .super-agent {
    height: 100vh;
    overflow: hidden;
  }
}
</style>