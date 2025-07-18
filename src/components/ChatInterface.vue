<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>{{ title }}</h1>
      <p class="description">{{ description }}</p>
    </div>
    
    <div ref="chatMessages" class="chat-messages">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.isUser ? 'user-message' : 'ai-message']">
        <div class="message-content">
          <span v-if="message.isUser">{{ message.content }}</span>
          <span v-else v-html="processMessageContent(message.content)"></span>
        </div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
      <div v-if="isTyping" class="message ai-message typing">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <a-input
        v-model="userInput"
        placeholder="输入您的问题..."
        :disabled="isLoading"
        @keyup.enter="sendMessage"
      >
        <template #suffix>
          <a-button 
            type="primary" 
            shape="circle"
            :loading="isLoading"
            :disabled="!userInput.trim() || isLoading"
            @click="sendMessage"
          >
            <icon-send />
          </a-button>
        </template>
      </a-input>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { IconSend } from '@arco-design/web-vue/es/icon';
import ApiService from '../services/api';

export default {
  name: 'ChatInterface',
  components: {
    IconSend
  },
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    chatType: {
      type: String,
      required: true,
      validator: (value) => ['fitness', 'agent'].includes(value)
    }
  },
  setup(props) {
    const messages = ref([]);
    const userInput = ref('');
    const isLoading = ref(false);
    const isTyping = ref(false);
    const chatMessages = ref(null);
    const chatId = ref('');
    let eventSource = null;
    
    // 初始化聊天
    onMounted(() => {
      chatId.value = ApiService.generateChatId();
      // 添加欢迎消息
      const welcomeMessage = props.chatType === 'fitness' 
        ? "欢迎使用AI健身教练！您可以向我咨询任何健身相关的问题。"
        : "欢迎使用AI超级智能体！我可以帮助您解决各种问题。";
      
      messages.value.push({
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      });
    });
    
    // 监听消息变化，自动滚动到底部
    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    }, { deep: true });
    
    // 滚动到底部
    const scrollToBottom = () => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
      }
    };
    
    // 发送消息
    const sendMessage = async () => {
      const message = userInput.value.trim();
      if (!message || isLoading.value) return;
      
      // 添加用户消息
      messages.value.push({
        content: message,
        isUser: true,
        timestamp: new Date()
      });
      
      userInput.value = '';
      isLoading.value = true;
      isTyping.value = true;
      
      let currentResponse = '';
      
      try {
        // 根据聊天类型选择不同的API
        if (props.chatType === 'fitness') {
          eventSource = ApiService.createKeepAppSSEConnection(message, chatId.value);
        } else {
          eventSource = ApiService.createManusSSEConnection(message);
        }
        
        // 添加AI消息占位
        const aiMessageIndex = messages.value.length;
        messages.value.push({
          content: '',
          isUser: false,
          timestamp: new Date()
        });
        
        eventSource.onmessage = (event) => {
          if (event.data) {
            currentResponse += event.data;
            // 更新消息内容
            messages.value[aiMessageIndex].content = currentResponse;
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          eventSource.close();
          isLoading.value = false;
          isTyping.value = false;
          
          // 如果没有收到任何响应，添加错误消息
          if (!currentResponse) {
            messages.value[aiMessageIndex].content = "抱歉，服务器连接出现问题，请稍后再试。";
          }
        };
        
        // SSE完成时的处理
        eventSource.addEventListener('complete', () => {
          eventSource.close();
          isLoading.value = false;
          isTyping.value = false;
        });
      } catch (error) {
        console.error('Error sending message:', error);
        isLoading.value = false;
        isTyping.value = false;
        messages.value.push({
          content: "抱歉，发送消息时出现错误，请稍后再试。",
          isUser: false,
          timestamp: new Date()
        });
      }
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    // 处理消息内容，支持简单的markdown格式
    const processMessageContent = (content) => {
      // 替换换行符为<br>
      let processed = content.replace(/\n/g, '<br>');
      // 处理加粗 **text**
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // 处理斜体 *text*
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return processed;
    };
    
    return {
      messages,
      userInput,
      isLoading,
      isTyping,
      chatMessages,
      sendMessage,
      formatTime,
      processMessageContent
    };
  }
};
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  text-align: center;
  
  h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
  
  .description {
    margin: 8px 0 0;
    color: #666;
    font-size: 14px;
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
  
  .message {
    margin-bottom: 16px;
    max-width: 80%;
    
    .message-content {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 16px;
      line-height: 1.5;
      word-break: break-word;
    }
    
    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
    
    &.user-message {
      margin-left: auto;
      text-align: right;
      
      .message-content {
        background-color: #4080ff;
        color: #fff;
        border-top-right-radius: 2px;
        box-shadow: 0 2px 6px rgba(64, 128, 255, 0.3);
      }
      
      .message-time {
        text-align: right;
      }
    }
    
    &.ai-message {
      margin-right: auto;
      
      .message-content {
        background-color: #fff;
        color: #333;
        border-top-left-radius: 2px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
    }
    
    &.typing {
      .typing-indicator {
        display: inline-flex;
        align-items: center;
        padding: 12px 16px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        
        span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          border-radius: 50%;
          background-color: #999;
          animation: typing 1.5s infinite ease-in-out;
          
          &:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }
}

.chat-input {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  
  :deep(.arco-input) {
    border-radius: 24px;
    padding-right: 12px;
  }
  
  :deep(.arco-input-suffix) {
    cursor: pointer;
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  
  30% {
    transform: translateY(-6px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-messages .message {
    max-width: 90%;
  }
  
  .chat-header h1 {
    font-size: 20px;
  }
  
  .chat-input {
    padding: 12px;
  }
}
</style> 