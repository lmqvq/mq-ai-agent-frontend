<template>
  <div class="super-agent">
    <chat-interface
      title="AI超级智能体"
      description="解答各种问题的智能助手，知识丰富，回答准确"
      chat-type="agent"
    />
  </div>
</template>

<script>
import ChatInterface from '@/components/ChatInterface.vue';

export default {
  name: 'SuperAgent',
  components: {
    ChatInterface
  }
};
</script>

<style lang="scss" scoped>
.super-agent {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f0f2f5;
}

@media (max-width: 768px) {
  .super-agent {
    padding: 10px;
  }
}
</style> 