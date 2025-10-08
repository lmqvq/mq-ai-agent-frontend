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
            <span class="value">{{ latestBodyData.weight || '--' }} <span class="unit">kg</span></span>
          </div>
          <div class="data-item">
            <span class="label">最新体脂率</span>
            <span class="value">{{ latestBodyData.bodyFat || '--' }}<span class="unit">%</span></span>
          </div>
          <div class="data-item">
            <span class="label">BMI指数</span>
            <span class="value">{{ latestBodyData.bmi || calculateBMI() || '--' }}</span>
          </div>
          <div class="data-item">
            <span class="label">最新身高</span>
            <span class="value">{{ latestBodyData.height || '--' }} <span class="unit">cm</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加健身数据弹窗 -->
    <a-modal v-model:visible="showDataModal" title="添加健身数据" @ok="saveBodyData">
      <a-form :model="bodyDataForm" layout="vertical">
        <a-form-item label="性别" required>
          <a-radio-group v-model="bodyDataForm.gender" @change="calculateBodyFatPercentage">
            <a-radio value="男">男</a-radio>
            <a-radio value="女">女</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="年龄" required>
          <a-input-number
            v-model="bodyDataForm.age"
            placeholder="输入年龄"
            :min="1"
            :max="150"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="身高(cm)" required>
          <a-input-number
            v-model="bodyDataForm.height"
            placeholder="输入身高"
            :precision="1"
            :min="100"
            :max="250"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="体重(kg)" required>
          <a-input-number
            v-model="bodyDataForm.weight"
            placeholder="输入体重"
            :precision="1"
            :min="1"
            @change="calculateBodyFatPercentage"
          />
        </a-form-item>
        <a-form-item label="体脂率(%)">
          <a-input-number 
            v-model="bodyDataForm.bodyFat" 
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
          <a-date-picker v-model="bodyDataForm.dateRecorded" style="width: 100%" value-format="YYYY-MM-DD" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 头像上传弹窗 -->
    <a-modal
      v-model:visible="showAvatarUpload"
      title="更换头像"
      :footer="false"
      width="500px"
    >
      <div class="avatar-upload-container">
        <!-- 当前头像预览 -->
        <div class="current-avatar">
          <h4>当前头像</h4>
          <div class="avatar-preview">
            <img v-if="userInfo.userAvatar" :src="userInfo.userAvatar" alt="当前头像" />
            <icon-user v-else />
          </div>
        </div>

        <!-- 文件上传区域 -->
        <div class="upload-section">
          <h4>选择新头像</h4>
          <div class="upload-area" @click="triggerFileInput">
            <icon-upload />
            <div class="upload-text">
              <p>点击选择图片</p>
              <p class="upload-hint">支持 JPG、PNG、GIF 格式，文件大小不超过 2MB</p>
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <!-- 新头像预览 -->
        <div v-if="previewUrl" class="new-avatar">
          <h4>新头像预览</h4>
          <div class="avatar-preview">
            <img :src="previewUrl" alt="新头像预览" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="upload-actions">
          <a-button @click="cancelUpload">取消</a-button>
          <a-button
            type="primary"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="confirmUpload"
          >
            {{ uploading ? '上传中...' : '确认更换' }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue';
import {
  IconUser, IconCamera, IconPlus, IconHeart, IconUpload
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import * as echarts from 'echarts';
import ApiService from '@/services/api';
import { useUserStore } from '@/stores/user';

export default {
  name: 'UserProfile',
  components: {
    IconUser, IconCamera, IconPlus, IconHeart, IconUpload
  },
  setup() {
    // 用户状态管理
    const { setUserInfo } = useUserStore();

    // 响应式数据
    const userInfo = ref({});
    const fitnessStats = ref({
      totalWorkouts: 0,
      totalDays: 0,
      currentStreak: 0
    });
    const latestBodyData = ref({
      weight: null,
      bodyFat: null,
      bmi: null,
      height: null
    });

    // 图表ref
    const weightChart = ref(null);
    const bodyFatChart = ref(null);
    let weightChartInstance = null;
    let bodyFatChartInstance = null;

    // 弹窗控制
    const showDataModal = ref(false);
    const showAvatarUpload = ref(false);

    // 头像上传相关数据
    const fileList = ref([]);
    const previewUrl = ref('');
    const uploading = ref(false);
    const uploadRef = ref(null);
    const selectedFile = ref(null);
    const fileInputRef = ref(null);
    
    // 表单数据
    const bodyDataForm = reactive({
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


    // BMI计算相关方法
    const getBMIStatusClass = (bmi) => {
      if (!bmi) return '';
      if (bmi < 18.5) return 'underweight';
      if (bmi < 24) return 'normal';
      if (bmi < 28) return 'overweight';
      return 'obese';
    };

    const calculateBMIRealtime = async () => {
      if (bodyDataForm.weight && bodyDataForm.height) {
        try {
          bmiCalculating.value = true;
          const response = await ApiService.calculateBMI({
            weight: bodyDataForm.weight,
            height: bodyDataForm.height
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

    // 计算体脂率
    // eslint-disable-next-line no-unused-vars
    const calculateBodyFatPercentage = () => {
      // 检查是否所有必要数据都已输入
      if (!bodyDataForm.gender || !bodyDataForm.age || !bodyDataForm.height || !bodyDataForm.weight) {
        bodyDataForm.bodyFat = null;
        return;
      }

      // 计算BMI
      const heightInMeters = bodyDataForm.height / 100;
      const bmi = bodyDataForm.weight / (heightInMeters * heightInMeters);

      let bodyFatPercentage = 0;

      // 判断是否为未成年（周岁年龄小于18岁）
      const isMinor = bodyDataForm.age < 18;

      if (isMinor) {
        // 未成年计算公式
        if (bodyDataForm.gender === '男') {
          // 未成年男性：体脂率（BFP） = 1.51 × BMI - 0.70 × 年龄 - 2.2
          bodyFatPercentage = 1.51 * bmi - 0.70 * bodyDataForm.age - 2.2;
        } else {
          // 未成年女性：体脂率（BFP） = 1.51 × BMI - 0.70 × 年龄 + 1.4
          bodyFatPercentage = 1.51 * bmi - 0.70 * bodyDataForm.age + 1.4;
        }
      } else {
        // 成年计算公式
        if (bodyDataForm.gender === '男') {
          // 成年男性：体脂率（BFP） = 1.20 × BMI + 0.23 × 年龄 - 16.2
          bodyFatPercentage = 1.20 * bmi + 0.23 * bodyDataForm.age - 16.2;
        } else {
          // 成年女性：体脂率（BFP） = 1.20 × BMI + 0.23 × 年龄 - 5.4
          bodyFatPercentage = 1.20 * bmi + 0.23 * bodyDataForm.age - 5.4;
        }
      }

      // 确保体脂率在合理范围内（1%-50%）
      bodyFatPercentage = Math.max(1, Math.min(50, bodyFatPercentage));

      // 保留一位小数
      bodyDataForm.bodyFat = parseFloat(bodyFatPercentage.toFixed(1));

      // 同时触发BMI计算
      calculateBMIRealtime();
    };

    const calculateBMI = () => {
      // 保留原有的简单BMI计算用于显示最新BMI
      if (latestBodyData.value.weight && latestBodyData.value.height) {
        const heightInM = latestBodyData.value.height / 100;
        return (latestBodyData.value.weight / (heightInM * heightInM)).toFixed(1);
      }
      return null;
    };

    const saveBodyData = async () => {
      try {
        // 验证必填字段
        if (!bodyDataForm.gender) {
          Message.warning('请选择性别');
          return;
        }
        if (!bodyDataForm.age) {
          Message.warning('请输入年龄');
          return;
        }
        if (!bodyDataForm.height) {
          Message.warning('请输入身高');
          return;
        }
        if (!bodyDataForm.weight) {
          Message.warning('请输入体重');
          return;
        }
        if (!bodyDataForm.bodyFat) {
          Message.warning('体脂率未计算，请确保所有数据填写完整');
          return;
        }

        const fitnessData = {
          weight: bodyDataForm.weight,
          bodyFat: bodyDataForm.bodyFat,
          height: bodyDataForm.height,
          dateRecorded: bodyDataForm.dateRecorded
        };

        const response = await ApiService.addFitnessData(fitnessData);
        if (response.code === 0) {
          Message.success('健身数据添加成功');
          showDataModal.value = false;

          // 重置表单
          Object.keys(bodyDataForm).forEach(key => {
            if (key === 'dateRecorded') {
              bodyDataForm[key] = new Date().toISOString().split('T')[0];
            } else if (key === 'gender') {
              bodyDataForm[key] = '';
            } else {
              bodyDataForm[key] = null;
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


    // 头像上传相关方法
    const handleBeforeUpload = (file) => {
      console.log('beforeUpload 被调用 - 选择的文件:', file);
      console.log('文件名:', file.name);
      console.log('文件类型:', file.type);
      console.log('文件大小:', file.size);

      // 文件类型验证
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        console.error('文件类型不支持:', file.type);
        Message.error('请选择 JPG、PNG 或 GIF 格式的图片');
        return false;
      }

      // 文件大小验证（2MB）
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('文件大小超限:', file.size);
        Message.error('图片大小不能超过 2MB');
        return false;
      }

      console.log('文件验证通过，开始处理...');

      // 存储选中的文件
      selectedFile.value = file;
      console.log('selectedFile 已设置:', selectedFile.value);

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target.result;
        console.log('预览URL设置成功:', previewUrl.value ? '已设置' : '设置失败');
        console.log('previewUrl长度:', e.target.result.length);
      };
      reader.onerror = (error) => {
        console.error('文件读取失败:', error);
        Message.error('文件读取失败');
      };

      console.log('开始读取文件...');
      reader.readAsDataURL(file);

      // 阻止自动上传，我们手动处理
      return false;
    };

    const triggerFileInput = () => {
      console.log('触发文件选择');
      fileInputRef.value?.click();
    };

    const handleFileSelect = (event) => {
      console.log('handleFileSelect 被调用');
      const file = event.target.files[0];

      if (!file) {
        console.log('没有选择文件');
        return;
      }

      console.log('选择的文件:', file);
      console.log('文件名:', file.name);
      console.log('文件类型:', file.type);
      console.log('文件大小:', file.size);

      // 文件类型验证
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        console.error('文件类型不支持:', file.type);
        Message.error('请选择 JPG、PNG 或 GIF 格式的图片');
        return;
      }

      // 文件大小验证（2MB）
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('文件大小超限:', file.size);
        Message.error('图片大小不能超过 2MB');
        return;
      }

      console.log('文件验证通过，开始处理...');

      // 存储选中的文件
      selectedFile.value = file;
      console.log('selectedFile 已设置:', selectedFile.value);

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target.result;
        console.log('预览URL设置成功:', previewUrl.value ? '已设置' : '设置失败');
        console.log('previewUrl长度:', e.target.result.length);
      };
      reader.onerror = (error) => {
        console.error('文件读取失败:', error);
        Message.error('文件读取失败');
      };

      console.log('开始读取文件...');
      reader.readAsDataURL(file);
    };

    const handleFileChange = (fileList, fileItem) => {
      console.log('handleFileChange 被调用');
      console.log('fileList:', fileList);
      console.log('fileItem:', fileItem);
      console.log('当前 selectedFile:', selectedFile.value);
      console.log('当前 previewUrl:', previewUrl.value ? '已设置' : '未设置');
    };

    const cancelUpload = () => {
      showAvatarUpload.value = false;
      fileList.value = [];
      previewUrl.value = '';
      uploading.value = false;
      selectedFile.value = null;
      // 清空文件输入框
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    };

    const confirmUpload = async () => {
      if (!selectedFile.value) {
        Message.error('请先选择要上传的图片');
        return;
      }

      try {
        uploading.value = true;
        const file = selectedFile.value;

        console.log('准备上传的文件:', file);

        // 第一步：上传文件到服务器
        console.log('开始上传文件...');
        const uploadResponse = await ApiService.uploadAvatar(file);

        if (uploadResponse.code !== 0) {
          throw new Error(uploadResponse.message || '文件上传失败');
        }

        const avatarUrl = uploadResponse.data;
        console.log('文件上传成功，URL:', avatarUrl);

        // 第二步：更新用户头像
        console.log('开始更新用户头像...');
        const updateResponse = await ApiService.updateAvatar(avatarUrl);

        if (updateResponse.code !== 0) {
          throw new Error(updateResponse.message || '头像更新失败');
        }

        console.log('头像更新成功');

        // 第三步：更新本地用户信息
        userInfo.value.userAvatar = avatarUrl;
        setUserInfo({ ...userInfo.value, userAvatar: avatarUrl });

        // 显示成功消息
        Message.success('头像更换成功！');

        // 关闭弹窗并清理状态
        cancelUpload();

      } catch (error) {
        console.error('头像上传失败:', error);
        Message.error(error.message || '头像上传失败，请重试');
      } finally {
        uploading.value = false;
      }
    };

    // 加载健身数据
    const loadFitnessData = async () => {
      try {
        const response = await ApiService.getMyFitnessDataByPage({
          current: 1,
          pageSize: 10  // 获取更多记录以确保有数据
        });

        if (response.code === 0 && response.data?.records?.length > 0) {
          const latest = response.data.records[0];
          latestBodyData.value = {
            weight: latest.weight,
            bodyFat: latest.bodyFat,
            bmi: latest.bmi,
            height: latest.height
          };
          console.log('健身数据加载成功:', latestBodyData.value);
        } else {
          console.log('没有健身数据记录');
          // 保持默认值
          latestBodyData.value = {
            weight: null,
            bodyFat: null,
            bmi: null,
            height: null
          };
        }
      } catch (error) {
        console.error('加载健身数据失败:', error);
        // 静默失败，保持默认值
      }
    };

    // 加载运动统计数据
    const loadExerciseStats = async () => {
      try {
        const response = await ApiService.getMyExerciseLogByPage({
          current: 1,
          pageSize: 100  // 获取足够多的数据用于统计
        });

        if (response.code === 0 && response.data?.records) {
          const records = response.data.records;
          
          // 计算统计数据
          // eslint-disable-next-line no-unused-vars
          const now = new Date();
          const uniqueDates = new Set();
          
          records.forEach(record => {
            const recordDate = new Date(record.dateRecorded);
            const dateStr = recordDate.toISOString().split('T')[0];
            uniqueDates.add(dateStr);
          });

          // 计算连续天数
          const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
          let consecutiveDays = 0;
          
          if (sortedDates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const latestDate = new Date(sortedDates[0]);
            latestDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 1) {
              consecutiveDays = 1;
              let currentDate = latestDate;
              
              for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(sortedDates[i]);
                prevDate.setHours(0, 0, 0, 0);
                
                const expectedDate = new Date(currentDate);
                expectedDate.setDate(expectedDate.getDate() - 1);
                
                if (prevDate.getTime() === expectedDate.getTime()) {
                  consecutiveDays++;
                  currentDate = prevDate;
                } else {
                  break;
                }
              }
            }
          }

          fitnessStats.value = {
            totalWorkouts: records.length,
            totalDays: uniqueDates.size,
            currentStreak: consecutiveDays
          };
        } else {
          fitnessStats.value = {
            totalWorkouts: 0,
            totalDays: 0,
            currentStreak: 0
          };
        }
      } catch (error) {
        console.error('加载运动统计失败:', error);
        fitnessStats.value = {
          totalWorkouts: 0,
          totalDays: 0,
          currentStreak: 0
        };
      }
    };

    // 初始化体重图表
    const initWeightChart = async () => {
      try {
        await nextTick();
        if (!weightChart.value) return;
        
        if (weightChartInstance) {
          weightChartInstance.dispose();
        }
        
        weightChartInstance = echarts.init(weightChart.value);
        
        // 获取趋势数据
        const response = await ApiService.getFitnessTrends(30);
        
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
                rotate: 45,
                fontSize: 11
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
                symbolSize: 6,
                data: weights,
                itemStyle: {
                  color: '#667eea'
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                    { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
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
      }
    };

    // 初始化体脂率图表
    const initBodyFatChart = async () => {
      try {
        await nextTick();
        if (!bodyFatChart.value) return;
        
        if (bodyFatChartInstance) {
          bodyFatChartInstance.dispose();
        }
        
        bodyFatChartInstance = echarts.init(bodyFatChart.value);
        
        // 获取趋势数据
        const response = await ApiService.getFitnessTrends(30);
        
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
                rotate: 45,
                fontSize: 11
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
                symbolSize: 6,
                data: bodyFats,
                itemStyle: {
                  color: '#764ba2'
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(118, 75, 162, 0.3)' },
                    { offset: 1, color: 'rgba(118, 75, 162, 0.05)' }
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
      }
    };

    // 生命周期
    onMounted(async () => {
      try {
        await loadUserInfo();
        // 串行加载，确保每个请求都完成
        await loadFitnessData();
        await loadExerciseStats();
        // 初始化图表
        await nextTick();
        await initWeightChart();
        await initBodyFatChart();
        console.log('所有数据加载完成');

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
          weightChartInstance?.resize();
          bodyFatChartInstance?.resize();
        });
      } catch (error) {
        console.error('数据加载错误:', error);
      }
    });

    return {
      userInfo,
      fitnessStats,
      latestBodyData,
      showDataModal,
      showAvatarUpload,
      bodyDataForm,
      // 图表ref
      weightChart,
      bodyFatChart,
      // 头像上传相关
      fileList,
      previewUrl,
      uploading,
      uploadRef,
      selectedFile,
      fileInputRef,
      triggerFileInput,
      handleFileSelect,
      handleBeforeUpload,
      handleFileChange,
      cancelUpload,
      confirmUpload,
      // BMI相关
      bmiResult,
      bmiCalculating,
      getBMIStatusClass,
      calculateBMIRealtime,
      // 其他方法
      getRoleText,
      formatDate,
      calculateBMI,
      saveBodyData
    };
  }
};
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
  padding-bottom: 80px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.profile-card, .body-data-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  }
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 32px;

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      :deep(svg) {
        width: 40px;
        height: 40px;
        color: white;
      }
    }
  }

  .user-info {
    flex: 1;

    h2 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .user-role {
      margin: 0 0 8px 0;
      color: #667eea;
      font-weight: 600;
      font-size: 16px;
    }

    .join-date {
      margin: 0;
      color: #999;
      font-size: 14px;
    }
  }
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 24px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;

  .stat-item {
    text-align: center;
    padding: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(svg) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.data-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 28px;

  .chart-item {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;

    &:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
      border-color: #667eea;
    }

    h4 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .chart-container {
      height: 220px;
      background: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 14px;
      border: 1px dashed #e0e0e0;
    }
  }
}

.latest-data {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid #f0f0f0;

  .data-item {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;

    &:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }

    .label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .value {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;

      .unit {
        font-size: 16px;
        font-weight: 600;
        color: #999;
        margin-left: 4px;
      }
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
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

// 头像上传弹窗样式
.avatar-upload-container {
  .current-avatar, .new-avatar {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .avatar-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(45deg, #4080ff, #40a9ff);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin: 0 auto;

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

  .upload-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .upload-area {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #4080ff;
        background: rgba(64, 128, 255, 0.02);
      }

      :deep(svg) {
        width: 48px;
        height: 48px;
        color: #999;
        margin-bottom: 16px;
      }

      .upload-text {
        p {
          margin: 0;

          &:first-child {
            font-size: 16px;
            color: #333;
            margin-bottom: 8px;
          }

          &.upload-hint {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }

  .upload-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
  }
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

// 辅助文本样式
.helper-text {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}
</style>
