<template>
  <div class="fitness-goal-manager">
    <div class="manager-header">
      <h3><icon-trophy />健身目标管理</h3>
      <a-button type="primary" @click="showModal = true">
        <icon-plus />设定新目标
      </a-button>
    </div>

    <!-- 活跃目标展示 -->
    <div class="active-goals-section" v-if="activeGoals.length > 0">
      <h4>进行中的目标</h4>
      <div class="goals-grid">
        <div 
          v-for="goal in activeGoals" 
          :key="goal.id" 
          class="goal-card active-goal"
        >
          <div class="goal-header">
            <h5>{{ goal.goalType }}</h5>
            <a-tag :color="getGoalStatusColor(goal.isAchieved)">
              {{ goal.isAchieved ? '已完成' : '进行中' }}
            </a-tag>
          </div>
          
          <div class="goal-content">
            <div class="goal-target">
              <span class="label">目标值：</span>
              <span class="value">{{ goal.targetValue }}</span>
            </div>
            
            <div class="goal-progress">
              <span class="label">当前进度：</span>
              <div class="progress-info">
                <span class="current">{{ getCurrentProgress(goal) }}</span>
                <a-progress 
                  :percent="getProgressPercent(goal)" 
                  :color="getProgressColor(goal)"
                  size="small" 
                />
              </div>
            </div>
            
            <div class="goal-dates">
              <span><icon-calendar /> {{ formatDate(goal.startDate) }} - {{ formatDate(goal.endDate) }}</span>
            </div>
          </div>
          
          <div class="goal-actions">
            <a-space>
              <a-button type="text" size="small" @click="updateProgress(goal)">
                <icon-edit />更新进度
              </a-button>
              <a-button type="text" size="small" @click="viewGoalDetails(goal)">
                <icon-eye />查看详情
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </div>

    <!-- 所有目标列表 -->
    <div class="all-goals-section">
      <div class="section-header">
        <h4>所有目标</h4>
        <a-space>
          <a-select v-model="filterType" placeholder="筛选目标类型" style="width: 150px" @change="loadGoals">
            <a-option value="">全部类型</a-option>
            <a-option value="减重">减重</a-option>
            <a-option value="增重">增重</a-option>
            <a-option value="体脂率">体脂率</a-option>
            <a-option value="肌肉量">肌肉量</a-option>
            <a-option value="运动频次">运动频次</a-option>
          </a-select>
          <a-select v-model="filterStatus" placeholder="筛选状态" style="width: 120px" @change="loadGoals">
            <a-option value="">全部状态</a-option>
            <a-option :value="0">进行中</a-option>
            <a-option :value="1">已完成</a-option>
          </a-select>
        </a-space>
      </div>

      <a-table 
        :columns="columns" 
        :data="goals" 
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #goalType="{ record }">
          <a-tag :color="getGoalTypeColor(record.goalType)">
            {{ record.goalType }}
          </a-tag>
        </template>
        
        <template #targetValue="{ record }">
          {{ record.targetValue }}
        </template>
        
        <template #progress="{ record }">
          <div class="table-progress">
            <span>{{ getProgressPercent(record) }}%</span>
            <a-progress :percent="getProgressPercent(record)" size="small" />
          </div>
        </template>
        
        <template #isAchieved="{ record }">
          <a-tag :color="getGoalStatusColor(record.isAchieved)">
            {{ record.isAchieved ? '已完成' : '进行中' }}
          </a-tag>
        </template>
        
        <template #dateRange="{ record }">
          {{ formatDate(record.startDate) }} - {{ formatDate(record.endDate) }}
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="updateProgress(record)">
              <icon-edit />更新
            </a-button>
            <a-button type="text" size="small" @click="viewGoalDetails(record)">
              <icon-eye />详情
            </a-button>
            <a-popconfirm content="确定要删除这个目标吗？" @ok="deleteGoal(record.id)">
              <a-button type="text" size="small" status="danger">
                <icon-delete />删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 创建目标弹窗 -->
    <a-modal 
      v-model:visible="showModal" 
      title="设定健身目标" 
      @ok="saveGoal"
      @cancel="resetForm"
    >
      <a-form :model="form" layout="vertical" ref="formRef">
        <a-form-item label="目标类型" field="goalType" :rules="[{required: true, message: '请选择目标类型'}]">
          <a-select v-model="form.goalType" placeholder="选择目标类型">
            <a-option value="减重">减重</a-option>
            <a-option value="增重">增重</a-option>
            <a-option value="体脂率">体脂率</a-option>
            <a-option value="肌肉量">肌肉量</a-option>
            <a-option value="运动频次">运动频次</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="目标值" field="targetValue" :rules="[{required: true, message: '请输入目标值'}]">
          <a-input v-model="form.targetValue" placeholder="例如：减重5kg、体脂率降至15%等" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始日期" field="startDate" :rules="[{required: true, message: '请选择开始日期'}]">
              <a-date-picker v-model="form.startDate" style="width: 100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标日期" field="endDate" :rules="[{required: true, message: '请选择目标日期'}]">
              <a-date-picker v-model="form.endDate" style="width: 100%" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 更新进度弹窗 -->
    <a-modal 
      v-model:visible="showProgressModal" 
      title="更新目标进度" 
      @ok="saveProgress"
      @cancel="resetProgressForm"
    >
      <div v-if="selectedGoal" class="progress-update">
        <div class="goal-info">
          <h4>{{ selectedGoal.goalType }}</h4>
          <p>目标值：{{ selectedGoal.targetValue }}</p>
        </div>
        
        <a-form :model="progressForm" layout="vertical">
          <a-form-item label="当前进度">
            <a-input v-model="progressForm.currentValue" placeholder="输入当前进度值" />
          </a-form-item>
          <a-form-item label="进度说明">
            <a-textarea v-model="progressForm.note" placeholder="记录进度变化、心得体会等" :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 目标详情弹窗 -->
    <a-modal 
      v-model:visible="showDetailModal" 
      title="目标详情" 
      width="600px"
      :footer="false"
    >
      <div v-if="selectedGoal" class="goal-detail">
        <div class="detail-header">
          <h3>{{ selectedGoal.goalType }}</h3>
          <a-tag :color="getGoalStatusColor(selectedGoal.isAchieved)">
            {{ selectedGoal.isAchieved ? '已完成' : '进行中' }}
          </a-tag>
        </div>
        
        <div class="detail-content">
          <div class="detail-item">
            <label>目标值：</label>
            <span>{{ selectedGoal.targetValue }}</span>
          </div>
          
          <div class="detail-item">
            <label>目标周期：</label>
            <span>{{ formatDate(selectedGoal.startDate) }} - {{ formatDate(selectedGoal.endDate) }}</span>
          </div>
          
          <div class="detail-item">
            <label>当前进度：</label>
            <div class="progress-detail">
              <span>{{ getCurrentProgress(selectedGoal) }} ({{ getProgressPercent(selectedGoal) }}%)</span>
              <a-progress :percent="getProgressPercent(selectedGoal)" />
            </div>
          </div>
          
          <div class="detail-item" v-if="getProgressHistory(selectedGoal).length > 0">
            <label>进度历史：</label>
            <div class="progress-history">
              <div v-for="(record, index) in getProgressHistory(selectedGoal)" :key="index" class="history-item">
                <span class="date">{{ formatDate(record.date) }}</span>
                <span class="value">{{ record.value }}</span>
                <span class="note">{{ record.note }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="updateProgress(selectedGoal)">
              更新进度
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
  IconTrophy, IconPlus, IconEdit, IconEye, IconDelete, IconCalendar
} from '@arco-design/web-vue/es/icon';
import ApiService from '@/services/api';

export default {
  name: 'FitnessGoalManager',
  components: {
    IconTrophy, IconPlus, IconEdit, IconEye, IconDelete, IconCalendar
  },
  setup() {
    const loading = ref(false);
    const showModal = ref(false);
    const showProgressModal = ref(false);
    const showDetailModal = ref(false);
    const filterType = ref('');
    const filterStatus = ref('');
    
    const activeGoals = ref([]);
    const goals = ref([]);
    const selectedGoal = ref(null);
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: true,
      showPageSize: true
    });
    
    const form = reactive({
      goalType: '',
      targetValue: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });

    const progressForm = reactive({
      currentValue: '',
      note: ''
    });

    const columns = [
      { title: '目标类型', dataIndex: 'goalType', slotName: 'goalType' },
      { title: '目标值', dataIndex: 'targetValue', slotName: 'targetValue' },
      { title: '进度', dataIndex: 'progress', slotName: 'progress' },
      { title: '状态', dataIndex: 'isAchieved', slotName: 'isAchieved' },
      { title: '目标周期', dataIndex: 'dateRange', slotName: 'dateRange' },
      { title: '操作', slotName: 'actions', width: 150 }
    ];

    // 加载活跃目标
    const loadActiveGoals = async () => {
      try {
        const response = await ApiService.getActiveFitnessGoals();
        if (response.code === 0) {
          activeGoals.value = response.data || [];
        }
      } catch (error) {
        console.error('加载活跃目标失败:', error);
      }
    };

    // 加载所有目标
    const loadGoals = async () => {
      try {
        loading.value = true;
        const params = {
          current: pagination.current,
          pageSize: pagination.pageSize,
          goalType: filterType.value || undefined,
          isAchieved: filterStatus.value !== '' ? filterStatus.value : undefined
        };

        const response = await ApiService.getMyFitnessGoalByPage(params);
        if (response.code === 0) {
          goals.value = response.data.records || [];
          pagination.total = response.data.total || 0;
        }
      } catch (error) {
        console.error('加载目标失败:', error);
        Message.error('加载健身目标失败');
      } finally {
        loading.value = false;
      }
    };

    // 保存目标
    const saveGoal = async () => {
      try {
        const goalData = {
          goalType: form.goalType,
          targetValue: form.targetValue,
          startDate: form.startDate,
          endDate: form.endDate
        };

        const response = await ApiService.addFitnessGoal(goalData);
        if (response.code === 0) {
          Message.success('健身目标创建成功');
          showModal.value = false;
          resetForm();
          await Promise.all([loadActiveGoals(), loadGoals()]);
        } else {
          Message.error(response.message || '创建失败');
        }
      } catch (error) {
        console.error('保存目标失败:', error);
        Message.error('保存健身目标失败');
      }
    };

    // 更新进度
    const updateProgress = (goal) => {
      selectedGoal.value = goal;
      progressForm.currentValue = getCurrentProgress(goal);
      progressForm.note = '';
      showProgressModal.value = true;
      showDetailModal.value = false;
    };

    // 保存进度
    const saveProgress = async () => {
      try {
        if (!selectedGoal.value) return;

        // 解析现有进度
        let progress = {};
        try {
          progress = JSON.parse(selectedGoal.value.progress || '{}');
        } catch (e) {
          progress = {};
        }

        // 添加新的进度记录
        const today = new Date().toISOString().split('T')[0];
        if (!progress.history) progress.history = [];

        progress.history.push({
          date: today,
          value: progressForm.currentValue,
          note: progressForm.note
        });

        progress.current = progressForm.currentValue;
        progress.lastUpdate = today;

        const goalData = {
          id: selectedGoal.value.id,
          goalType: selectedGoal.value.goalType,
          targetValue: selectedGoal.value.targetValue,
          progress: JSON.stringify(progress),
          isAchieved: checkIfAchieved(selectedGoal.value, progressForm.currentValue) ? 1 : 0
        };

        const response = await ApiService.updateFitnessGoal(goalData);
        if (response.code === 0) {
          Message.success('进度更新成功');
          showProgressModal.value = false;
          resetProgressForm();
          await Promise.all([loadActiveGoals(), loadGoals()]);
        } else {
          Message.error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('保存进度失败:', error);
        Message.error('保存进度失败');
      }
    };

    // 删除目标
    const deleteGoal = async (id) => {
      try {
        const response = await ApiService.deleteFitnessGoal(id);
        if (response.code === 0) {
          Message.success('健身目标删除成功');
          await Promise.all([loadActiveGoals(), loadGoals()]);
        } else {
          Message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除目标失败:', error);
        Message.error('删除健身目标失败');
      }
    };

    // 查看目标详情
    const viewGoalDetails = (goal) => {
      selectedGoal.value = goal;
      showDetailModal.value = true;
    };

    // 分页处理
    const handlePageChange = (page) => {
      pagination.current = page;
      loadGoals();
    };

    // 重置表单
    const resetForm = () => {
      Object.assign(form, {
        goalType: '',
        targetValue: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    };

    const resetProgressForm = () => {
      Object.assign(progressForm, {
        currentValue: '',
        note: ''
      });
    };

    // 工具方法
    const getGoalTypeColor = (type) => {
      const colorMap = {
        '减重': 'red',
        '增重': 'blue',
        '体脂率': 'orange',
        '肌肉量': 'green',
        '运动频次': 'purple'
      };
      return colorMap[type] || 'gray';
    };

    const getGoalStatusColor = (isAchieved) => {
      return isAchieved ? 'green' : 'blue';
    };

    const getCurrentProgress = (goal) => {
      try {
        const progress = JSON.parse(goal.progress || '{}');
        return progress.current || '未记录';
      } catch (e) {
        return '未记录';
      }
    };

    const getProgressPercent = (goal) => {
      try {
        const progress = JSON.parse(goal.progress || '{}');
        const current = parseFloat(progress.current) || 0;
        const target = parseFloat(goal.targetValue.replace(/[^\d.]/g, '')) || 1;

        // 根据目标类型计算进度百分比
        if (goal.goalType === '减重') {
          return Math.min(100, Math.max(0, (current / target) * 100));
        } else {
          return Math.min(100, Math.max(0, (current / target) * 100));
        }
      } catch (e) {
        return 0;
      }
    };

    const getProgressColor = (goal) => {
      const percent = getProgressPercent(goal);
      if (percent >= 100) return '#00b42a';
      if (percent >= 75) return '#52c41a';
      if (percent >= 50) return '#faad14';
      return '#ff4d4f';
    };

    const getProgressHistory = (goal) => {
      try {
        const progress = JSON.parse(goal.progress || '{}');
        return progress.history || [];
      } catch (e) {
        return [];
      }
    };

    const checkIfAchieved = (goal, currentValue) => {
      try {
        const current = parseFloat(currentValue) || 0;
        const target = parseFloat(goal.targetValue.replace(/[^\d.]/g, '')) || 0;

        if (goal.goalType === '减重') {
          return current >= target;
        } else {
          return current >= target;
        }
      } catch (e) {
        return false;
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    // 页面初始化
    onMounted(async () => {
      await Promise.all([loadActiveGoals(), loadGoals()]);
    });

    return {
      loading,
      showModal,
      showProgressModal,
      showDetailModal,
      filterType,
      filterStatus,
      activeGoals,
      goals,
      selectedGoal,
      pagination,
      form,
      progressForm,
      columns,
      loadActiveGoals,
      loadGoals,
      saveGoal,
      updateProgress,
      saveProgress,
      deleteGoal,
      viewGoalDetails,
      handlePageChange,
      resetForm,
      resetProgressForm,
      getGoalTypeColor,
      getGoalStatusColor,
      getCurrentProgress,
      getProgressPercent,
      getProgressColor,
      getProgressHistory,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-goal-manager {
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

  .active-goals-section {
    margin-bottom: 32px;

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;

      .goal-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #00b42a;

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h5 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }

        .goal-content {
          margin-bottom: 16px;

          .goal-target,
          .goal-progress {
            margin-bottom: 12px;

            .label {
              font-weight: 500;
              color: #666;
              margin-right: 8px;
            }

            .value {
              font-weight: 600;
              color: #333;
            }
          }

          .goal-progress {
            .progress-info {
              display: flex;
              flex-direction: column;
              gap: 4px;

              .current {
                font-size: 14px;
                color: #333;
              }
            }
          }

          .goal-dates {
            font-size: 12px;
            color: #999;

            span {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }

        .goal-actions {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }

  .all-goals-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .table-progress {
      display: flex;
      flex-direction: column;
      gap: 4px;

      span {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>
