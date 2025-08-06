<template>
  <div class="fitness-plans">
    <div class="plans-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1><icon-calendar />个性化健身计划</h1>
        <p>AI为您量身定制的专业健身计划，科学训练，高效达成目标</p>
      </div>

      <!-- 快速开始区域 -->
      <div class="quick-start-section">
        <div class="quick-start-card">
          <div class="card-header">
            <h3><icon-robot />AI智能推荐</h3>
            <p>基于您的身体数据和健身目标，AI为您推荐最适合的训练计划</p>
          </div>
          <div class="recommendation-form">
            <a-form :model="recommendForm" layout="inline">
              <a-form-item label="健身目标">
                <a-select v-model="recommendForm.goal" placeholder="选择目标" style="width: 150px">
                  <a-option value="weight_loss">减脂</a-option>
                  <a-option value="muscle_gain">增肌</a-option>
                  <a-option value="endurance">提升耐力</a-option>
                  <a-option value="strength">增强力量</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="训练频率">
                <a-select v-model="recommendForm.frequency" placeholder="选择频率" style="width: 120px">
                  <a-option value="3">每周3次</a-option>
                  <a-option value="4">每周4次</a-option>
                  <a-option value="5">每周5次</a-option>
                  <a-option value="6">每周6次</a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="训练时长">
                <a-select v-model="recommendForm.duration" placeholder="选择时长" style="width: 120px">
                  <a-option value="30">30分钟</a-option>
                  <a-option value="45">45分钟</a-option>
                  <a-option value="60">60分钟</a-option>
                  <a-option value="90">90分钟</a-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="generateAIPlan" :loading="isGenerating">
                  <icon-star />生成计划
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>

      <!-- 我的计划列表 -->
      <div class="my-plans-section">
        <div class="section-header">
          <h3><icon-folder />我的训练计划</h3>
          <a-button type="primary" @click="showCreateModal = true">
            <icon-plus />创建新计划
          </a-button>
        </div>
        
        <div class="plans-grid">
          <div v-for="plan in myPlans" :key="plan.id" class="plan-card">
            <div class="plan-header">
              <div class="plan-type" :class="plan.type">
                <component :is="getPlanIcon(plan.type)" />
              </div>
              <div class="plan-info">
                <h4>{{ plan.name }}</h4>
                <p>{{ plan.description }}</p>
                <div class="plan-meta">
                  <span><icon-clock-circle />{{ plan.duration }}分钟</span>
                  <span><icon-calendar />{{ plan.frequency }}</span>
                  <span><icon-fire />{{ plan.difficulty }}</span>
                </div>
              </div>
              <div class="plan-actions">
                <a-dropdown>
                  <a-button type="text" size="small">
                    <icon-more />
                  </a-button>
                  <template #content>
                    <a-doption @click="startPlan(plan)">开始训练</a-doption>
                    <a-doption @click="editPlan(plan)">编辑计划</a-doption>
                    <a-doption @click="duplicatePlan(plan)">复制计划</a-doption>
                    <a-doption @click="deletePlan(plan.id)" class="danger">删除计划</a-doption>
                  </template>
                </a-dropdown>
              </div>
            </div>
            
            <div class="plan-progress">
              <div class="progress-info">
                <span>完成进度</span>
                <span>{{ plan.completedSessions }}/{{ plan.totalSessions }}</span>
              </div>
              <a-progress 
                :percent="(plan.completedSessions / plan.totalSessions * 100)" 
                :color="getProgressColor(plan.completedSessions / plan.totalSessions * 100)"
                size="small"
              />
            </div>
            
            <div class="plan-footer">
              <a-button type="primary" @click="startPlan(plan)" :disabled="plan.status === 'completed'">
                {{ plan.status === 'completed' ? '已完成' : '开始训练' }}
              </a-button>
              <a-button type="outline" @click="viewPlanDetails(plan)">
                查看详情
              </a-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="myPlans.length === 0" class="empty-plans">
            <icon-folder />
            <h4>还没有训练计划</h4>
            <p>创建您的第一个个性化训练计划，开始健身之旅</p>
            <a-button type="primary" @click="showCreateModal = true">创建计划</a-button>
          </div>
        </div>
      </div>

      <!-- 推荐计划模板 -->
      <div class="templates-section">
        <div class="section-header">
          <h3><icon-star />热门计划模板</h3>
          <p>专业教练设计的经典训练计划，适合不同水平的健身者</p>
        </div>
        
        <div class="templates-grid">
          <div v-for="template in planTemplates" :key="template.id" class="template-card">
            <div class="template-image">
              <img :src="template.image" :alt="template.name" />
              <div class="template-overlay">
                <div class="template-difficulty" :class="template.difficulty.toLowerCase()">
                  {{ template.difficulty }}
                </div>
              </div>
            </div>
            <div class="template-content">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-stats">
                <span><icon-clock-circle />{{ template.duration }}分钟</span>
                <span><icon-user />{{ template.targetAudience }}</span>
                <span><icon-fire />{{ template.caloriesBurn }}卡路里</span>
              </div>
              <div class="template-actions">
                <a-button type="primary" @click="useTemplate(template)">
                  使用模板
                </a-button>
                <a-button type="outline" @click="previewTemplate(template)">
                  预览
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建计划弹窗 -->
    <a-modal v-model:visible="showCreateModal" title="创建训练计划" width="600px" @ok="createPlan">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="计划名称">
          <a-input v-model="createForm.name" placeholder="输入计划名称" />
        </a-form-item>
        <a-form-item label="计划描述">
          <a-textarea v-model="createForm.description" placeholder="描述您的训练计划" />
        </a-form-item>
        <a-form-item label="训练目标">
          <a-select v-model="createForm.goal" placeholder="选择训练目标">
            <a-option value="weight_loss">减脂塑形</a-option>
            <a-option value="muscle_gain">增肌增重</a-option>
            <a-option value="endurance">提升耐力</a-option>
            <a-option value="strength">增强力量</a-option>
            <a-option value="flexibility">提升柔韧性</a-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="训练频率">
              <a-select v-model="createForm.frequency" placeholder="每周次数">
                <a-option value="3次/周">3次/周</a-option>
                <a-option value="4次/周">4次/周</a-option>
                <a-option value="5次/周">5次/周</a-option>
                <a-option value="6次/周">6次/周</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="单次时长">
              <a-select v-model="createForm.duration" placeholder="分钟">
                <a-option value="30">30分钟</a-option>
                <a-option value="45">45分钟</a-option>
                <a-option value="60">60分钟</a-option>
                <a-option value="90">90分钟</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="难度等级">
          <a-radio-group v-model="createForm.difficulty">
            <a-radio value="初级">初级</a-radio>
            <a-radio value="中级">中级</a-radio>
            <a-radio value="高级">高级</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="计划周期">
          <a-input-number v-model="createForm.weeks" placeholder="周数" :min="1" :max="52" />
          <span style="margin-left: 8px;">周</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import {
  IconCalendar, IconRobot, IconFolder, IconPlus, IconClockCircle,
  IconFire, IconMore, IconStar, IconUser
} from '@arco-design/web-vue/es/icon';

export default {
  name: 'FitnessPlans',
  components: {
    IconCalendar, IconRobot, IconFolder, IconPlus, IconClockCircle,
    IconFire, IconMore, IconStar, IconUser
  },
  setup() {
    // 响应式数据
    const isGenerating = ref(false);
    const showCreateModal = ref(false);
    
    const recommendForm = reactive({
      goal: '',
      frequency: '',
      duration: ''
    });
    
    const createForm = reactive({
      name: '',
      description: '',
      goal: '',
      frequency: '',
      duration: '',
      difficulty: '初级',
      weeks: 4
    });
    
    const myPlans = ref([
      {
        id: 1,
        name: '新手入门计划',
        description: '适合健身初学者的基础训练计划',
        type: 'beginner',
        duration: 45,
        frequency: '3次/周',
        difficulty: '初级',
        completedSessions: 8,
        totalSessions: 12,
        status: 'active'
      },
      {
        id: 2,
        name: '减脂塑形计划',
        description: '高效燃脂，塑造完美身材',
        type: 'weight_loss',
        duration: 60,
        frequency: '4次/周',
        difficulty: '中级',
        completedSessions: 16,
        totalSessions: 16,
        status: 'completed'
      }
    ]);
    
    const planTemplates = ref([
      {
        id: 1,
        name: '7分钟科学健身',
        description: '高强度间歇训练，短时间高效燃脂',
        image: '/images/template-hiit.jpg',
        duration: 7,
        difficulty: '中级',
        targetAudience: '所有人群',
        caloriesBurn: 50
      },
      {
        id: 2,
        name: '力量训练基础',
        description: '系统的力量训练，增强肌肉力量',
        image: '/images/template-strength.jpg',
        duration: 60,
        difficulty: '初级',
        targetAudience: '健身新手',
        caloriesBurn: 300
      }
    ]);

    // 方法
    const getPlanIcon = (type) => {
      const iconMap = {
        beginner: 'icon-user',
        weight_loss: 'icon-fire',
        muscle_gain: 'icon-trophy',
        endurance: 'icon-clock-circle',
        strength: 'icon-star'
      };
      return iconMap[type] || 'icon-calendar';
    };

    const getProgressColor = (progress) => {
      if (progress >= 80) return '#00b42a';
      if (progress >= 50) return '#ff7d00';
      return '#f53f3f';
    };

    const generateAIPlan = async () => {
      if (!recommendForm.goal || !recommendForm.frequency || !recommendForm.duration) {
        return;
      }
      
      isGenerating.value = true;
      
      try {
        // 这里应该调用AI接口生成计划
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newPlan = {
          id: Date.now(),
          name: `AI定制${getGoalText(recommendForm.goal)}计划`,
          description: `基于您的需求定制的${recommendForm.duration}分钟训练计划`,
          type: recommendForm.goal,
          duration: parseInt(recommendForm.duration),
          frequency: `${recommendForm.frequency}次/周`,
          difficulty: '中级',
          completedSessions: 0,
          totalSessions: parseInt(recommendForm.frequency) * 4,
          status: 'active'
        };
        
        myPlans.value.unshift(newPlan);
      } catch (error) {
        console.error('生成计划失败:', error);
      } finally {
        isGenerating.value = false;
      }
    };

    const getGoalText = (goal) => {
      const goalMap = {
        weight_loss: '减脂',
        muscle_gain: '增肌',
        endurance: '耐力',
        strength: '力量'
      };
      return goalMap[goal] || '健身';
    };

    const createPlan = () => {
      const newPlan = {
        id: Date.now(),
        ...createForm,
        completedSessions: 0,
        totalSessions: parseInt(createForm.frequency.charAt(0)) * createForm.weeks,
        status: 'active',
        type: createForm.goal
      };
      
      myPlans.value.unshift(newPlan);
      showCreateModal.value = false;
      
      // 重置表单
      Object.keys(createForm).forEach(key => {
        if (key === 'difficulty') {
          createForm[key] = '初级';
        } else if (key === 'weeks') {
          createForm[key] = 4;
        } else {
          createForm[key] = '';
        }
      });
    };

    const startPlan = (plan) => {
      console.log('开始训练计划:', plan.name);
      // 这里应该跳转到训练界面
    };

    const editPlan = (plan) => {
      Object.assign(createForm, plan);
      showCreateModal.value = true;
    };

    const duplicatePlan = (plan) => {
      const newPlan = {
        ...plan,
        id: Date.now(),
        name: `${plan.name} (副本)`,
        completedSessions: 0,
        status: 'active'
      };
      myPlans.value.unshift(newPlan);
    };

    const deletePlan = (planId) => {
      const index = myPlans.value.findIndex(p => p.id === planId);
      if (index > -1) {
        myPlans.value.splice(index, 1);
      }
    };

    const viewPlanDetails = (plan) => {
      console.log('查看计划详情:', plan.name);
      // 这里应该跳转到计划详情页面
    };

    const useTemplate = (template) => {
      const newPlan = {
        id: Date.now(),
        name: template.name,
        description: template.description,
        type: 'template',
        duration: template.duration,
        frequency: '3次/周',
        difficulty: template.difficulty,
        completedSessions: 0,
        totalSessions: 12,
        status: 'active'
      };
      
      myPlans.value.unshift(newPlan);
    };

    const previewTemplate = (template) => {
      console.log('预览模板:', template.name);
      // 这里应该显示模板预览
    };

    return {
      isGenerating,
      showCreateModal,
      recommendForm,
      createForm,
      myPlans,
      planTemplates,
      getPlanIcon,
      getProgressColor,
      generateAIPlan,
      createPlan,
      startPlan,
      editPlan,
      duplicatePlan,
      deletePlan,
      viewPlanDetails,
      useTemplate,
      previewTemplate
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-plans {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.plans-container {
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

.quick-start-section {
  margin-bottom: 32px;

  .quick-start-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .card-header {
      text-align: center;
      margin-bottom: 24px;

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        :deep(svg) {
          color: #4080ff;
        }
      }

      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }

    .recommendation-form {
      display: flex;
      justify-content: center;

      :deep(.arco-form) {
        align-items: center;
      }
    }
  }
}

.my-plans-section, .templates-section {
  margin-bottom: 32px;

  .section-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(svg) {
        color: #ffd700;
      }
    }

    p {
      margin: 4px 0 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }
}

.plans-grid, .templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .plan-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;

    .plan-type {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      :deep(svg) {
        width: 24px;
        height: 24px;
        color: white;
      }

      &.beginner {
        background: linear-gradient(45deg, #00b42a, #52c41a);
      }

      &.weight_loss {
        background: linear-gradient(45deg, #f53f3f, #ff7875);
      }

      &.muscle_gain {
        background: linear-gradient(45deg, #ff7d00, #ffa940);
      }

      &.endurance {
        background: linear-gradient(45deg, #4080ff, #40a9ff);
      }

      &.strength {
        background: linear-gradient(45deg, #722ed1, #9254de);
      }
    }

    .plan-info {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0 0 8px 0;
        color: #666;
        font-size: 14px;
      }

      .plan-meta {
        display: flex;
        gap: 12px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;

          :deep(svg) {
            width: 12px;
            height: 12px;
          }
        }
      }
    }

    .plan-actions {
      :deep(.arco-dropdown-option.danger) {
        color: #f53f3f;
      }
    }
  }

  .plan-progress {
    margin-bottom: 16px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
  }

  .plan-footer {
    display: flex;
    gap: 12px;

    .arco-btn {
      flex: 1;
    }
  }
}

.empty-plans {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  :deep(svg) {
    font-size: 64px;
    color: #d9d9d9;
    margin-bottom: 16px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
  }
}

.template-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .template-image {
    position: relative;
    height: 200px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .template-overlay {
      position: absolute;
      top: 12px;
      right: 12px;

      .template-difficulty {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        color: white;

        &.初级 {
          background: rgba(0, 180, 42, 0.8);
        }

        &.中级 {
          background: rgba(255, 125, 0, 0.8);
        }

        &.高级 {
          background: rgba(245, 63, 63, 0.8);
        }
      }
    }
  }

  .template-content {
    padding: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .template-stats {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #999;

        :deep(svg) {
          width: 12px;
          height: 12px;
        }
      }
    }

    .template-actions {
      display: flex;
      gap: 8px;

      .arco-btn {
        flex: 1;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .plans-grid, .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .plans-grid, .templates-grid {
    grid-template-columns: 1fr;
  }

  .quick-start-card .recommendation-form {
    :deep(.arco-form) {
      flex-direction: column;
      align-items: stretch;

      .arco-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>
