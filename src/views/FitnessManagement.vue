<template>
  <div class="fitness-management">
    <div class="management-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1><icon-dashboard />健身管理中心</h1>
        <p>全面管理您的健身数据、运动记录、训练计划和健身目标</p>
      </div>

      <!-- 标签页导航 -->
      <a-tabs v-model:active-key="activeTab" type="card" class="management-tabs">
        <a-tab-pane key="overview" title="数据概览">
          <div class="tab-content">
            <!-- 数据概览内容 -->
            <div class="overview-section">
              <div class="stats-cards">
                <div class="stat-card">
                  <div class="stat-icon weight">
                    <icon-user />
                  </div>
                  <div class="stat-content">
                    <h3>当前体重</h3>
                    <div class="value">{{ overviewData.weight || '--' }} <span>kg</span></div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon bodyfat">
                    <icon-heart />
                  </div>
                  <div class="stat-content">
                    <h3>体脂率</h3>
                    <div class="value">{{ overviewData.bodyFat || '--' }} <span>%</span></div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon exercise">
                    <icon-fire />
                  </div>
                  <div class="stat-content">
                    <h3>本月运动</h3>
                    <div class="value">{{ overviewData.monthlyExercise || 0 }} <span>次</span></div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon goals">
                    <icon-trophy />
                  </div>
                  <div class="stat-content">
                    <h3>活跃目标</h3>
                    <div class="value">{{ overviewData.activeGoals || 0 }} <span>个</span></div>
                  </div>
                </div>
              </div>

              <!-- 快速操作 -->
              <div class="quick-actions">
                <h3>快速操作</h3>
                <div class="actions-grid">
                  <a-button type="primary" size="large" @click="quickAddData">
                    <icon-plus />记录健身数据
                  </a-button>
                  <a-button type="primary" size="large" @click="quickAddExercise">
                    <icon-plus />添加运动记录
                  </a-button>
                  <a-button type="primary" size="large" @click="quickCreatePlan">
                    <icon-plus />创建训练计划
                  </a-button>
                  <a-button type="primary" size="large" @click="quickSetGoal">
                    <icon-plus />设定健身目标
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="data" title="健身数据">
          <div class="tab-content">
            <!-- 这里可以嵌入原来的FitnessData组件内容 -->
            <div class="data-management">
              <h3>健身数据管理</h3>
              <p>在这里可以查看和管理您的体重、体脂率、身高等健身数据</p>
              <!-- 可以在这里添加简化版的数据管理功能 -->
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="exercise" title="运动记录">
          <div class="tab-content">
            <ExerciseManager />
          </div>
        </a-tab-pane>

        <a-tab-pane key="plans" title="训练计划">
          <div class="tab-content">
            <TrainingPlanManager />
          </div>
        </a-tab-pane>

        <a-tab-pane key="goals" title="健身目标">
          <div class="tab-content">
            <FitnessGoalManager />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 快速添加弹窗 -->
    <a-modal v-model:visible="showQuickModal" :title="quickModalTitle" @ok="handleQuickAction">
      <component :is="quickModalComponent" v-if="quickModalComponent" />
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
// eslint-disable-next-line no-unused-vars
import { Message } from '@arco-design/web-vue';
import { 
  IconDashboard, IconUser, IconHeart, IconFire, IconTrophy, IconPlus
} from '@arco-design/web-vue/es/icon';
import ExerciseManager from '@/components/ExerciseManager.vue';
import TrainingPlanManager from '@/components/TrainingPlanManager.vue';
import FitnessGoalManager from '@/components/FitnessGoalManager.vue';
import ApiService from '@/services/api';

export default {
  name: 'FitnessManagement',
  components: {
    IconDashboard, IconUser, IconHeart, IconFire, IconTrophy, IconPlus,
    ExerciseManager, TrainingPlanManager, FitnessGoalManager
  },
  setup() {
    const activeTab = ref('overview');
    const showQuickModal = ref(false);
    const quickModalTitle = ref('');
    const quickModalComponent = ref(null);
    
    const overviewData = reactive({
      weight: null,
      bodyFat: null,
      monthlyExercise: 0,
      activeGoals: 0
    });

    // 加载概览数据
    const loadOverviewData = async () => {
      try {
        // 加载最新健身数据
        const fitnessResponse = await ApiService.getMyFitnessDataByPage({
          current: 1,
          pageSize: 1
        });
        
        if (fitnessResponse.code === 0 && fitnessResponse.data?.records?.length > 0) {
          const latest = fitnessResponse.data.records[0];
          overviewData.weight = latest.weight;
          overviewData.bodyFat = latest.bodyFat;
        }

        // 加载运动统计
        const exerciseResponse = await ApiService.getExerciseStats(30);
        if (exerciseResponse.code === 0) {
          overviewData.monthlyExercise = exerciseResponse.data.monthlyCount || 0;
        }

        // 加载活跃目标数量
        const goalsResponse = await ApiService.getActiveFitnessGoals();
        if (goalsResponse.code === 0) {
          overviewData.activeGoals = goalsResponse.data?.length || 0;
        }
      } catch (error) {
        console.error('加载概览数据失败:', error);
      }
    };

    // 快速操作方法
    const quickAddData = () => {
      activeTab.value = 'data';
    };

    const quickAddExercise = () => {
      activeTab.value = 'exercise';
    };

    const quickCreatePlan = () => {
      activeTab.value = 'plans';
    };

    const quickSetGoal = () => {
      activeTab.value = 'goals';
    };

    const handleQuickAction = () => {
      showQuickModal.value = false;
    };

    // 页面初始化
    onMounted(async () => {
      await loadOverviewData();
    });

    return {
      activeTab,
      showQuickModal,
      quickModalTitle,
      quickModalComponent,
      overviewData,
      loadOverviewData,
      quickAddData,
      quickAddExercise,
      quickCreatePlan,
      quickSetGoal,
      handleQuickAction
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.management-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;

  h1 {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
}

.management-tabs {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  :deep(.arco-tabs-nav) {
    background: #f8f9fa;
    margin: 0;
    padding: 0 24px;
  }

  :deep(.arco-tabs-content) {
    padding: 0;
  }

  .tab-content {
    padding: 24px;
    min-height: 600px;
  }
}

.overview-section {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 32px;

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(svg) {
          width: 24px;
          height: 24px;
          color: white;
        }

        &.weight {
          background: linear-gradient(45deg, #4080ff, #40a9ff);
        }

        &.bodyfat {
          background: linear-gradient(45deg, #f53f3f, #ff7875);
        }

        &.exercise {
          background: linear-gradient(45deg, #ff7d00, #ffa940);
        }

        &.goals {
          background: linear-gradient(45deg, #00b42a, #52c41a);
        }
      }

      .stat-content {
        h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .value {
          font-size: 24px;
          font-weight: 700;
          color: #333;

          span {
            font-size: 14px;
            color: #666;
            font-weight: 400;
          }
        }
      }
    }
  }

  .quick-actions {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .arco-btn {
        height: 60px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.data-management {
  text-align: center;
  padding: 40px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  p {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr !important;
  }

  .actions-grid {
    grid-template-columns: 1fr !important;
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>
