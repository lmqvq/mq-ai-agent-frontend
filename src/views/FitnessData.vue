<template>
  <div class="fitness-data">
    <div class="data-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1><icon-bar-chart />健身数据中心</h1>
            <p>记录和追踪您的健身进展，让数据指导您的健身之路</p>
          </div>
          <div class="header-actions">
            <a-button type="primary" @click="showDataModal = true">
              <icon-plus />添加健身数据
            </a-button>
          </div>
        </div>
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
            <h3>当前体脂率</h3>
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
          <div class="card-icon height">
            <icon-trophy />
          </div>
          <div class="card-content">
            <h3>当前身高</h3>
            <div class="value">{{ currentData.height || '--' }} <span>cm</span></div>
            <div class="change">
              基础数据
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
          <div class="chart-container weight-chart"></div>
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
          <div class="chart-container bodyfat-chart"></div>
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
        <a-form-item label="体重(kg)" required>
          <a-input-number 
            v-model="workoutForm.weight" 
            placeholder="输入当前体重" 
            :precision="1"
            :min="1" 
            @change="calculateCalories"
          />
          <div class="helper-text">用于计算消耗的卡路里</div>
        </a-form-item>
        <a-form-item label="运动类型" required>
          <a-select v-model="workoutForm.exerciseType" placeholder="选择运动类型" @change="calculateCalories">
            <a-option value="跑步">跑步</a-option>
            <a-option value="骑行">骑行</a-option>
            <a-option value="游泳">游泳</a-option>
            <a-option value="力量训练">力量训练</a-option>
            <a-option value="瑜伽">瑜伽</a-option>
            <a-option value="篮球">篮球</a-option>
            <a-option value="足球">足球</a-option>
            <a-option value="羽毛球">羽毛球</a-option>
            <a-option value="散步">散步</a-option>
            <a-option value="爬楼梯">爬楼梯</a-option>
            <a-option value="慢跑">慢跑</a-option>
            <a-option value="快跑">快跑</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="运动时长(分钟)" required>
          <a-input-number 
            v-model="workoutForm.duration" 
            placeholder="输入运动时长" 
            :min="1" 
            @change="calculateCalories"
          />
        </a-form-item>
        <a-form-item label="消耗卡路里">
          <a-input-number 
            v-model="workoutForm.caloriesBurned" 
            placeholder="自动计算" 
            :min="1"
            disabled
            readonly
          />
          <div class="helper-text">根据运动类型、体重、时长自动计算</div>
        </a-form-item>
        <a-form-item label="运动日期" required>
          <a-date-picker v-model="workoutForm.dateRecorded" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="workoutForm.notes" placeholder="添加运动备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加健身数据弹窗 -->
    <a-modal v-model:visible="showDataModal" title="添加健身数据" @ok="saveData">
      <a-form :model="dataForm" layout="vertical">
        <a-form-item label="性别" required>
          <a-radio-group v-model="dataForm.gender" @change="calculateBodyFatPercentage">
            <a-radio value="男">男</a-radio>
            <a-radio value="女">女</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="年龄" required>
          <a-input-number
            v-model="dataForm.age"
            placeholder="输入年龄"
            :min="1"
            :max="150"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="身高(cm)" required>
          <a-input-number
            v-model="dataForm.height"
            placeholder="输入身高"
            :precision="1"
            :min="100"
            :max="250"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="体重(kg)" required>
          <a-input-number
            v-model="dataForm.weight"
            placeholder="输入体重"
            :precision="1"
            :min="1"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="体脂率(%)">
          <a-input-number 
            v-model="dataForm.bodyFat" 
            placeholder="自动计算" 
            :precision="1" 
            :min="1" 
            :max="50"
            disabled
            readonly
          />
          <div class="helper-text">根据性别、年龄、身高、体重自动计算</div>
        </a-form-item>

        <!-- BMI计算结果显示区域 -->
        <a-form-item v-if="bmiResult" label="BMI计算结果">
          <div class="bmi-result-card">
            <a-spin :loading="bmiCalculating">
              <div class="bmi-info">
                <div class="bmi-value">
                  <span class="label">BMI指数：</span>
                  <span class="value" :class="getBMIStatusClass(bmiResult.bmi)">{{ bmiResult.bmi }}</span>
                  <span class="category">{{ bmiResult.category }}</span>
                </div>
                <div class="ideal-weight" v-if="bmiResult.idealWeightMin && bmiResult.idealWeightMax">
                  <span class="label">理想体重：</span>
                  <span class="value">{{ bmiResult.idealWeightMin }}kg - {{ bmiResult.idealWeightMax }}kg</span>
                </div>
                <div class="health-advice" v-if="bmiResult.healthAdvice">
                  <span class="label">健康建议：</span>
                  <span class="advice">{{ bmiResult.healthAdvice }}</span>
                </div>
              </div>
            </a-spin>
          </div>
        </a-form-item>

        <a-form-item label="记录日期" required>
          <a-date-picker v-model="dataForm.dateRecorded" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconBarChart, IconUser, IconHeart, IconDashboard, IconTrophy,
  IconFire, IconPlus, IconEdit, IconDelete
} from '@arco-design/web-vue/es/icon';
import * as echarts from 'echarts';
import ApiService from '@/services/api';

export default {
  name: 'FitnessData',
  components: {
    IconBarChart, IconUser, IconHeart, IconDashboard, IconTrophy, 
    IconFire, IconPlus, IconEdit, IconDelete
  },
  setup() {
    // 响应式数据
    const loading = ref(false);
    const currentData = ref({
      weight: null,
      bodyFat: null,
      bmi: null,
      height: null
    });

    const weightChange = ref({ type: '', text: '暂无数据' });
    const bodyFatChange = ref({ type: '', text: '暂无数据' });
    const muscleChange = ref({ type: '', text: '暂无数据' });

    const weightPeriod = ref('30d');
    const bodyFatPeriod = ref('30d');
    
    // 图表实例
    let weightChartInstance = null;
    let bodyFatChartInstance = null;

    const workoutStats = ref({
      thisWeek: 0,
      thisMonth: 0,
      totalCalories: 0,
      avgDuration: 0
    });

    const recentWorkouts = ref([]);
    const fitnessDataList = ref([]);

    const showWorkoutModal = ref(false);
    const showDataModal = ref(false);

    const workoutForm = reactive({
      weight: null,
      exerciseType: '',
      duration: null,
      caloriesBurned: null,
      dateRecorded: new Date().toISOString().split('T')[0],
      notes: ''
    });

    const dataForm = reactive({
      gender: '',
      age: null,
      height: null,
      weight: null,
      bodyFat: null,
      dateRecorded: new Date().toISOString().split('T')[0]
    });

    // BMI计算相关数据
    const bmiResult = ref(null);
    const bmiCalculating = ref(false);

    // 监听弹窗打开/关闭
    watch(showDataModal, (newVal) => {
      if (!newVal) {
        // 弹窗关闭时，重置BMI结果
        bmiResult.value = null;
      }
    });

    // API调用方法
    const loadFitnessData = async () => {
      try {
        loading.value = true;
        const response = await ApiService.getMyFitnessDataByPage({
          current: 1,
          pageSize: 10
        });

        if (response.code === 0 && response.data?.records?.length > 0) {
          fitnessDataList.value = response.data.records;
          const latest = response.data.records[0];
          currentData.value = {
            weight: latest.weight,
            bodyFat: latest.bodyFat,
            bmi: latest.bmi,
            height: latest.height
          };

          // 计算变化趋势
          if (response.data.records.length > 1) {
            const previous = response.data.records[1];
            calculateChanges(latest, previous);
          }
        }
      } catch (error) {
        console.error('加载健身数据失败:', error);
        Message.error('加载健身数据失败');
      } finally {
        loading.value = false;
      }
    };

    const loadExerciseData = async () => {
      try {
        const response = await ApiService.getMyExerciseLogByPage({
          current: 1,
          pageSize: 100  // 获取更多数据用于统计
        });

        if (response.code === 0 && response.data?.records) {
          const records = response.data.records;
          recentWorkouts.value = records.slice(0, 10).map(item => ({
            id: item.id,
            type: item.exerciseType,
            name: item.exerciseType,
            duration: item.duration,
            calories: item.caloriesBurned,
            date: new Date(item.dateRecorded),
            notes: item.notes || ''
          }));

          // 自己计算运动统计
          calculateWorkoutStats(records);
        } else {
          recentWorkouts.value = [];
          workoutStats.value = {
            thisWeek: 0,
            thisMonth: 0,
            totalCalories: 0,
            avgDuration: 0
          };
        }
      } catch (error) {
        console.error('加载运动数据失败:', error);
        // 不显示错误提示，只记录日志
        recentWorkouts.value = [];
        workoutStats.value = {
          thisWeek: 0,
          thisMonth: 0,
          totalCalories: 0,
          avgDuration: 0
        };
      }
    };

    // 计算运动统计
    const calculateWorkoutStats = (records) => {
      if (!records || records.length === 0) {
        workoutStats.value = {
          thisWeek: 0,
          thisMonth: 0,
          totalCalories: 0,
          avgDuration: 0
        };
        return;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let weekCount = 0;
      let monthCount = 0;
      let totalCalories = 0;
      let totalDuration = 0;

      records.forEach(record => {
        const recordDate = new Date(record.dateRecorded);
        
        if (recordDate >= oneWeekAgo) {
          weekCount++;
        }
        if (recordDate >= oneMonthAgo) {
          monthCount++;
        }
        
        totalCalories += record.caloriesBurned || 0;
        totalDuration += record.duration || 0;
      });

      const avgDuration = records.length > 0 ? Math.round(totalDuration / records.length) : 0;

      workoutStats.value = {
        thisWeek: weekCount,
        thisMonth: monthCount,
        totalCalories: Math.round(totalCalories),
        avgDuration: avgDuration
      };
    };

    const calculateChanges = (current, previous) => {
      if (current.weight && previous.weight) {
        const weightDiff = current.weight - previous.weight;
        weightChange.value = {
          type: weightDiff >= 0 ? 'increase' : 'decrease',
          text: `${weightDiff >= 0 ? '↑' : '↓'} ${Math.abs(weightDiff).toFixed(1)}kg 较上次`
        };
      }

      if (current.bodyFat && previous.bodyFat) {
        const bodyFatDiff = current.bodyFat - previous.bodyFat;
        bodyFatChange.value = {
          type: bodyFatDiff >= 0 ? 'increase' : 'decrease',
          text: `${bodyFatDiff >= 0 ? '↑' : '↓'} ${Math.abs(bodyFatDiff).toFixed(1)}% 较上次`
        };
      }
    };

    // 工具方法
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

    // BMI计算相关方法
    const getBMIStatusClass = (bmi) => {
      if (!bmi) return '';
      if (bmi < 18.5) return 'underweight';
      if (bmi < 24) return 'normal';
      if (bmi < 28) return 'overweight';
      return 'obese';
    };

    const calculateBMIRealtime = async () => {
      if (dataForm.weight && dataForm.height) {
        try {
          bmiCalculating.value = true;
          const response = await ApiService.calculateBMI({
            weight: dataForm.weight,
            height: dataForm.height
          });

          if (response.code === 0) {
            bmiResult.value = response.data;
          } else {
            console.error('BMI计算失败:', response.message);
            bmiResult.value = null;
          }
        } catch (error) {
          console.error('BMI计算接口调用失败:', error);
          bmiResult.value = null;
        } finally {
          bmiCalculating.value = false;
        }
      } else {
        bmiResult.value = null;
      }
    };

    // 计算运动消耗的卡路里
    const calculateCalories = () => {
      // 检查是否所有必要数据都已输入
      if (!workoutForm.weight || !workoutForm.exerciseType || !workoutForm.duration) {
        workoutForm.caloriesBurned = null;
        return;
      }

      // 各种运动的MET值（代谢当量）
      // 参考：https://tools-moah.app/zh/health-lab/exercise-calorie-calculator
      const metValues = {
        '跑步': 8.0,
        '快跑': 10.0,
        '慢跑': 6.0,
        '骑行': 7.5,
        '游泳': 8.0,
        '力量训练': 6.0,
        '瑜伽': 3.0,
        '篮球': 6.5,
        '足球': 7.0,
        '羽毛球': 5.5,
        '散步': 3.5,
        '爬楼梯': 8.0,
        '其他': 5.0
      };

      const met = metValues[workoutForm.exerciseType] || 5.0;
      
      // 卡路里计算公式：消耗的卡路里 = MET × 体重(kg) × 时间(小时)
      // 注意：时长需要从分钟转换为小时
      const hours = workoutForm.duration / 60;
      const calories = met * workoutForm.weight * hours;

      // 四舍五入到整数
      workoutForm.caloriesBurned = Math.round(calories);
    };

    // 计算体脂率
    const calculateBodyFatPercentage = () => {
      // 检查是否所有必要数据都已输入
      if (!dataForm.gender || !dataForm.age || !dataForm.height || !dataForm.weight) {
        dataForm.bodyFat = null;
        return;
      }

      // 计算BMI
      const heightInMeters = dataForm.height / 100;
      const bmi = dataForm.weight / (heightInMeters * heightInMeters);

      let bodyFatPercentage = 0;

      // 判断是否为未成年（周岁年龄小于18岁）
      const isMinor = dataForm.age < 18;

      if (isMinor) {
        // 未成年计算公式
        if (dataForm.gender === '男') {
          // 未成年男性：体脂率（BFP） = 1.51 × BMI - 0.70 × 年龄 - 2.2
          bodyFatPercentage = 1.51 * bmi - 0.70 * dataForm.age - 2.2;
        } else {
          // 未成年女性：体脂率（BFP） = 1.51 × BMI - 0.70 × 年龄 + 1.4
          bodyFatPercentage = 1.51 * bmi - 0.70 * dataForm.age + 1.4;
        }
      } else {
        // 成年计算公式
        if (dataForm.gender === '男') {
          // 成年男性：体脂率（BFP） = 1.20 × BMI + 0.23 × 年龄 - 16.2
          bodyFatPercentage = 1.20 * bmi + 0.23 * dataForm.age - 16.2;
        } else {
          // 成年女性：体脂率（BFP） = 1.20 × BMI + 0.23 × 年龄 - 5.4
          bodyFatPercentage = 1.20 * bmi + 0.23 * dataForm.age - 5.4;
        }
      }

      // 确保体脂率在合理范围内（1%-50%）
      bodyFatPercentage = Math.max(1, Math.min(50, bodyFatPercentage));

      // 保留一位小数
      dataForm.bodyFat = parseFloat(bodyFatPercentage.toFixed(1));

      // 同时触发BMI计算
      calculateBMIRealtime();
    };

    // 初始化体重图表
    const initWeightChart = async () => {
      try {
        const chartDom = document.querySelector('.weight-chart');
        if (!chartDom) return;
        
        if (weightChartInstance) {
          weightChartInstance.dispose();
        }
        
        weightChartInstance = echarts.init(chartDom);
        
        // 根据时间段获取天数
        const daysMap = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '1y': 365
        };
        const days = daysMap[weightPeriod.value] || 30;
        
        // 获取趋势数据
        const response = await ApiService.getFitnessTrends(days);
        
        if (response.code === 0 && response.data && response.data.length > 0) {
          const dates = [];
          const weights = [];
          
          // 按日期排序
          response.data.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
          
          response.data.forEach(item => {
            if (item.weight) {
              dates.push(new Date(item.dateRecorded).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
              weights.push(item.weight);
            }
          });
          
          const option = {
            title: {
              text: '',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis',
              formatter: '{b}<br/>体重: {c} kg'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '10%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: dates,
              axisLabel: {
                rotate: 45
              }
            },
            yAxis: {
              type: 'value',
              name: '体重(kg)',
              min: function(value) {
                return Math.floor(value.min - 2);
              },
              max: function(value) {
                return Math.ceil(value.max + 2);
              }
            },
            series: [
              {
                name: '体重',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: weights,
                itemStyle: {
                  color: '#4080ff'
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(64, 128, 255, 0.3)' },
                    { offset: 1, color: 'rgba(64, 128, 255, 0.05)' }
                  ])
                }
              }
            ]
          };
          
          weightChartInstance.setOption(option);
        } else {
          // 显示无数据提示
          const option = {
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 14
              }
            }
          };
          weightChartInstance.setOption(option);
        }
      } catch (error) {
        console.error('初始化体重图表失败:', error);
        Message.error('加载体重趋势图失败');
      }
    };
    
    // 初始化体脂率图表
    const initBodyFatChart = async () => {
      try {
        const chartDom = document.querySelector('.bodyfat-chart');
        if (!chartDom) return;
        
        if (bodyFatChartInstance) {
          bodyFatChartInstance.dispose();
        }
        
        bodyFatChartInstance = echarts.init(chartDom);
        
        // 根据时间段获取天数
        const daysMap = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '1y': 365
        };
        const days = daysMap[bodyFatPeriod.value] || 30;
        
        // 获取趋势数据
        const response = await ApiService.getFitnessTrends(days);
        
        if (response.code === 0 && response.data && response.data.length > 0) {
          const dates = [];
          const bodyFats = [];
          
          // 按日期排序
          response.data.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
          
          response.data.forEach(item => {
            if (item.bodyFat) {
              dates.push(new Date(item.dateRecorded).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
              bodyFats.push(item.bodyFat);
            }
          });
          
          const option = {
            title: {
              text: '',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis',
              formatter: '{b}<br/>体脂率: {c}%'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '10%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: dates,
              axisLabel: {
                rotate: 45
              }
            },
            yAxis: {
              type: 'value',
              name: '体脂率(%)',
              min: function(value) {
                return Math.floor(value.min - 2);
              },
              max: function(value) {
                return Math.ceil(value.max + 2);
              }
            },
            series: [
              {
                name: '体脂率',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: bodyFats,
                itemStyle: {
                  color: '#f53f3f'
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245, 63, 63, 0.3)' },
                    { offset: 1, color: 'rgba(245, 63, 63, 0.05)' }
                  ])
                }
              }
            ]
          };
          
          bodyFatChartInstance.setOption(option);
        } else {
          // 显示无数据提示
          const option = {
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 14
              }
            }
          };
          bodyFatChartInstance.setOption(option);
        }
      } catch (error) {
        console.error('初始化体脂率图表失败:', error);
        Message.error('加载体脂率趋势图失败');
      }
    };

    const updateWeightChart = async () => {
      await nextTick();
      await initWeightChart();
    };

    const updateBodyFatChart = async () => {
      await nextTick();
      await initBodyFatChart();
    };

    const saveWorkout = async () => {
      try {
        // 验证必填字段
        if (!workoutForm.weight) {
          Message.warning('请输入体重');
          return;
        }
        if (!workoutForm.exerciseType) {
          Message.warning('请选择运动类型');
          return;
        }
        if (!workoutForm.duration) {
          Message.warning('请输入运动时长');
          return;
        }
        if (!workoutForm.caloriesBurned) {
          Message.warning('卡路里未计算，请确保所有数据填写完整');
          return;
        }

        const exerciseData = {
          exerciseType: workoutForm.exerciseType,
          duration: workoutForm.duration,
          caloriesBurned: workoutForm.caloriesBurned,
          dateRecorded: workoutForm.dateRecorded,
          notes: workoutForm.notes
        };

        const response = await ApiService.addExerciseLog(exerciseData);
        if (response.code === 0) {
          Message.success('运动记录添加成功');
          showWorkoutModal.value = false;

          // 重置表单
          Object.keys(workoutForm).forEach(key => {
            if (key === 'dateRecorded') {
              workoutForm[key] = new Date().toISOString().split('T')[0];
            } else {
              workoutForm[key] = null;
            }
          });

          // 重新加载数据
          await loadExerciseData();
        } else {
          Message.error(response.message || '添加运动记录失败');
        }
      } catch (error) {
        console.error('保存运动记录失败:', error);
        Message.error('保存运动记录失败');
      }
    };

    const editWorkout = (workout) => {
      Object.assign(workoutForm, workout);
      showWorkoutModal.value = true;
    };

    const deleteWorkout = async (workoutId) => {
      try {
        const response = await ApiService.deleteExerciseLog(workoutId);
        if (response.code === 0) {
          Message.success('运动记录删除成功');
          await loadExerciseData();
        } else {
          Message.error(response.message || '删除运动记录失败');
        }
      } catch (error) {
        console.error('删除运动记录失败:', error);
        Message.error('删除运动记录失败');
      }
    };

    const saveData = async () => {
      try {
        // 验证必填字段
        if (!dataForm.gender) {
          Message.warning('请选择性别');
          return;
        }
        if (!dataForm.age) {
          Message.warning('请输入年龄');
          return;
        }
        if (!dataForm.height) {
          Message.warning('请输入身高');
          return;
        }
        if (!dataForm.weight) {
          Message.warning('请输入体重');
          return;
        }
        if (!dataForm.bodyFat) {
          Message.warning('体脂率未计算，请确保所有数据填写完整');
          return;
        }

        const fitnessData = {
          weight: dataForm.weight,
          bodyFat: dataForm.bodyFat,
          height: dataForm.height,
          dateRecorded: dataForm.dateRecorded
        };

        const response = await ApiService.addFitnessData(fitnessData);
        if (response.code === 0) {
          Message.success('健身数据添加成功');
          showDataModal.value = false;

          // 重置表单
          Object.keys(dataForm).forEach(key => {
            if (key === 'dateRecorded') {
              dataForm[key] = new Date().toISOString().split('T')[0];
            } else if (key === 'gender') {
              dataForm[key] = '';
            } else {
              dataForm[key] = null;
            }
          });

          // 重新加载数据和图表
          await loadFitnessData();
          await nextTick();
          await initWeightChart();
          await initBodyFatChart();
        } else {
          Message.error(response.message || '添加健身数据失败');
        }
      } catch (error) {
        console.error('保存健身数据失败:', error);
        Message.error('保存健身数据失败');
      }
    };

    // 页面初始化
    onMounted(async () => {
      await Promise.all([
        loadFitnessData(),
        loadExerciseData()
      ]);
      
      // 初始化图表
      await nextTick();
      await initWeightChart();
      await initBodyFatChart();
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        weightChartInstance?.resize();
        bodyFatChartInstance?.resize();
      });
    });

    return {
      loading,
      currentData,
      weightChange,
      bodyFatChange,
      muscleChange,
      weightPeriod,
      bodyFatPeriod,
      workoutStats,
      recentWorkouts,
      showWorkoutModal,
      showDataModal,
      workoutForm,
      dataForm,
      // BMI相关
      bmiResult,
      bmiCalculating,
      getBMIStatus,
      getBMIStatusText,
      getBMIStatusClass,
      calculateBMIRealtime,
      calculateBodyFatPercentage,
      calculateCalories,
      calculateWorkoutStats,
      // 图表相关
      initWeightChart,
      initBodyFatChart,
      // 其他方法
      getWorkoutIcon,
      formatDate,
      updateWeightChart,
      updateBodyFatChart,
      saveWorkout,
      saveData,
      editWorkout,
      deleteWorkout,
      loadFitnessData,
      loadExerciseData
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-data {
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
  padding-bottom: 80px;
}

.data-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  color: #333;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-section {
      text-align: center;
      flex: 1;

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

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(10px);
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
    
    &.height {
      background: linear-gradient(45deg, #722ed1, #9254de);
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
    height: 320px;
    width: 100%;
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

// 辅助文本样式
.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

// BMI结果显示样式
.bmi-result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;

  .bmi-info {
    .bmi-value {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .label {
        font-weight: 600;
        color: #333;
      }

      .value {
        font-size: 18px;
        font-weight: 700;

        &.underweight {
          color: #1890ff;
        }

        &.normal {
          color: #52c41a;
        }

        &.overweight {
          color: #faad14;
        }

        &.obese {
          color: #f5222d;
        }
      }

      .category {
        background: #e6f7ff;
        color: #1890ff;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .ideal-weight, .health-advice {
      margin-bottom: 8px;
      font-size: 14px;

      .label {
        font-weight: 600;
        color: #333;
        margin-right: 8px;
      }

      .value {
        color: #666;
      }

      .advice {
        color: #666;
        line-height: 1.4;
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
