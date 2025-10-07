<template>
  <div class="chat-manager">
    <!-- 左侧对话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="app-info">
          <div class="app-icon">
            <icon-robot v-if="chatType === 'fitness'" />
            <icon-bulb v-else />
          </div>
          <span class="app-name">{{ title }}</span>
        </div>
      </div>

      <div class="new-chat-section">
        <a-button
          type="primary"
          size="medium"
          @click="createNewDialogue"
          :loading="isCreatingDialogue"
          class="new-chat-btn"
        >
          <template #icon>
            <icon-plus />
          </template>
          新对话
        </a-button>
      </div>
      
      <div class="dialogue-list">
        <div class="list-header">历史对话</div>
        <div 
          v-for="dialogue in dialogueList" 
          :key="dialogue.id"
          :class="['dialogue-item', { active: currentDialogueId === dialogue.id }]"
          @click="switchDialogue(dialogue.id)"
        >
          <div class="dialogue-title">{{ dialogue.title || '新对话' }}</div>
          <div class="dialogue-time">{{ formatDialogueTime(dialogue.updateTime) }}</div>
          <div class="dialogue-actions">
            <a-button
              type="text"
              size="mini"
              @click.stop="showDeleteConfirm(dialogue)"
              :loading="isDeletingDialogue === dialogue.id"
              aria-label="删除对话"
            >
              <icon-delete />
            </a-button>
          </div>
        </div>
        
        <div v-if="dialogueList.length === 0" class="empty-state">
          <icon-message />
          <span>暂无对话历史</span>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天界面 -->
    <div class="chat-area">
      <div class="chat-header">
        <div class="header-content">
          <h2>{{ title }}</h2>
          <p class="description">{{ description }}</p>
        </div>
        <div class="header-actions">
          <a-button
            type="text"
            size="small"
            @click="goToHome"
            class="home-button"
          >
            <template #icon>
              <icon-left />
            </template>
            返回主页
          </a-button>
        </div>
      </div>
      
      <div ref="chatMessages" class="chat-messages">

        
        <div v-for="(message, index) in messages" :key="message.id || index" 
             :class="['message', message.messageType === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-content">
            <span v-if="message.messageType === 'user'">{{ message.message }}</span>
            <span v-else v-html="processMessageContent(message.message)"></span>
          </div>
          <div class="message-time">{{ formatTime(message.createTime) }}</div>
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
          :placeholder="currentDialogueId ? '输入您的问题...' : '输入消息开始新对话...'"
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
              aria-label="发送消息"
            >
              <icon-send />
            </a-button>
          </template>
        </a-input>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <a-modal
      v-model:visible="deleteConfirmVisible"
      :footer="false"
      :closable="false"
      width="400px"
      class="delete-confirm-modal"
    >
      <div class="delete-confirm-content">
        <div class="delete-confirm-header">
          <div class="warning-icon">
            <icon-exclamation-circle-fill />
          </div>
          <h3>确定删除对话？</h3>
          <a-button
            type="text"
            size="small"
            @click="deleteConfirmVisible = false"
            class="close-btn"
          >
            <icon-close />
          </a-button>
        </div>
        <div class="delete-confirm-body">
          <p>删除后，聊天记录将不可恢复。</p>
        </div>
        <div class="delete-confirm-footer">
          <a-button
            size="large"
            @click="deleteConfirmVisible = false"
            class="cancel-btn"
          >
            取消
          </a-button>
          <a-button
            type="primary"
            size="large"
            status="danger"
            :loading="isDeletingDialogue === dialogueToDelete?.id"
            @click="confirmDeleteDialogue"
            class="delete-btn"
          >
            删除
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconRobot,
  IconBulb,
  IconPlus,
  IconDelete,
  IconMessage,
  IconSend,
  IconLeft
} from '@arco-design/web-vue/es/icon';
import ApiService from '../services/api';
import LocalStorageService from '../services/localStorage';

export default {
  name: 'ChatManager',
  components: {
    IconRobot,
    IconBulb,
    IconPlus,
    IconDelete,
    IconMessage,
    IconSend,
    IconLeft
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
    const router = useRouter();
    const messages = ref([]);
    const userInput = ref('');
    const isLoading = ref(false);
    const isTyping = ref(false);
    const chatMessages = ref(null);
    const currentDialogueId = ref(null);
    const dialogueList = ref([]);
    const isCreatingDialogue = ref(false);
    const isDeletingDialogue = ref(null);
    const deleteConfirmVisible = ref(false);
    const dialogueToDelete = ref(null);

    let eventSource = null;
    
    // 初始化
    onMounted(async () => {
      try {
        console.log('=== ChatManager 初始化开始 ===');

        // 清理过期缓存
        LocalStorageService.cleanExpiredCache();

        // 加载对话列表
        await loadDialogueList();

        console.log('=== 开始状态恢复逻辑 ===');

        // 尝试恢复之前的对话状态
        const lastDialogueId = LocalStorageService.getCurrentDialogueId();
        console.log('本地存储的上次对话ID:', lastDialogueId);
        console.log('当前对话列表长度:', dialogueList.value.length);
        console.log('当前对话列表详情:', dialogueList.value.map(d => ({ id: d.id, title: d.title })));

        let targetDialogueId = null;

        if (lastDialogueId && dialogueList.value.some(d => d.id === lastDialogueId)) {
          // 如果上次的对话还存在，恢复到该对话
          console.log('✅ 找到上次的对话，准备恢复:', lastDialogueId);
          targetDialogueId = lastDialogueId;
        } else if (dialogueList.value.length > 0) {
          // 否则选择最新的对话（第一个）
          console.log('⚠️ 上次对话不存在，选择最新对话:', dialogueList.value[0].id);
          targetDialogueId = dialogueList.value[0].id;
        } else {
          console.log('❌ 没有找到任何对话');
        }

        if (targetDialogueId) {
          console.log('准备切换到对话:', targetDialogueId);
          await switchDialogue(targetDialogueId);
          console.log('✅ 成功切换到对话:', targetDialogueId);
        } else {
          // 如果没有任何对话，不自动创建，等待用户操作
          console.log('🔄 没有找到任何对话，显示欢迎界面，等待用户创建新对话');
          currentDialogueId.value = null;
          messages.value = [];
          // 显示欢迎消息，但不创建对话
          showWelcomeMessage();
        }

        console.log('=== ChatManager 初始化完成 ===');
        console.log('最终状态 - 当前对话ID:', currentDialogueId.value);
        console.log('最终状态 - 消息数量:', messages.value.length);

      } catch (error) {
        console.error('=== 初始化失败 ===');
        console.error('错误详情:', error);
        // 初始化失败时，也不自动创建新对话
        console.log('初始化失败，显示欢迎界面');
        currentDialogueId.value = null;
        messages.value = [];
        showWelcomeMessage();
      }
    });
    
    // 监听消息变化，自动滚动到底部
    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    }, { deep: true });

    // 组件卸载前清理资源
    onBeforeUnmount(() => {
      // 关闭EventSource连接
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    });
    
    // 加载对话列表
    const loadDialogueList = async () => {
      console.log('=== 开始加载对话列表 ===');

      try {
        // 首先尝试从本地缓存加载
        const cachedDialogues = LocalStorageService.getDialogueList();
        console.log('本地缓存对话数量:', cachedDialogues.length);
        if (cachedDialogues.length > 0) {
          console.log('从本地缓存加载的对话:', cachedDialogues.map(d => ({ id: d.id, title: d.title })));
          dialogueList.value = cachedDialogues;
        }

        // 然后尝试从服务器获取最新数据
        console.log('=== 开始从服务器获取对话列表 ===');
        const response = await ApiService.getDialogueList();
        console.log('服务器完整响应:', JSON.stringify(response, null, 2));

        if (response && response.code === 0) {
          const serverDialogues = response.data || [];
          console.log('服务器返回对话数量:', serverDialogues.length);
          console.log('服务器返回的对话:', serverDialogues.map(d => ({ id: d.id, title: d.title })));

          dialogueList.value = serverDialogues;
          // 更新本地缓存
          LocalStorageService.setDialogueList(serverDialogues);
          console.log('已更新本地缓存');
        } else {
          console.warn('服务器响应异常 - 响应码:', response?.code, '响应数据:', response);
          // 如果服务器响应异常，保持使用本地缓存
          if (cachedDialogues.length === 0) {
            console.log('服务器响应异常且本地缓存为空，设置空列表');
            dialogueList.value = [];
          }
        }
      } catch (error) {
        console.error('=== 加载对话列表失败 ===');
        console.error('错误类型:', error.constructor.name);
        console.error('错误消息:', error.message);
        console.error('错误详情:', error);
        console.error('HTTP状态:', error.response?.status);
        console.error('响应数据:', error.response?.data);

        // 如果服务器请求失败，使用本地缓存
        const cachedDialogues = LocalStorageService.getDialogueList();
        if (cachedDialogues.length > 0) {
          dialogueList.value = cachedDialogues;
          console.log('API失败，使用本地缓存的', cachedDialogues.length, '个对话');
        } else {
          console.log('API失败且本地缓存也为空');
          dialogueList.value = [];
        }
      }

      console.log('=== 对话列表加载完成，最终结果 ===');
      console.log('最终对话列表长度:', dialogueList.value.length);
      console.log('最终对话列表:', dialogueList.value.map(d => ({ id: d.id, title: d.title })));
    };
    
    // 创建新对话
    const createNewDialogue = async () => {
      console.log('开始创建新对话...');
      isCreatingDialogue.value = true;
      try {
        // 创建新对话
        const response = await ApiService.createDialogue({
          title: '新对话',
          type: props.chatType
        });

        if (response.code === 0 && response.data) {
          const newDialogue = response.data;
          console.log('成功创建新对话:', newDialogue);
          currentDialogueId.value = newDialogue.id;

          // 清空消息列表
          messages.value = [];

          // 添加到对话列表开头
          dialogueList.value.unshift(newDialogue);

          // 更新本地缓存
          LocalStorageService.addDialogue(newDialogue);
          LocalStorageService.setCurrentDialogueId(newDialogue.id);

          // 清空消息列表，显示初始欢迎消息
          messages.value = [];
          await sendInitialMessage();

          console.log('新对话创建完成，ID:', newDialogue.id);
        }

      } catch (error) {
        console.error('创建新对话失败:', error);
        Message.error('创建新对话失败，请检查网络连接');

        // 如果创建失败，尝试使用本地临时对话
        const tempDialogue = {
          id: 'temp_' + Date.now(),
          title: '临时对话',
          type: props.chatType,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          isTemp: true
        };

        currentDialogueId.value = tempDialogue.id;
        messages.value = [];
        dialogueList.value.unshift(tempDialogue);
        LocalStorageService.addDialogue(tempDialogue);
        LocalStorageService.setCurrentDialogueId(tempDialogue.id);

        // 为临时对话发送初始消息
        await sendInitialMessage();
      } finally {
        isCreatingDialogue.value = false;
      }
    };
    
    // 切换对话
    const switchDialogue = async (dialogueId) => {
      if (currentDialogueId.value === dialogueId) return;

      currentDialogueId.value = dialogueId;
      messages.value = [];

      // 更新本地缓存的当前对话ID
      LocalStorageService.setCurrentDialogueId(dialogueId);

      // 加载对话历史
      await loadChatHistory(dialogueId);
    };
    
    // 加载聊天历史
    const loadChatHistory = async (dialogueId) => {
      console.log('开始加载聊天历史，对话ID:', dialogueId);

      try {
        // 首先从本地缓存加载
        const cachedMessages = LocalStorageService.getChatHistory(dialogueId);
        if (cachedMessages.length > 0) {
          console.log('从本地缓存加载到', cachedMessages.length, '条消息');
          messages.value = cachedMessages;
        }

        // 然后尝试从服务器获取最新数据
        console.log('尝试从服务器获取对话历史...');
        const response = await ApiService.getChatHistoryDetail(dialogueId);
        console.log('服务器响应:', response);

        if (response.code === 0 && response.data) {
          const chatData = response.data;
          let historyMessages = [];

          console.log('服务器返回的聊天数据:', chatData);

          // 处理messages字段（JSON格式）
          if (chatData.messages && Array.isArray(chatData.messages)) {
            console.log('处理', chatData.messages.length, '条历史消息');
            // 转换消息格式以适配前端显示
            historyMessages = chatData.messages.map((msg, index) => ({
              id: `${dialogueId}_${index}`, // 生成唯一ID
              message: msg.message,
              messageType: msg.messageType.toLowerCase(), // 转换为小写（user/assistant -> user/ai）
              createTime: msg.createTime || new Date().toISOString(),
              dialogueId: dialogueId
            }));

            // 将ASSISTANT类型转换为ai类型
            historyMessages = historyMessages.map(msg => ({
              ...msg,
              messageType: msg.messageType === 'assistant' ? 'ai' : msg.messageType
            }));
          }

          // 设置消息列表
          messages.value = historyMessages;
          // 更新本地缓存
          LocalStorageService.setChatHistory(dialogueId, historyMessages);
          console.log('成功加载', historyMessages.length, '条历史消息');

          // 如果没有历史消息，发送初始消息
          if (historyMessages.length === 0) {
            console.log('没有历史消息，发送初始消息');
            await sendInitialMessage();
          }
        } else {
          console.log('服务器没有返回有效数据，响应码:', response.code);
          // 如果服务器没有数据但本地有缓存，保持本地缓存
          if (cachedMessages.length === 0) {
            console.log('本地也没有缓存，发送初始消息');
            await sendInitialMessage();
          } else {
            console.log('保持本地缓存的', cachedMessages.length, '条消息');
          }
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
        console.error('错误详情:', error.response || error.message);

        // 如果服务器请求失败，使用本地缓存
        const cachedMessages = LocalStorageService.getChatHistory(dialogueId);
        if (cachedMessages.length > 0) {
          messages.value = cachedMessages;
          console.log('使用本地缓存的', cachedMessages.length, '条聊天历史');
        } else {
          // 如果本地也没有缓存，发送初始消息
          console.log('本地缓存也为空，发送初始消息');
          await sendInitialMessage();
        }
      }
    };
    

    


    // 显示欢迎消息（不创建对话）
    const showWelcomeMessage = () => {
      const welcomeMessage = props.chatType === 'fitness'
        ? "欢迎使用AI健身教练！点击\"新对话\"开始咨询健身相关问题。"
        : "欢迎使用AI超级智能体！点击\"新对话\"开始您的智能助手体验。";

      const welcomeMsg = {
        id: 'welcome_' + Date.now(),
        message: welcomeMessage,
        messageType: 'ai',
        createTime: new Date().toISOString(),
        dialogueId: null, // 欢迎消息不属于任何对话
        isWelcome: true // 标记为欢迎消息
      };

      messages.value = [welcomeMsg]; // 只显示欢迎消息
      console.log('显示欢迎消息');
    };

    // 发送初始消息（创建对话后）
    const sendInitialMessage = async () => {
      const welcomeMessage = props.chatType === 'fitness'
        ? "欢迎使用AI健身教练！您可以向我咨询任何健身相关的问题。"
        : "欢迎使用AI超级智能体！我可以帮助您解决各种问题。";

      const aiMessage = {
        id: Date.now(),
        message: welcomeMessage,
        messageType: 'ai',
        createTime: new Date().toISOString(),
        dialogueId: currentDialogueId.value
      };

      messages.value.push(aiMessage);

      // 保存到本地缓存
      LocalStorageService.addMessage(currentDialogueId.value, aiMessage);

      console.log('初始欢迎消息已添加到界面和本地缓存');
      // 注意：不再调用后端API保存初始消息
      // keep_report记录会在用户发送第一条真实消息时自动创建
    };

    // 显示删除确认弹窗
    const showDeleteConfirm = (dialogue) => {
      dialogueToDelete.value = dialogue;
      deleteConfirmVisible.value = true;
    };

    // 确认删除对话
    const confirmDeleteDialogue = async () => {
      if (!dialogueToDelete.value) return;

      const dialogueId = dialogueToDelete.value.id;
      isDeletingDialogue.value = dialogueId;

      try {
        const response = await ApiService.deleteDialogue(dialogueId);

        if (response.code === 0) {
          // 从列表中移除
          dialogueList.value = dialogueList.value.filter(d => d.id !== dialogueId);

          // 从本地缓存中移除
          LocalStorageService.removeDialogue(dialogueId);
          LocalStorageService.removeChatHistory(dialogueId);

          // 如果删除的是当前对话，切换到其他对话或创建新对话
          if (currentDialogueId.value === dialogueId) {
            if (dialogueList.value.length > 0) {
              await switchDialogue(dialogueList.value[0].id);
            } else {
              LocalStorageService.clearCurrentDialogueId();
              currentDialogueId.value = null;
              messages.value = [];
              showWelcomeMessage();
            }
          }

          Message.success('对话删除成功');

          // 关闭弹窗
          deleteConfirmVisible.value = false;
          dialogueToDelete.value = null;
        }
      } catch (error) {
        console.error('删除对话失败:', error);
        Message.error('删除对话失败，请检查网络连接');

        // 即使服务器删除失败，也可以从本地移除（用户体验优先）
        dialogueList.value = dialogueList.value.filter(d => d.id !== dialogueId);
        LocalStorageService.removeDialogue(dialogueId);
        LocalStorageService.removeChatHistory(dialogueId);

        if (currentDialogueId.value === dialogueId) {
          if (dialogueList.value.length > 0) {
            await switchDialogue(dialogueList.value[0].id);
          } else {
            LocalStorageService.clearCurrentDialogueId();
            currentDialogueId.value = null;
            messages.value = [];
            showWelcomeMessage();
          }
        }

        // 关闭弹窗
        deleteConfirmVisible.value = false;
        dialogueToDelete.value = null;
      } finally {
        isDeletingDialogue.value = null;
      }
    };

    // 删除对话
    const deleteDialogue = async (dialogueId) => {
      isDeletingDialogue.value = dialogueId;
      try {
        const response = await ApiService.deleteDialogue(dialogueId);

        if (response.code === 0) {
          // 从列表中移除
          dialogueList.value = dialogueList.value.filter(d => d.id !== dialogueId);

          // 从本地缓存中移除
          LocalStorageService.removeDialogue(dialogueId);
          LocalStorageService.removeChatHistory(dialogueId);

          // 如果删除的是当前对话，切换到其他对话或创建新对话
          if (currentDialogueId.value === dialogueId) {
            if (dialogueList.value.length > 0) {
              await switchDialogue(dialogueList.value[0].id);
            } else {
              LocalStorageService.clearCurrentDialogueId();
              await createNewDialogue();
            }
          }

          Message.success('对话已删除');
        }
      } catch (error) {
        console.error('删除对话失败:', error);
        Message.error('删除对话失败，请检查网络连接');

        // 即使服务器删除失败，也可以从本地移除（用户体验优先）
        dialogueList.value = dialogueList.value.filter(d => d.id !== dialogueId);
        LocalStorageService.removeDialogue(dialogueId);
        LocalStorageService.removeChatHistory(dialogueId);

        if (currentDialogueId.value === dialogueId) {
          if (dialogueList.value.length > 0) {
            await switchDialogue(dialogueList.value[0].id);
          } else {
            LocalStorageService.clearCurrentDialogueId();
            await createNewDialogue();
          }
        }
      } finally {
        isDeletingDialogue.value = null;
      }
    };

    // 发送消息
    const sendMessage = async () => {
      const message = userInput.value.trim();
      console.log('=== 开始发送消息 ===');
      console.log('消息内容:', message);
      console.log('当前对话ID:', currentDialogueId.value);
      console.log('是否正在加载:', isLoading.value);

      if (!message || isLoading.value) {
        console.log('消息为空或正在加载，取消发送');
        return;
      }

      // 如果没有当前对话，先创建新对话
      if (!currentDialogueId.value) {
        console.log('⚠️ 没有当前对话，需要先创建新对话');
        console.log('当前对话列表长度:', dialogueList.value.length);

        await createNewDialogue();

        // 创建对话后，清空输入框中的消息，因为我们要重新发送
        // 但保留用户输入的内容
        const userMessage = message;
        userInput.value = userMessage;
        console.log('新对话创建完成，重新发送消息');
        // 递归调用发送消息
        return await sendMessage();
      }

      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        message: message,
        messageType: 'user',
        createTime: new Date().toISOString(),
        dialogueId: currentDialogueId.value
      };

      messages.value.push(userMessage);
      // 立即保存用户消息到本地缓存
      LocalStorageService.addMessage(currentDialogueId.value, userMessage);

      userInput.value = '';
      isLoading.value = true;
      isTyping.value = true;

      // 注意：新的keep_report系统会自动保存消息到数据库

      let currentResponse = '';

      try {
        // 根据聊天类型选择不同的API
        if (props.chatType === 'fitness') {
          eventSource = ApiService.createKeepAppSSEConnection(message, currentDialogueId.value.toString());
        } else {
          eventSource = ApiService.createManusSSEConnection(message, currentDialogueId.value.toString());
        }

        // 添加AI消息占位
        const aiMessageIndex = messages.value.length;
        const aiMessage = {
          id: Date.now() + 1,
          message: '',
          messageType: 'ai',
          createTime: new Date().toISOString(),
          dialogueId: currentDialogueId.value
        };
        messages.value.push(aiMessage);

        eventSource.onmessage = (event) => {
          if (event.data) {
            currentResponse += event.data;
            // 更新消息内容
            messages.value[aiMessageIndex].message = currentResponse;
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          eventSource.close();
          isLoading.value = false;
          isTyping.value = false;

          // 如果没有收到任何响应，添加错误消息
          if (!currentResponse) {
            messages.value[aiMessageIndex].message = "抱歉，服务器连接出现问题，请稍后再试。";
            // 保存错误消息到本地缓存
            LocalStorageService.addMessage(currentDialogueId.value, messages.value[aiMessageIndex]);
          } else {
            // 保存部分响应到本地缓存
            LocalStorageService.addMessage(currentDialogueId.value, messages.value[aiMessageIndex]);
          }
        };

        // SSE完成时的处理
        eventSource.addEventListener('complete', async () => {
          eventSource.close();
          isLoading.value = false;
          isTyping.value = false;

          // 保存AI响应到本地缓存
          const finalAiMessage = messages.value[aiMessageIndex];
          LocalStorageService.addMessage(currentDialogueId.value, finalAiMessage);

          // 注意：新的keep_report系统会自动保存AI响应到数据库
        });
      } catch (error) {
        console.error('Error sending message:', error);
        isLoading.value = false;
        isTyping.value = false;

        const errorMessage = {
          id: Date.now() + 2,
          message: "抱歉，发送消息时出现错误，请稍后再试。",
          messageType: 'ai',
          createTime: new Date().toISOString(),
          dialogueId: currentDialogueId.value
        };

        messages.value.push(errorMessage);
        // 保存错误消息到本地缓存
        LocalStorageService.addMessage(currentDialogueId.value, errorMessage);
      }
    };

    // 滚动到底部
    const scrollToBottom = () => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
      }
    };

    // 格式化时间 - 年月日时分格式
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      // return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // 格式化对话时间
    const formatDialogueTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return formatTime(timestamp);
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString();
      }
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

    // 返回主页
    const goToHome = () => {
      router.push('/');
    };

    return {
      messages,
      userInput,
      isLoading,
      isTyping,
      chatMessages,
      currentDialogueId,
      dialogueList,
      isCreatingDialogue,
      isDeletingDialogue,
      deleteConfirmVisible,
      dialogueToDelete,
      createNewDialogue,
      switchDialogue,
      deleteDialogue,
      showDeleteConfirm,
      confirmDeleteDialogue,
      sendMessage,
      formatTime,
      formatDialogueTime,
      processMessageContent,
      goToHome,
      showWelcomeMessage
    };
  }
};
</script>

<style lang="scss" scoped>
.chat-manager {
  display: flex;
  height: calc(100vh - 60px); /* 减去footer高度 */
  background-color: #f5f5f5;
  overflow: hidden; // 防止整体页面滚动
  margin-bottom: 60px; /* 为footer留出空间 */
  transition: background-color 0.3s ease;
}

// 左侧边栏
.sidebar {
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 16px 16px 12px 16px;
    border-bottom: 1px solid #e8e8e8;

    .app-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .app-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        :deep(svg) {
          width: 18px;
          height: 18px;
        }
      }

      .app-name {
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
    }
  }

  .new-chat-section {
    padding: 12px 16px 16px 16px;
    border-bottom: 1px solid #e8e8e8;

    .new-chat-btn {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
      background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      }

      &:active {
        transform: translateY(0);
      }

      :deep(.arco-btn-icon) {
        margin-right: 6px;
      }
    }
  }

  .dialogue-list {
    flex: 1;
    overflow-y: auto;

    .list-header {
      padding: 16px 16px 8px;
      font-size: 13px;
      color: #666;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .dialogue-item {
      margin: 4px 8px;
      padding: 12px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border: 1px solid transparent;
      transform: translateX(0);
      overflow: hidden;

      /* 添加微妙的阴影效果 */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s;
      }

      &:hover {
        background-color: #f8f9fa;
        border-color: #e8e8e8;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .dialogue-actions {
          opacity: 1;
        }

        /* 触发光效动画 */
        &::before {
          left: 100%;
        }
      }

      &.active {
        background-color: #e6f7ff;
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
      }

      .dialogue-title {
        font-size: 14px;
        color: #333;
        margin-bottom: 6px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.4;
      }

      .dialogue-time {
        font-size: 12px;
        color: #999;
        font-weight: 400;
      }

      .dialogue-actions {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: opacity 0.2s ease;

        :deep(.arco-btn) {
          color: #999;
          width: 24px;
          height: 24px;

          &:hover {
            color: #ff4d4f;
            background-color: rgba(255, 77, 79, 0.1);
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;

      :deep(svg) {
        width: 40px;
        height: 40px;
        margin-bottom: 12px;
        opacity: 0.6;
      }

      span {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 右侧聊天区域
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  min-height: 0; // 确保flex子元素能正确收缩

  .chat-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e8e8e8;
    background-color: #fafafa;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 70px;

    .header-content {
      flex: 1;

      h2 {
        margin: 0 0 4px 0;
        font-size: 22px;
        color: #333;
        font-weight: 600;
      }

      .description {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }
    }

    .header-actions {
      flex: 0 0 auto;

      .home-button {
        color: #666;
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          color: #1890ff;
          background-color: rgba(24, 144, 255, 0.1);
        }

        :deep(.arco-btn-icon) {
          margin-right: 4px;
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    padding: 24px 24px 120px 24px; /* 底部增加padding为固定输入框留空间 */
    overflow-y: auto;
    background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
    min-height: 0; // 确保能正确收缩



    .message {
      margin-bottom: 16px;
      max-width: 85%;
      animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      animation-fill-mode: forwards;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .message-content {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 16px;
        line-height: 1.5;
        word-break: break-word;
        position: relative;
        max-width: 100%;
        display: inline-block;
        text-align: left;
      }

      .message-time {
        font-size: 12px;
        color: #8E8E93;
        margin-top: 4px;
        font-weight: 400;
        opacity: 0.8;
        align-self: flex-start;
      }

      &.user-message {
        margin-left: auto;
        align-items: flex-end;
        max-width: 80%;

        .message-content {
          background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
          color: #ffffff;
          border-radius: 18px 18px 4px 18px;
          box-shadow: 0 2px 12px rgba(0, 122, 255, 0.15);
          position: relative;
          font-weight: 400;
          letter-spacing: 0.3px;

          /* 添加气泡尾巴 */
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: -6px;
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-left-color: #007AFF;
            border-bottom: none;
            border-right: none;
          }

          /* 优化文字显示 */
          span {
            display: block;
            word-wrap: break-word;
            white-space: pre-wrap;
          }
        }

        .message-time {
          align-self: flex-end;
          color: #8E8E93;
          font-size: 12px;
          margin-top: 4px;
        }
      }

      &.ai-message {
        margin-right: auto;
        max-width: 80%;

        .message-content {
          background-color: #F2F2F7;
          color: #1C1C1E;
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          position: relative;
          font-weight: 400;
          letter-spacing: 0.3px;

          /* 添加气泡尾巴 */
          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: -6px;
            width: 0;
            height: 0;
            border: 6px solid transparent;
            border-right-color: #F2F2F7;
            border-bottom: none;
            border-left: none;
          }

          /* 优化文字显示 */
          span {
            display: block;
            word-wrap: break-word;
            white-space: pre-wrap;
          }
          border: 1px solid rgba(0, 0, 0, 0.06);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
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
          border: 1px solid #e8e8e8;

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
    position: fixed;
    bottom: 60px; /* 在footer上方 */
    left: 280px; /* 侧边栏宽度 */
    right: 0;
    flex-shrink: 0; // 防止输入框被压缩
    padding: 20px 24px;
    background-color: #fff;
    border-top: 1px solid #e8e8e8;
    z-index: 100;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);

    :deep(.arco-input-wrapper) {
      border-radius: 24px;
      border: 2px solid #e8e8e8;
      background-color: #f8f9fa;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:hover {
        border-color: #1890ff;
        background-color: #fff;
      }

      &.arco-input-focus {
        border-color: #1890ff;
        background-color: #fff;
        box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
      }
    }

    :deep(.arco-input) {
      background: transparent;
      border: none;
      padding: 12px 16px;
      font-size: 15px;
      line-height: 1.5;

      &::placeholder {
        color: #999;
      }
    }

    :deep(.arco-input-suffix) {
      cursor: pointer;
      padding-right: 8px;

      .arco-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        border: none;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        /* 添加点击波纹效果 */
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s;
        }

        &:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
        }

        &:active {
          transform: translateY(0) scale(0.95);

          &::before {
            width: 100%;
            height: 100%;
          }
        }

        &:disabled {
          background: #d9d9d9;
          box-shadow: none;
          transform: none;
        }
      }
    }
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

@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-manager {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;

    .dialogue-list {
      .dialogue-item {
        padding: 8px 16px;
      }
    }
  }

  .chat-area {
    .chat-messages .message {
      max-width: 90%;
    }

    .chat-header h2 {
      font-size: 20px;
    }

    .chat-input {
      left: 0; /* 小屏幕时占满宽度 */
      padding: 12px 16px;
    }
  }
}

/* 删除确认弹窗样式 */
.delete-confirm-modal {
  .arco-modal-body {
    padding: 0;
  }
}

.delete-confirm-content {
  padding: 24px;

  .delete-confirm-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    position: relative;

    .warning-icon {
      color: #ff7d00;
      font-size: 20px;
      margin-right: 12px;
      display: flex;
      align-items: center;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
      flex: 1;
    }

    .close-btn {
      position: absolute;
      right: 0;
      top: -4px;
      color: #86909c;

      &:hover {
        color: #4e5969;
        background-color: #f2f3f5;
      }
    }
  }

  .delete-confirm-body {
    margin-bottom: 24px;

    p {
      margin: 0;
      color: #4e5969;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .delete-confirm-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .cancel-btn {
      min-width: 80px;
      height: 40px;
      border-radius: 6px;
      border: 1px solid #d9d9d9;
      background-color: #fff;
      color: #4e5969;

      &:hover {
        border-color: #165dff;
        color: #165dff;
      }
    }

    .delete-btn {
      min-width: 80px;
      height: 40px;
      border-radius: 6px;
      background-color: #f53f3f;
      border-color: #f53f3f;

      &:hover {
        background-color: #f76965;
        border-color: #f76965;
      }

      &:active {
        background-color: #e8272c;
        border-color: #e8272c;
      }
    }
  }
}

// 暗黑模式样式
:global(.dark-theme) {
  .chat-manager {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  }

  // 侧边栏暗黑模式
  .sidebar {
    background: linear-gradient(180deg, rgba(25, 25, 35, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%);
    border-right: 1px solid rgba(141, 154, 255, 0.2);
    box-shadow: 4px 0 32px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);

    .sidebar-header {
      border-bottom-color: rgba(141, 154, 255, 0.15);

      .app-info {
        .app-icon {
          background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
          box-shadow: 0 4px 16px rgba(141, 109, 178, 0.5);
        }

        .app-name {
          color: #f0f0f0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .new-chat-section {
      border-bottom-color: rgba(141, 154, 255, 0.15);

      .new-chat-btn {
        background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
        box-shadow: 0 4px 16px rgba(141, 109, 178, 0.5);

        &:hover {
          box-shadow: 0 6px 20px rgba(141, 109, 178, 0.6);
        }
      }
    }

    .dialogue-list {
      .list-header {
        color: #c0c0c0;
      }

      .dialogue-item {
        &:hover {
          background: linear-gradient(135deg, rgba(141, 154, 255, 0.12) 0%, rgba(157, 125, 197, 0.1) 100%);
          border-color: rgba(141, 154, 255, 0.3);
          box-shadow: 0 4px 12px rgba(141, 154, 255, 0.15);
        }

        &.active {
          background: linear-gradient(135deg, rgba(141, 154, 255, 0.25) 0%, rgba(157, 125, 197, 0.2) 100%);
          border-color: rgba(141, 154, 255, 0.5);
          box-shadow: 0 4px 16px rgba(141, 154, 255, 0.3);
        }

        .dialogue-title {
          color: #f0f0f0;
        }

        .dialogue-time {
          color: #b0b0b0;
        }

        .dialogue-actions {
          :deep(.arco-btn) {
            color: #b0b0b0;

            &:hover {
              color: #ff6b6b;
              background-color: rgba(255, 107, 107, 0.15);
            }
          }
        }
      }

      .empty-state {
        color: #b0b0b0;

        :deep(svg) {
          opacity: 0.4;
        }
      }
    }
  }

  // 聊天区域暗黑模式
  .chat-area {
    background: linear-gradient(135deg, rgba(20, 22, 30, 0.98) 0%, rgba(15, 17, 25, 0.98) 100%);

    .chat-header {
      background: linear-gradient(135deg, rgba(30, 32, 42, 0.98) 0%, rgba(25, 27, 37, 0.98) 100%);
      border-bottom: 1px solid rgba(141, 154, 255, 0.2);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

      .header-content {
        h2 {
          color: #ffffff;
          text-shadow: 0 2px 12px rgba(141, 154, 255, 0.5);
        }

        .description {
          color: #d0d0d0;
        }
      }

      .header-actions {
        .home-button {
          color: #c0c0c0;

          &:hover {
            color: #a5b4ff;
            background: linear-gradient(135deg, rgba(141, 154, 255, 0.15) 0%, rgba(157, 125, 197, 0.12) 100%);
          }
        }
      }
    }

    .chat-messages {
      background: linear-gradient(to bottom, rgba(15, 17, 25, 0.5) 0%, rgba(20, 22, 30, 0.8) 100%);

      .message {
        &.user-message {
          .message-content {
            background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
            box-shadow: 0 4px 16px rgba(141, 109, 178, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);

            &::after {
              border-left-color: #8d9aff;
            }
          }

          .message-time {
            color: #b0b0b0;
          }
        }

        &.ai-message {
          .message-content {
            background: linear-gradient(135deg, rgba(40, 42, 54, 0.95) 0%, rgba(32, 34, 45, 0.95) 100%);
            color: #e8e8e8;
            border: 1px solid rgba(141, 154, 255, 0.25);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);

            &::after {
              border-right-color: rgba(40, 42, 54, 0.95);
            }
          }

          .message-time {
            color: #b0b0b0;
          }
        }

        &.typing {
          .typing-indicator {
            background: linear-gradient(135deg, rgba(40, 42, 54, 0.95) 0%, rgba(32, 34, 45, 0.95) 100%);
            border: 1px solid rgba(141, 154, 255, 0.25);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

            span {
              background-color: #a5b4ff;
            }
          }
        }
      }
    }

    .chat-input {
      background: linear-gradient(135deg, rgba(30, 32, 42, 0.98) 0%, rgba(25, 27, 37, 0.98) 100%);
      border-top: 1px solid rgba(141, 154, 255, 0.2);
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.4);

      :deep(.arco-input-wrapper) {
        background: linear-gradient(135deg, rgba(40, 42, 54, 0.8) 0%, rgba(32, 34, 45, 0.8) 100%);
        border-color: rgba(141, 154, 255, 0.3);

        &:hover {
          border-color: rgba(141, 154, 255, 0.5);
          background: linear-gradient(135deg, rgba(45, 47, 60, 0.9) 0%, rgba(37, 39, 51, 0.9) 100%);
        }

        &.arco-input-focus {
          border-color: rgba(141, 154, 255, 0.6);
          background: linear-gradient(135deg, rgba(48, 52, 68, 0.95) 0%, rgba(40, 44, 58, 0.95) 100%);
          box-shadow: 0 0 0 3px rgba(141, 154, 255, 0.2);
        }
      }

      :deep(.arco-input) {
        color: #e8e8e8;

        &::placeholder {
          color: #888;
        }
      }

      :deep(.arco-input-suffix) {
        .arco-btn {
          background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
          box-shadow: 0 4px 12px rgba(141, 109, 178, 0.5);

          &:hover {
            box-shadow: 0 6px 20px rgba(141, 109, 178, 0.6);
          }

          &:disabled {
            background: rgba(60, 60, 70, 0.5);
          }
        }
      }
    }
  }

  // 删除确认弹窗暗黑模式
  .delete-confirm-modal {
    :deep(.arco-modal) {
      background: linear-gradient(180deg, rgba(35, 35, 45, 0.98) 0%, rgba(30, 30, 40, 0.98) 100%);
      border: 1px solid rgba(141, 154, 255, 0.25);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    }
  }

  .delete-confirm-content {
    .delete-confirm-header {
      .warning-icon {
        color: #ffa940;
      }

      h3 {
        color: #f0f0f0;
      }

      .close-btn {
        color: #b0b0b0;

        &:hover {
          color: #e8e8e8;
          background: rgba(141, 154, 255, 0.15);
        }
      }
    }

    .delete-confirm-body {
      p {
        color: #d0d0d0;
      }
    }

    .delete-confirm-footer {
      .cancel-btn {
        background: rgba(60, 60, 70, 0.5);
        border-color: rgba(141, 154, 255, 0.3);
        color: #e8e8e8;

        &:hover {
          border-color: rgba(141, 154, 255, 0.5);
          background: rgba(70, 70, 80, 0.6);
        }
      }

      .delete-btn {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);

        &:hover {
          background: linear-gradient(135deg, #ff7979 0%, #ff6060 100%);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.5);
        }

        &:active {
          background: linear-gradient(135deg, #ff5252 0%, #ff4444 100%);
        }
      }
    }
  }
}
</style>
