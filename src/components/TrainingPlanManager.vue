<template>
  <div class="training-plan-manager">
    <div class="manager-header">
      <h3><icon-calendar />训练计划管理</h3>
      <a-button type="primary" @click="showModal = true">
        <icon-plus />创建训练计划
      </a-button>
    </div>

    <!-- 默认计划推荐 -->
    <div class="default-plans-section" v-if="defaultPlans.length > 0">
      <h4>推荐训练计划</h4>
      <div class="plans-grid">
        <div 
          v-for="plan in defaultPlans" 
          :key="plan.id" 
          class="plan-card default-plan"
          @click="viewPlanDetails(plan)"
        >
          <div class="plan-header">
            <h5>{{ plan.planName }}</h5>
            <a-tag :color="getPlanTypeColor(plan.planType)">{{ plan.planType }}</a-tag>
          </div>
          <div class="plan-content">
            <p>{{ plan.description || '专业设计的训练方案，适合不同健身水平' }}</p>
            <div class="plan-meta">
              <span><icon-clock-circle /> {{ plan.duration || '4-6周' }}</span>
              <span><icon-fire /> {{ plan.difficulty || '中等强度' }}</span>
            </div>
          </div>
          <div class="plan-actions">
            <a-button type="primary" size="small" @click.stop="adoptPlan(plan)">
              采用此计划
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的训练计划 -->
    <div class="my-plans-section">
      <div class="section-header">
        <h4>我的训练计划</h4>
        <a-space>
          <a-select v-model="filterType" placeholder="筛选计划类型" style="width: 150px" @change="loadMyPlans">
            <a-option value="">全部类型</a-option>
            <a-option value="增肌">增肌</a-option>
            <a-option value="减脂">减脂</a-option>
            <a-option value="塑形">塑形</a-option>
            <a-option value="力量">力量</a-option>
            <a-option value="耐力">耐力</a-option>
          </a-select>
        </a-space>
      </div>

      <div class="plans-grid">
        <div 
          v-for="plan in myPlans" 
          :key="plan.id" 
          class="plan-card my-plan"
        >
          <div class="plan-header">
            <h5>{{ plan.planName }}</h5>
            <a-tag :color="getPlanTypeColor(plan.planType)">{{ plan.planType }}</a-tag>
          </div>
          <div class="plan-content">
            <div class="plan-dates">
              <span><icon-calendar /> {{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}</span>
            </div>
            <div class="plan-progress">
              <span>进度: {{ calculateProgress(plan) }}%</span>
              <a-progress :percent="calculateProgress(plan)" size="small" />
            </div>
          </div>
          <div class="plan-actions">
            <a-space>
              <a-button type="text" size="small" @click="viewPlanDetails(plan)">
                <icon-eye />查看
              </a-button>
              <a-button type="text" size="small" @click="editPlan(plan)">
                <icon-edit />编辑
              </a-button>
              <a-popconfirm content="确定要删除这个训练计划吗？" @ok="deletePlan(plan.id)">
                <a-button type="text" size="small" status="danger">
                  <icon-delete />删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>
        </div>
      </div>

      <div v-if="myPlans.length === 0 && !loading" class="empty-state">
        <a-empty description="暂无训练计划">
          <a-button type="primary" @click="showModal = true">创建第一个计划</a-button>
        </a-empty>
      </div>
    </div>

    <!-- 创建/编辑训练计划弹窗 -->
    <a-modal 
      v-model:visible="showModal" 
      :title="editingId ? '编辑训练计划' : '创建训练计划'" 
      width="800px"
      @ok="savePlan"
      @cancel="resetForm"
    >
      <a-form :model="form" layout="vertical" ref="formRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计划名称" field="planName" :rules="[{required: true, message: '请输入计划名称'}]">
              <a-input v-model="form.planName" placeholder="输入训练计划名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计划类型" field="planType" :rules="[{required: true, message: '请选择计划类型'}]">
              <a-select v-model="form.planType" placeholder="选择计划类型">
                <a-option value="增肌">增肌</a-option>
                <a-option value="减脂">减脂</a-option>
                <a-option value="塑形">塑形</a-option>
                <a-option value="力量">力量</a-option>
                <a-option value="耐力">耐力</a-option>
                <a-option value="综合">综合</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始日期" field="startDate" :rules="[{required: true, message: '请选择开始日期'}]">
              <a-date-picker v-model="form.startDate" style="width: 100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束日期" field="endDate" :rules="[{required: true, message: '请选择结束日期'}]">
              <a-date-picker v-model="form.endDate" style="width: 100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="计划详情" field="planDetails">
          <a-textarea 
            v-model="form.planDetails" 
            placeholder="详细描述训练计划内容、目标、注意事项等"
            :rows="6"
            :max-length="1000"
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 计划详情弹窗 -->
    <a-modal 
      v-model:visible="showDetailModal" 
      title="训练计划详情" 
      width="600px"
      :footer="false"
    >
      <div v-if="selectedPlan" class="plan-detail">
        <div class="detail-header">
          <h3>{{ selectedPlan.planName }}</h3>
          <a-tag :color="getPlanTypeColor(selectedPlan.planType)">{{ selectedPlan.planType }}</a-tag>
        </div>
        
        <div class="detail-content">
          <div class="detail-item">
            <label>计划周期：</label>
            <span>{{ formatDate(selectedPlan.startDate) }} - {{ formatDate(selectedPlan.endDate) }}</span>
          </div>
          
          <div class="detail-item">
            <label>计划详情：</label>
            <div class="plan-details-content">
              {{ selectedPlan.planDetails || '暂无详细描述' }}
            </div>
          </div>
          
          <div v-if="!selectedPlan.isDefault" class="detail-item">
            <label>创建时间：</label>
            <span>{{ formatDate(selectedPlan.createTime) }}</span>
          </div>
        </div>
        
        <div class="detail-actions">
          <a-space>
            <a-button v-if="selectedPlan.isDefault" type="primary" @click="adoptPlan(selectedPlan)">
              采用此计划
            </a-button>
            <a-button v-else @click="editPlan(selectedPlan)">
              编辑计划
            </a-button>
            <a-button @click="showDetailModal = false">关闭</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconCalendar, IconPlus, IconClockCircle, IconFire, IconEye,
  IconEdit, IconDelete 
} from '@arco-design/web-vue/es/icon';
import ApiService from '@/services/api';

export default {
  name: 'TrainingPlanManager',
  components: {
    IconCalendar, IconPlus, IconClockCircle, IconFire, IconEye,
    IconEdit, IconDelete
  },
  setup() {
    const loading = ref(false);
    const showModal = ref(false);
    const showDetailModal = ref(false);
    const editingId = ref(null);
    const filterType = ref('');
    
    const defaultPlans = ref([]);
    const myPlans = ref([]);
    const selectedPlan = ref(null);
    
    const form = reactive({
      planName: '',
      planType: '',
      planDetails: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isDefault: 0
    });

    // 加载默认训练计划
    const loadDefaultPlans = async () => {
      try {
        const response = await ApiService.getDefaultTrainingPlans();
        if (response.code === 0) {
          defaultPlans.value = response.data || [];
        }
      } catch (error) {
        console.error('加载默认计划失败:', error);
      }
    };

    // 加载我的训练计划
    const loadMyPlans = async () => {
      try {
        loading.value = true;
        const params = {
          current: 1,
          pageSize: 20,
          planType: filterType.value || undefined
        };

        const response = await ApiService.getMyTrainingPlanByPage(params);
        if (response.code === 0) {
          myPlans.value = response.data.records || [];
        }
      } catch (error) {
        console.error('加载我的计划失败:', error);
        Message.error('加载训练计划失败');
      } finally {
        loading.value = false;
      }
    };

    // 保存训练计划
    const savePlan = async () => {
      try {
        const planData = {
          planName: form.planName,
          planType: form.planType,
          planDetails: form.planDetails,
          startDate: form.startDate,
          endDate: form.endDate,
          isDefault: form.isDefault
        };

        let response;
        if (editingId.value) {
          planData.id = editingId.value;
          response = await ApiService.updateTrainingPlan(planData);
        } else {
          response = await ApiService.addTrainingPlan(planData);
        }

        if (response.code === 0) {
          Message.success(editingId.value ? '训练计划更新成功' : '训练计划创建成功');
          showModal.value = false;
          resetForm();
          await loadMyPlans();
        } else {
          Message.error(response.message || '保存失败');
        }
      } catch (error) {
        console.error('保存训练计划失败:', error);
        Message.error('保存训练计划失败');
      }
    };

    // 编辑训练计划
    const editPlan = (plan) => {
      editingId.value = plan.id;
      Object.assign(form, {
        planName: plan.planName,
        planType: plan.planType,
        planDetails: plan.planDetails,
        startDate: plan.startDate,
        endDate: plan.endDate,
        isDefault: plan.isDefault || 0
      });
      showModal.value = true;
      showDetailModal.value = false;
    };

    // 删除训练计划
    const deletePlan = async (id) => {
      try {
        const response = await ApiService.deleteTrainingPlan(id);
        if (response.code === 0) {
          Message.success('训练计划删除成功');
          await loadMyPlans();
        } else {
          Message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除训练计划失败:', error);
        Message.error('删除训练计划失败');
      }
    };

    // 采用默认计划
    const adoptPlan = async (plan) => {
      try {
        const planData = {
          planName: `${plan.planName}(我的)`,
          planType: plan.planType,
          planDetails: plan.planDetails,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30天后
          isDefault: 0
        };

        const response = await ApiService.addTrainingPlan(planData);
        if (response.code === 0) {
          Message.success('训练计划采用成功');
          showDetailModal.value = false;
          await loadMyPlans();
        } else {
          Message.error(response.message || '采用失败');
        }
      } catch (error) {
        console.error('采用训练计划失败:', error);
        Message.error('采用训练计划失败');
      }
    };

    // 查看计划详情
    const viewPlanDetails = (plan) => {
      selectedPlan.value = plan;
      showDetailModal.value = true;
    };

    // 重置表单
    const resetForm = () => {
      editingId.value = null;
      Object.assign(form, {
        planName: '',
        planType: '',
        planDetails: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isDefault: 0
      });
    };

    // 工具方法
    const getPlanTypeColor = (type) => {
      const colorMap = {
        '增肌': 'red',
        '减脂': 'orange',
        '塑形': 'green',
        '力量': 'blue',
        '耐力': 'purple',
        '综合': 'cyan'
      };
      return colorMap[type] || 'gray';
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    const calculateProgress = (plan) => {
      if (!plan.startDate || !plan.endDate) return 0;

      const start = new Date(plan.startDate).getTime();
      const end = new Date(plan.endDate).getTime();
      const now = Date.now();

      if (now < start) return 0;
      if (now > end) return 100;

      return Math.round(((now - start) / (end - start)) * 100);
    };

    // 页面初始化
    onMounted(async () => {
      await Promise.all([loadDefaultPlans(), loadMyPlans()]);
    });

    return {
      loading,
      showModal,
      showDetailModal,
      editingId,
      filterType,
      defaultPlans,
      myPlans,
      selectedPlan,
      form,
      loadDefaultPlans,
      loadMyPlans,
      savePlan,
      editPlan,
      deletePlan,
      adoptPlan,
      viewPlanDetails,
      resetForm,
      getPlanTypeColor,
      formatDate,
      calculateProgress
    };
  }
};
</script>

<style lang="scss" scoped>
.training-plan-manager {
  .manager-header {
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
    }
  }

  .default-plans-section,
  .my-plans-section {
    margin-bottom: 32px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;

    .plan-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      &.default-plan {
        border-left: 4px solid #4080ff;
      }

      &.my-plan {
        border-left: 4px solid #00b42a;
      }

      .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .plan-content {
        margin-bottom: 16px;

        p {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .plan-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #999;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .plan-dates {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .plan-progress {
          font-size: 12px;
          color: #666;

          span {
            margin-bottom: 4px;
            display: block;
          }
        }
      }

      .plan-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px;
  }

  .plan-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .detail-content {
      .detail-item {
        margin-bottom: 16px;

        label {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          display: block;
        }

        .plan-details-content {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          white-space: pre-wrap;
          line-height: 1.6;
        }
      }
    }

    .detail-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      text-align: right;
    }
  }
}
</style>
