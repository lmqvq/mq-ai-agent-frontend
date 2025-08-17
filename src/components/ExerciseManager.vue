<template>
  <div class="exercise-manager">
    <div class="manager-header">
      <h3><icon-fire />运动记录管理</h3>
      <a-button type="primary" @click="showModal = true">
        <icon-plus />添加运动记录
      </a-button>
    </div>

    <!-- 运动统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <icon-calendar />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.thisWeek }}</div>
          <div class="stat-label">本周运动</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <icon-clock-circle />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalMinutes }}</div>
          <div class="stat-label">总运动时长(分钟)</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <icon-fire />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalCalories }}</div>
          <div class="stat-label">总消耗卡路里</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <icon-trophy />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.avgDuration }}</div>
          <div class="stat-label">平均时长(分钟)</div>
        </div>
      </div>
    </div>

    <!-- 运动记录列表 -->
    <div class="exercise-list">
      <div class="list-header">
        <h4>最近运动记录</h4>
        <a-space>
          <a-select v-model="filterType" placeholder="筛选运动类型" style="width: 150px" @change="loadExercises">
            <a-option value="">全部类型</a-option>
            <a-option value="跑步">跑步</a-option>
            <a-option value="骑行">骑行</a-option>
            <a-option value="游泳">游泳</a-option>
            <a-option value="力量训练">力量训练</a-option>
            <a-option value="瑜伽">瑜伽</a-option>
          </a-select>
          <a-range-picker v-model="dateRange" @change="loadExercises" />
        </a-space>
      </div>

      <a-table 
        :columns="columns" 
        :data="exercises" 
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #exerciseType="{ record }">
          <a-tag :color="getExerciseTypeColor(record.exerciseType)">
            {{ record.exerciseType }}
          </a-tag>
        </template>
        
        <template #duration="{ record }">
          {{ record.duration }} 分钟
        </template>
        
        <template #caloriesBurned="{ record }">
          {{ record.caloriesBurned }} 卡路里
        </template>
        
        <template #dateRecorded="{ record }">
          {{ formatDate(record.dateRecorded) }}
        </template>
        
        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="editExercise(record)">
              <icon-edit />编辑
            </a-button>
            <a-popconfirm content="确定要删除这条运动记录吗？" @ok="deleteExercise(record.id)">
              <a-button type="text" size="small" status="danger">
                <icon-delete />删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>

    <!-- 添加/编辑运动记录弹窗 -->
    <a-modal 
      v-model:visible="showModal" 
      :title="editingId ? '编辑运动记录' : '添加运动记录'" 
      @ok="saveExercise"
      @cancel="resetForm"
    >
      <a-form :model="form" layout="vertical" ref="formRef">
        <a-form-item label="运动类型" field="exerciseType" :rules="[{required: true, message: '请选择运动类型'}]">
          <a-select v-model="form.exerciseType" placeholder="选择运动类型">
            <a-option value="跑步">跑步</a-option>
            <a-option value="骑行">骑行</a-option>
            <a-option value="游泳">游泳</a-option>
            <a-option value="力量训练">力量训练</a-option>
            <a-option value="瑜伽">瑜伽</a-option>
            <a-option value="篮球">篮球</a-option>
            <a-option value="足球">足球</a-option>
            <a-option value="羽毛球">羽毛球</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="运动时长(分钟)" field="duration" :rules="[{required: true, message: '请输入运动时长'}]">
          <a-input-number v-model="form.duration" placeholder="输入运动时长" :min="1" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="消耗卡路里" field="caloriesBurned" :rules="[{required: true, message: '请输入消耗卡路里'}]">
          <a-input-number v-model="form.caloriesBurned" placeholder="输入消耗的卡路里" :min="1" style="width: 100%" />
        </a-form-item>
        
        <a-form-item label="运动日期" field="dateRecorded" :rules="[{required: true, message: '请选择运动日期'}]">
          <a-date-picker v-model="form.dateRecorded" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea v-model="form.notes" placeholder="添加运动备注" :max-length="200" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { 
  IconFire, IconPlus, IconEdit, IconDelete, IconCalendar, 
  IconClockCircle, IconTrophy 
} from '@arco-design/web-vue/es/icon';
import ApiService from '@/services/api';

export default {
  name: 'ExerciseManager',
  components: {
    IconFire, IconPlus, IconEdit, IconDelete, IconCalendar, 
    IconClockCircle, IconTrophy
  },
  setup() {
    const loading = ref(false);
    const showModal = ref(false);
    const editingId = ref(null);
    const filterType = ref('');
    const dateRange = ref([]);
    
    const stats = ref({
      thisWeek: 0,
      totalMinutes: 0,
      totalCalories: 0,
      avgDuration: 0
    });
    
    const exercises = ref([]);
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showTotal: true,
      showPageSize: true
    });
    
    const form = reactive({
      exerciseType: '',
      duration: null,
      caloriesBurned: null,
      dateRecorded: new Date().toISOString().split('T')[0],
      notes: ''
    });

    const columns = [
      { title: '运动类型', dataIndex: 'exerciseType', slotName: 'exerciseType' },
      { title: '时长', dataIndex: 'duration', slotName: 'duration' },
      { title: '消耗卡路里', dataIndex: 'caloriesBurned', slotName: 'caloriesBurned' },
      { title: '运动日期', dataIndex: 'dateRecorded', slotName: 'dateRecorded' },
      { title: '备注', dataIndex: 'notes', ellipsis: true, tooltip: true },
      { title: '操作', slotName: 'actions', width: 120 }
    ];

    // 加载运动记录
    const loadExercises = async () => {
      try {
        loading.value = true;
        const params = {
          current: pagination.current,
          pageSize: pagination.pageSize,
          exerciseType: filterType.value || undefined,
          startDate: dateRange.value?.[0] || undefined,
          endDate: dateRange.value?.[1] || undefined
        };

        const response = await ApiService.getMyExerciseLogByPage(params);
        if (response.code === 0) {
          exercises.value = response.data.records || [];
          pagination.total = response.data.total || 0;
        }
      } catch (error) {
        console.error('加载运动记录失败:', error);
        Message.error('加载运动记录失败');
      } finally {
        loading.value = false;
      }
    };

    // 加载统计数据
    const loadStats = async () => {
      try {
        const response = await ApiService.getExerciseStats(30);
        if (response.code === 0) {
          stats.value = {
            thisWeek: response.data.weeklyCount || 0,
            totalMinutes: response.data.totalMinutes || 0,
            totalCalories: response.data.totalCalories || 0,
            avgDuration: response.data.avgDuration || 0
          };
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    // 保存运动记录
    const saveExercise = async () => {
      try {
        const exerciseData = {
          exerciseType: form.exerciseType,
          duration: form.duration,
          caloriesBurned: form.caloriesBurned,
          dateRecorded: form.dateRecorded,
          notes: form.notes
        };

        let response;
        if (editingId.value) {
          exerciseData.id = editingId.value;
          response = await ApiService.updateExerciseLog(exerciseData);
        } else {
          response = await ApiService.addExerciseLog(exerciseData);
        }

        if (response.code === 0) {
          Message.success(editingId.value ? '运动记录更新成功' : '运动记录添加成功');
          showModal.value = false;
          resetForm();
          await Promise.all([loadExercises(), loadStats()]);
        } else {
          Message.error(response.message || '保存失败');
        }
      } catch (error) {
        console.error('保存运动记录失败:', error);
        Message.error('保存运动记录失败');
      }
    };

    // 编辑运动记录
    const editExercise = (record) => {
      editingId.value = record.id;
      Object.assign(form, {
        exerciseType: record.exerciseType,
        duration: record.duration,
        caloriesBurned: record.caloriesBurned,
        dateRecorded: record.dateRecorded,
        notes: record.notes || ''
      });
      showModal.value = true;
    };

    // 删除运动记录
    const deleteExercise = async (id) => {
      try {
        const response = await ApiService.deleteExerciseLog(id);
        if (response.code === 0) {
          Message.success('运动记录删除成功');
          await Promise.all([loadExercises(), loadStats()]);
        } else {
          Message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除运动记录失败:', error);
        Message.error('删除运动记录失败');
      }
    };

    // 重置表单
    const resetForm = () => {
      editingId.value = null;
      Object.assign(form, {
        exerciseType: '',
        duration: null,
        caloriesBurned: null,
        dateRecorded: new Date().toISOString().split('T')[0],
        notes: ''
      });
    };

    // 分页处理
    const handlePageChange = (page) => {
      pagination.current = page;
      loadExercises();
    };

    // 工具方法
    const getExerciseTypeColor = (type) => {
      const colorMap = {
        '跑步': 'red',
        '骑行': 'blue',
        '游泳': 'cyan',
        '力量训练': 'orange',
        '瑜伽': 'green',
        '篮球': 'purple',
        '足球': 'magenta',
        '羽毛球': 'gold'
      };
      return colorMap[type] || 'gray';
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('zh-CN');
    };

    // 页面初始化
    onMounted(async () => {
      await Promise.all([loadExercises(), loadStats()]);
    });

    return {
      loading,
      showModal,
      editingId,
      filterType,
      dateRange,
      stats,
      exercises,
      pagination,
      form,
      columns,
      loadExercises,
      loadStats,
      saveExercise,
      editExercise,
      deleteExercise,
      resetForm,
      handlePageChange,
      getExerciseTypeColor,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.exercise-manager {
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: linear-gradient(45deg, #ff7d00, #ffa940);
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(svg) {
          width: 24px;
          height: 24px;
          color: white;
        }
      }

      .stat-content {
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }
  }

  .exercise-list {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .list-header {
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
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
