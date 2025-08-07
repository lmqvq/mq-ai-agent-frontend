<template>
  <div class="user-profile">
    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar">
              <img v-if="userInfo.userAvatar" :src="userInfo.userAvatar" alt="头像" />
              <icon-user v-else />
            </div>
            <a-button type="text" size="small" @click="showAvatarUpload = true">
              <icon-camera />
              更换头像
            </a-button>
          </div>
          <div class="user-info">
            <h2>{{ userInfo.userName || '未设置昵称' }}</h2>
            <p class="user-role">{{ getRoleText(userInfo.userRole) }}</p>
            <p class="join-date">加入时间：{{ formatDate(userInfo.createTime) }}</p>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-number">{{ fitnessStats.totalWorkouts }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ fitnessStats.totalDays }}</div>
            <div class="stat-label">坚持天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ fitnessStats.currentStreak }}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      </div>

      <!-- 健身目标设定 -->
      <div class="goals-card">
        <div class="card-header">
          <h3><icon-star />健身目标</h3>
          <a-button type="primary" size="small" @click="showGoalModal = true">
            <icon-plus />设定目标
          </a-button>
        </div>
        <div class="goals-list">
          <div v-for="goal in fitnessGoals" :key="goal.id" class="goal-item">
            <div class="goal-info">
              <h4>{{ goal.title }}</h4>
              <p>{{ goal.description }}</p>
              <div class="goal-progress">
                <a-progress 
                  :percent="goal.progress" 
                  :color="getProgressColor(goal.progress)"
                  size="small"
                />
                <span class="progress-text">{{ goal.progress }}%</span>
              </div>
            </div>
            <div class="goal-actions">
              <a-button type="text" size="small" @click="editGoal(goal)">
                <icon-edit />
              </a-button>
              <a-button type="text" size="small" status="danger" @click="deleteGoal(goal.id)">
                <icon-delete />
              </a-button>
            </div>
          </div>
          <div v-if="fitnessGoals.length === 0" class="empty-goals">
            <icon-star />
            <p>还没有设定健身目标</p>
            <a-button type="primary" @click="showGoalModal = true">立即设定</a-button>
          </div>
        </div>
      </div>

      <!-- 身体数据记录 -->
      <div class="body-data-card">
        <div class="card-header">
          <h3><icon-heart />身体数据</h3>
          <a-button type="primary" size="small" @click="showDataModal = true">
            <icon-plus />记录数据
          </a-button>
        </div>
        <div class="data-charts">
          <div class="chart-item">
            <h4>体重变化</h4>
            <div class="chart-container" ref="weightChart"></div>
          </div>
          <div class="chart-item">
            <h4>体脂率变化</h4>
            <div class="chart-container" ref="bodyFatChart"></div>
          </div>
        </div>
        <div class="latest-data">
          <div class="data-item">
            <span class="label">最新体重</span>
            <span class="value">{{ latestBodyData.weight || '--' }} kg</span>
          </div>
          <div class="data-item">
            <span class="label">最新体脂率</span>
            <span class="value">{{ latestBodyData.bodyFat || '--' }}%</span>
          </div>
          <div class="data-item">
            <span class="label">BMI指数</span>
            <span class="value">{{ calculateBMI() || '--' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设定目标弹窗 -->
    <a-modal v-model:visible="showGoalModal" title="设定健身目标" @ok="saveGoal">
      <a-form :model="goalForm" layout="vertical">
        <a-form-item label="目标类型">
          <a-select v-model="goalForm.type" placeholder="选择目标类型">
            <a-option value="weight_loss">减重</a-option>
            <a-option value="muscle_gain">增肌</a-option>
            <a-option value="endurance">提升耐力</a-option>
            <a-option value="strength">增强力量</a-option>
            <a-option value="flexibility">提升柔韧性</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标标题">
          <a-input v-model="goalForm.title" placeholder="输入目标标题" />
        </a-form-item>
        <a-form-item label="目标描述">
          <a-textarea v-model="goalForm.description" placeholder="详细描述您的健身目标" />
        </a-form-item>
        <a-form-item label="目标数值">
          <a-input-number v-model="goalForm.targetValue" placeholder="目标数值" />
        </a-form-item>
        <a-form-item label="截止日期">
          <a-date-picker v-model="goalForm.deadline" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 记录身体数据弹窗 -->
    <a-modal v-model:visible="showDataModal" title="记录身体数据" @ok="saveBodyData">
      <a-form :model="bodyDataForm" layout="vertical">
        <a-form-item label="体重 (kg)">
          <a-input-number v-model="bodyDataForm.weight" placeholder="输入体重" :precision="1" />
        </a-form-item>
        <a-form-item label="体脂率 (%)">
          <a-input-number v-model="bodyDataForm.bodyFat" placeholder="输入体脂率" :precision="1" />
        </a-form-item>
        <a-form-item label="身高 (cm)">
          <a-input-number v-model="bodyDataForm.height" placeholder="输入身高" />
        </a-form-item>
        <a-form-item label="记录日期">
          <a-date-picker v-model="bodyDataForm.recordDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="bodyDataForm.notes" placeholder="添加备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import {
  IconUser, IconCamera, IconStar, IconPlus, IconEdit, IconDelete, IconHeart
} from '@arco-design/web-vue/es/icon';
import ApiService from '@/services/api';

export default {
  name: 'UserProfile',
  components: {
    IconUser, IconCamera, IconStar, IconPlus, IconEdit, IconDelete, IconHeart
  },
  setup() {
    // 响应式数据
    const userInfo = ref({});
    const fitnessStats = ref({
      totalWorkouts: 0,
      totalDays: 0,
      currentStreak: 0
    });
    const fitnessGoals = ref([]);
    const latestBodyData = ref({});
    
    // 弹窗控制
    const showGoalModal = ref(false);
    const showDataModal = ref(false);
    const showAvatarUpload = ref(false);
    
    // 表单数据
    const goalForm = reactive({
      type: '',
      title: '',
      description: '',
      targetValue: null,
      deadline: null
    });
    
    const bodyDataForm = reactive({
      weight: null,
      bodyFat: null,
      height: null,
      recordDate: new Date(),
      notes: ''
    });

    // 方法
    const loadUserInfo = async () => {
      try {
        const response = await ApiService.getLoginUser();
        if (response.code === 0) {
          userInfo.value = response.data;
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    };

    const getRoleText = (role) => {
      const roleMap = {
        'admin': '管理员',
        'user': '普通用户',
        'vip': 'VIP用户'
      };
      return roleMap[role] || '普通用户';
    };

    const formatDate = (dateString) => {
      if (!dateString) return '--';
      return new Date(dateString).toLocaleDateString('zh-CN');
    };

    const getProgressColor = (progress) => {
      if (progress >= 80) return '#00b42a';
      if (progress >= 50) return '#ff7d00';
      return '#f53f3f';
    };

    const calculateBMI = () => {
      if (latestBodyData.value.weight && bodyDataForm.height) {
        const heightInM = bodyDataForm.height / 100;
        return (latestBodyData.value.weight / (heightInM * heightInM)).toFixed(1);
      }
      return null;
    };

    const saveGoal = () => {
      // 这里应该调用API保存目标
      const newGoal = {
        id: Date.now(),
        ...goalForm,
        progress: 0,
        createdAt: new Date()
      };
      fitnessGoals.value.push(newGoal);
      showGoalModal.value = false;
      
      // 重置表单
      Object.keys(goalForm).forEach(key => {
        goalForm[key] = key === 'targetValue' ? null : '';
      });
    };

    const saveBodyData = () => {
      // 这里应该调用API保存身体数据
      latestBodyData.value = { ...bodyDataForm };
      showDataModal.value = false;
      
      // 重置表单
      Object.keys(bodyDataForm).forEach(key => {
        if (key === 'recordDate') {
          bodyDataForm[key] = new Date();
        } else if (typeof bodyDataForm[key] === 'number') {
          bodyDataForm[key] = null;
        } else {
          bodyDataForm[key] = '';
        }
      });
    };

    const editGoal = (goal) => {
      Object.assign(goalForm, goal);
      showGoalModal.value = true;
    };

    const deleteGoal = (goalId) => {
      const index = fitnessGoals.value.findIndex(g => g.id === goalId);
      if (index > -1) {
        fitnessGoals.value.splice(index, 1);
      }
    };

    // 生命周期
    onMounted(() => {
      loadUserInfo();
      // 模拟数据
      fitnessStats.value = {
        totalWorkouts: 45,
        totalDays: 30,
        currentStreak: 7
      };
    });

    return {
      userInfo,
      fitnessStats,
      fitnessGoals,
      latestBodyData,
      showGoalModal,
      showDataModal,
      showAvatarUpload,
      goalForm,
      bodyDataForm,
      getRoleText,
      formatDate,
      getProgressColor,
      calculateBMI,
      saveGoal,
      saveBodyData,
      editGoal,
      deleteGoal
    };
  }
};
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.profile-card, .goals-card, .body-data-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-card {
  grid-column: 1 / -1;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 24px;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(45deg, #4080ff, #40a9ff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      :deep(svg) {
        width: 32px;
        height: 32px;
        color: white;
      }
    }
  }

  .user-info {
    flex: 1;

    h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .user-role {
      margin: 0 0 4px 0;
      color: #4080ff;
      font-weight: 500;
    }

    .join-date {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;

  .stat-item {
    text-align: center;

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #4080ff;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(svg) {
      color: #4080ff;
    }
  }
}

.goals-list {
  .goal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .goal-info {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
      }

      .goal-progress {
        display: flex;
        align-items: center;
        gap: 12px;

        .progress-text {
          font-size: 14px;
          font-weight: 500;
          color: #4080ff;
        }
      }
    }

    .goal-actions {
      display: flex;
      gap: 8px;
    }
  }

  .empty-goals {
    text-align: center;
    padding: 40px 20px;
    color: #666;

    :deep(svg) {
      font-size: 48px;
      color: #d9d9d9;
      margin-bottom: 16px;
    }

    p {
      margin: 0 0 16px 0;
      font-size: 16px;
    }
  }
}

.data-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  .chart-item {
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .chart-container {
      height: 200px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    }
  }
}

.latest-data {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .data-item {
    text-align: center;

    .label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .value {
      font-size: 20px;
      font-weight: 600;
      color: #4080ff;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;

    .avatar-section {
      margin-right: 0;
      margin-bottom: 16px;
    }
  }

  .profile-stats {
    .stat-item .stat-number {
      font-size: 24px;
    }
  }

  .data-charts {
    grid-template-columns: 1fr;
  }

  .latest-data {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .goal-item {
    flex-direction: column;
    align-items: flex-start;

    .goal-actions {
      margin-top: 12px;
      align-self: flex-end;
    }
  }
}
</style>
