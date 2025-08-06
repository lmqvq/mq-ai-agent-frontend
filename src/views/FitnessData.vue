<template>
  <div class="fitness-data">
    <div class="data-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1><icon-bar-chart />健身数据中心</h1>
        <p>记录和追踪您的健身进展，让数据指导您的健身之路</p>
      </div>

      <!-- 数据概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon weight">
            <icon-user />
          </div>
          <div class="card-content">
            <h3>当前体重</h3>
            <div class="value">{{ currentData.weight || '--' }} <span>kg</span></div>
            <div class="change" :class="weightChange.type">
              {{ weightChange.text }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon bodyfat">
            <icon-heart />
          </div>
          <div class="card-content">
            <h3>体脂率</h3>
            <div class="value">{{ currentData.bodyFat || '--' }} <span>%</span></div>
            <div class="change" :class="bodyFatChange.type">
              {{ bodyFatChange.text }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon bmi">
            <icon-dashboard />
          </div>
          <div class="card-content">
            <h3>BMI指数</h3>
            <div class="value">{{ currentData.bmi || '--' }}</div>
            <div class="bmi-status" :class="getBMIStatus(currentData.bmi)">
              {{ getBMIStatusText(currentData.bmi) }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-icon muscle">
            <icon-trophy />
          </div>
          <div class="card-content">
            <h3>肌肉量</h3>
            <div class="value">{{ currentData.muscle || '--' }} <span>kg</span></div>
            <div class="change" :class="muscleChange.type">
              {{ muscleChange.text }}
            </div>
          </div>
        </div>
      </div>

      <!-- 数据图表区域 -->
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3>体重变化趋势</h3>
            <div class="chart-controls">
              <a-radio-group v-model="weightPeriod" @change="updateWeightChart">
                <a-radio value="7d">7天</a-radio>
                <a-radio value="30d">30天</a-radio>
                <a-radio value="90d">90天</a-radio>
                <a-radio value="1y">1年</a-radio>
              </a-radio-group>
            </div>
          </div>
          <div class="chart-container" ref="weightChart"></div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>体脂率变化趋势</h3>
            <div class="chart-controls">
              <a-radio-group v-model="bodyFatPeriod" @change="updateBodyFatChart">
                <a-radio value="7d">7天</a-radio>
                <a-radio value="30d">30天</a-radio>
                <a-radio value="90d">90天</a-radio>
                <a-radio value="1y">1年</a-radio>
              </a-radio-group>
            </div>
          </div>
          <div class="chart-container" ref="bodyFatChart"></div>
        </div>
      </div>

      <!-- 运动记录区域 -->
      <div class="workout-section">
        <div class="section-header">
          <h3><icon-fire />运动记录</h3>
          <a-button type="primary" @click="showWorkoutModal = true">
            <icon-plus />添加运动记录
          </a-button>
        </div>
        
        <div class="workout-stats">
          <div class="stat-card">
            <div class="stat-number">{{ workoutStats.thisWeek }}</div>
            <div class="stat-label">本周运动</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ workoutStats.thisMonth }}</div>
            <div class="stat-label">本月运动</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ workoutStats.totalCalories }}</div>
            <div class="stat-label">总消耗卡路里</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ workoutStats.avgDuration }}</div>
            <div class="stat-label">平均时长(分钟)</div>
          </div>
        </div>
        
        <div class="workout-list">
          <div v-for="workout in recentWorkouts" :key="workout.id" class="workout-item">
            <div class="workout-icon">
              <component :is="getWorkoutIcon(workout.type)" />
            </div>
            <div class="workout-info">
              <h4>{{ workout.name }}</h4>
              <p>{{ workout.duration }}分钟 · 消耗{{ workout.calories }}卡路里</p>
              <span class="workout-date">{{ formatDate(workout.date) }}</span>
            </div>
            <div class="workout-actions">
              <a-button type="text" size="small" @click="editWorkout(workout)">
                <icon-edit />
              </a-button>
              <a-button type="text" size="small" status="danger" @click="deleteWorkout(workout.id)">
                <icon-delete />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加运动记录弹窗 -->
    <a-modal v-model:visible="showWorkoutModal" title="添加运动记录" @ok="saveWorkout">
      <a-form :model="workoutForm" layout="vertical">
        <a-form-item label="运动类型">
          <a-select v-model="workoutForm.type" placeholder="选择运动类型">
            <a-option value="running">跑步</a-option>
            <a-option value="cycling">骑行</a-option>
            <a-option value="swimming">游泳</a-option>
            <a-option value="strength">力量训练</a-option>
            <a-option value="yoga">瑜伽</a-option>
            <a-option value="other">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="运动名称">
          <a-input v-model="workoutForm.name" placeholder="输入运动名称" />
        </a-form-item>
        <a-form-item label="运动时长(分钟)">
          <a-input-number v-model="workoutForm.duration" placeholder="输入运动时长" />
        </a-form-item>
        <a-form-item label="消耗卡路里">
          <a-input-number v-model="workoutForm.calories" placeholder="输入消耗的卡路里" />
        </a-form-item>
        <a-form-item label="运动日期">
          <a-date-picker v-model="workoutForm.date" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="workoutForm.notes" placeholder="添加运动备注" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { 
  IconBarChart, IconUser, IconHeart, IconDashboard, IconTrophy, 
  IconFire, IconPlus, IconEdit, IconDelete 
} from '@arco-design/web-vue/es/icon';

export default {
  name: 'FitnessData',
  components: {
    IconBarChart, IconUser, IconHeart, IconDashboard, IconTrophy, 
    IconFire, IconPlus, IconEdit, IconDelete
  },
  setup() {
    // 响应式数据
    const currentData = ref({
      weight: 70.5,
      bodyFat: 15.2,
      bmi: 22.1,
      muscle: 55.3
    });
    
    const weightChange = ref({ type: 'decrease', text: '↓ 0.5kg 较上周' });
    const bodyFatChange = ref({ type: 'decrease', text: '↓ 0.3% 较上周' });
    const muscleChange = ref({ type: 'increase', text: '↑ 0.2kg 较上周' });
    
    const weightPeriod = ref('30d');
    const bodyFatPeriod = ref('30d');
    
    const workoutStats = ref({
      thisWeek: 5,
      thisMonth: 18,
      totalCalories: 2450,
      avgDuration: 45
    });
    
    const recentWorkouts = ref([
      {
        id: 1,
        type: 'running',
        name: '晨跑',
        duration: 30,
        calories: 300,
        date: new Date(),
        notes: '天气不错，跑得很舒服'
      },
      {
        id: 2,
        type: 'strength',
        name: '力量训练',
        duration: 60,
        calories: 400,
        date: new Date(Date.now() - 86400000),
        notes: '胸肌和三头肌训练'
      }
    ]);
    
    const showWorkoutModal = ref(false);
    const workoutForm = reactive({
      type: '',
      name: '',
      duration: null,
      calories: null,
      date: new Date(),
      notes: ''
    });

    // 方法
    const getBMIStatus = (bmi) => {
      if (!bmi) return '';
      if (bmi < 18.5) return 'underweight';
      if (bmi < 24) return 'normal';
      if (bmi < 28) return 'overweight';
      return 'obese';
    };

    const getBMIStatusText = (bmi) => {
      if (!bmi) return '--';
      if (bmi < 18.5) return '偏瘦';
      if (bmi < 24) return '正常';
      if (bmi < 28) return '偏胖';
      return '肥胖';
    };

    const getWorkoutIcon = (type) => {
      const iconMap = {
        running: 'icon-fire',
        cycling: 'icon-dashboard',
        swimming: 'icon-heart',
        strength: 'icon-trophy',
        yoga: 'icon-user',
        other: 'icon-bar-chart'
      };
      return iconMap[type] || 'icon-bar-chart';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN');
    };

    const updateWeightChart = () => {
      // 这里应该根据选择的时间段更新图表数据
      console.log('更新体重图表:', weightPeriod.value);
    };

    const updateBodyFatChart = () => {
      // 这里应该根据选择的时间段更新图表数据
      console.log('更新体脂率图表:', bodyFatPeriod.value);
    };

    const saveWorkout = () => {
      const newWorkout = {
        id: Date.now(),
        ...workoutForm
      };
      recentWorkouts.value.unshift(newWorkout);
      showWorkoutModal.value = false;
      
      // 重置表单
      Object.keys(workoutForm).forEach(key => {
        if (key === 'date') {
          workoutForm[key] = new Date();
        } else if (typeof workoutForm[key] === 'number') {
          workoutForm[key] = null;
        } else {
          workoutForm[key] = '';
        }
      });
    };

    const editWorkout = (workout) => {
      Object.assign(workoutForm, workout);
      showWorkoutModal.value = true;
    };

    const deleteWorkout = (workoutId) => {
      const index = recentWorkouts.value.findIndex(w => w.id === workoutId);
      if (index > -1) {
        recentWorkouts.value.splice(index, 1);
      }
    };

    return {
      currentData,
      weightChange,
      bodyFatChange,
      muscleChange,
      weightPeriod,
      bodyFatPeriod,
      workoutStats,
      recentWorkouts,
      showWorkoutModal,
      workoutForm,
      getBMIStatus,
      getBMIStatusText,
      getWorkoutIcon,
      formatDate,
      updateWeightChart,
      updateBodyFatChart,
      saveWorkout,
      editWorkout,
      deleteWorkout
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-data {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.data-container {
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

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

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

    &.bmi {
      background: linear-gradient(45deg, #00b42a, #52c41a);
    }

    &.muscle {
      background: linear-gradient(45deg, #ff7d00, #ffa940);
    }
  }

  .card-content {
    h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;

      span {
        font-size: 16px;
        color: #666;
        font-weight: 400;
      }
    }

    .change {
      font-size: 12px;
      font-weight: 500;

      &.increase {
        color: #00b42a;
      }

      &.decrease {
        color: #f53f3f;
      }
    }

    .bmi-status {
      font-size: 12px;
      font-weight: 500;

      &.normal {
        color: #00b42a;
      }

      &.underweight {
        color: #ff7d00;
      }

      &.overweight {
        color: #f53f3f;
      }

      &.obese {
        color: #d32f2f;
      }
    }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .chart-container {
    height: 300px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 14px;
  }
}

.workout-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(svg) {
        color: #ff7d00;
      }
    }
  }

  .workout-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;

      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #4080ff;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
      }
    }
  }

  .workout-list {
    .workout-item {
      display: flex;
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

      .workout-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: linear-gradient(45deg, #ff7d00, #ffa940);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        :deep(svg) {
          width: 20px;
          height: 20px;
          color: white;
        }
      }

      .workout-info {
        flex: 1;

        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        p {
          margin: 0 0 4px 0;
          color: #666;
          font-size: 14px;
        }

        .workout-date {
          font-size: 12px;
          color: #999;
        }
      }

      .workout-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .workout-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }

  .workout-stats {
    grid-template-columns: 1fr;
  }

  .workout-item {
    flex-direction: column;
    align-items: flex-start;

    .workout-icon {
      margin-right: 0;
      margin-bottom: 12px;
    }

    .workout-actions {
      margin-top: 12px;
      align-self: flex-end;
    }
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>
