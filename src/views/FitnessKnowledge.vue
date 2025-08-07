<template>
  <div class="fitness-knowledge">
    <div class="knowledge-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1><icon-book />健身知识库</h1>
        <p>专业的健身知识，科学的训练方法，助您成为健身达人</p>
      </div>

      <!-- 知识分类导航 -->
      <div class="category-nav">
        <div class="nav-tabs">
          <div 
            v-for="category in categories" 
            :key="category.id"
            :class="['nav-tab', { active: activeCategory === category.id }]"
            @click="activeCategory = category.id"
          >
            <component :is="category.icon" />
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 知识内容区域 -->
      <div class="knowledge-content">
        <!-- 基础知识 -->
        <div v-if="activeCategory === 'basics'" class="content-section">
          <div class="knowledge-grid">
            <div v-for="item in basicsKnowledge" :key="item.id" class="knowledge-card">
              <div class="card-image">
                <img :src="item.image" :alt="item.title" />
                <div class="card-overlay">
                  <div class="difficulty-badge" :class="item.difficulty.toLowerCase()">
                    {{ item.difficulty }}
                  </div>
                </div>
              </div>
              <div class="card-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <div class="card-meta">
                  <span><icon-clock-circle />{{ item.readTime }}分钟阅读</span>
                  <span><icon-eye />{{ item.views }}次浏览</span>
                </div>
                <a-button type="primary" @click="viewKnowledge(item)">
                  阅读详情
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 动作指导 -->
        <div v-if="activeCategory === 'exercises'" class="content-section">
          <div class="exercise-categories">
            <div v-for="exerciseType in exerciseTypes" :key="exerciseType.id" class="exercise-type">
              <h3>{{ exerciseType.name }}</h3>
              <div class="exercise-grid">
                <div v-for="exercise in exerciseType.exercises" :key="exercise.id" class="exercise-card">
                  <div class="exercise-image">
                    <img :src="exercise.image" :alt="exercise.name" />
                    <div class="play-button" @click="playExerciseVideo(exercise)">
                      <icon-play-arrow />
                    </div>
                  </div>
                  <div class="exercise-info">
                    <h4>{{ exercise.name }}</h4>
                    <p>{{ exercise.description }}</p>
                    <div class="exercise-details">
                      <span class="muscle-group">{{ exercise.muscleGroup }}</span>
                      <span class="difficulty" :class="exercise.difficulty.toLowerCase()">
                        {{ exercise.difficulty }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 营养知识 -->
        <div v-if="activeCategory === 'nutrition'" class="content-section">
          <div class="nutrition-sections">
            <div class="nutrition-overview">
              <h3>营养基础知识</h3>
              <div class="nutrition-cards">
                <div v-for="nutrient in nutrients" :key="nutrient.id" class="nutrient-card">
                  <div class="nutrient-icon" :style="{ backgroundColor: nutrient.color }">
                    <component :is="nutrient.icon" />
                  </div>
                  <div class="nutrient-info">
                    <h4>{{ nutrient.name }}</h4>
                    <p>{{ nutrient.description }}</p>
                    <div class="nutrient-benefits">
                      <span v-for="benefit in nutrient.benefits" :key="benefit" class="benefit-tag">
                        {{ benefit }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="meal-plans">
              <h3>推荐饮食计划</h3>
              <div class="meal-grid">
                <div v-for="meal in mealPlans" :key="meal.id" class="meal-card">
                  <div class="meal-header">
                    <h4>{{ meal.name }}</h4>
                    <span class="meal-type">{{ meal.type }}</span>
                  </div>
                  <div class="meal-content">
                    <div class="meal-image">
                      <img :src="meal.image" :alt="meal.name" />
                    </div>
                    <div class="meal-details">
                      <p>{{ meal.description }}</p>
                      <div class="nutrition-facts">
                        <div class="fact">
                          <span class="label">卡路里</span>
                          <span class="value">{{ meal.calories }}kcal</span>
                        </div>
                        <div class="fact">
                          <span class="label">蛋白质</span>
                          <span class="value">{{ meal.protein }}g</span>
                        </div>
                        <div class="fact">
                          <span class="label">碳水</span>
                          <span class="value">{{ meal.carbs }}g</span>
                        </div>
                        <div class="fact">
                          <span class="label">脂肪</span>
                          <span class="value">{{ meal.fat }}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 训练计划 -->
        <div v-if="activeCategory === 'training'" class="content-section">
          <div class="training-programs">
            <div v-for="program in trainingPrograms" :key="program.id" class="program-card">
              <div class="program-header">
                <div class="program-icon" :class="program.type">
                  <component :is="program.icon" />
                </div>
                <div class="program-info">
                  <h3>{{ program.name }}</h3>
                  <p>{{ program.description }}</p>
                  <div class="program-meta">
                    <span><icon-clock-circle />{{ program.duration }}</span>
                    <span><icon-fire />{{ program.intensity }}</span>
                    <span><icon-user />{{ program.level }}</span>
                  </div>
                </div>
              </div>
              <div class="program-content">
                <div class="program-schedule">
                  <h4>训练安排</h4>
                  <div class="schedule-list">
                    <div v-for="day in program.schedule" :key="day.day" class="schedule-item">
                      <div class="day-label">{{ day.day }}</div>
                      <div class="day-content">{{ day.content }}</div>
                    </div>
                  </div>
                </div>
                <div class="program-actions">
                  <a-button type="primary" @click="startProgram(program)">
                    开始训练
                  </a-button>
                  <a-button type="outline" @click="viewProgramDetails(program)">
                    查看详情
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识详情弹窗 -->
    <a-modal v-model:visible="showKnowledgeModal" :title="selectedKnowledge?.title" width="800px">
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <img :src="selectedKnowledge.image" :alt="selectedKnowledge.title" class="detail-image" />
        <div class="detail-content">
          <p>{{ selectedKnowledge.content }}</p>
          <div class="detail-tips">
            <h4>重要提示</h4>
            <ul>
              <li v-for="tip in selectedKnowledge.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 运动视频弹窗 -->
    <a-modal v-model:visible="showVideoModal" :title="selectedExercise?.name" width="800px">
      <div v-if="selectedExercise" class="video-content">
        <div class="video-placeholder">
          <icon-play-arrow />
          <p>{{ selectedExercise.name }}动作演示视频</p>
        </div>
        <div class="exercise-instructions">
          <h4>动作要领</h4>
          <ol>
            <li v-for="instruction in selectedExercise.instructions" :key="instruction">
              {{ instruction }}
            </li>
          </ol>
          <div class="exercise-tips">
            <h4>注意事项</h4>
            <ul>
              <li v-for="tip in selectedExercise.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref } from 'vue';
import { 
  IconBook, IconTrophy, IconFire, IconHeart, IconUser, IconClockCircle, 
  IconEye, IconPlayArrow 
} from '@arco-design/web-vue/es/icon';

export default {
  name: 'FitnessKnowledge',
  components: {
    IconBook, IconTrophy, IconFire, IconHeart, IconUser, IconClockCircle, 
    IconEye, IconPlayArrow
  },
  setup() {
    const activeCategory = ref('basics');
    const showKnowledgeModal = ref(false);
    const showVideoModal = ref(false);
    const selectedKnowledge = ref(null);
    const selectedExercise = ref(null);

    const categories = [
      { id: 'basics', name: '基础知识', icon: 'icon-book' },
      { id: 'exercises', name: '动作指导', icon: 'icon-trophy' },
      { id: 'nutrition', name: '营养知识', icon: 'icon-heart' },
      { id: 'training', name: '训练计划', icon: 'icon-fire' }
    ];

    const basicsKnowledge = [
      {
        id: 1,
        title: '健身入门指南',
        description: '新手必读的健身基础知识，从零开始学习健身',
        image: '/images/fitness-basics.jpg',
        difficulty: '初级',
        readTime: 5,
        views: 1234,
        content: '健身是一个循序渐进的过程...',
        tips: ['制定合理的训练计划', '注意休息和恢复', '保持饮食均衡']
      },
      {
        id: 2,
        title: '肌肉增长原理',
        description: '了解肌肉是如何增长的，掌握增肌的科学方法',
        image: '/images/muscle-growth.jpg',
        difficulty: '中级',
        readTime: 8,
        views: 856,
        content: '肌肉增长需要三个关键因素...',
        tips: ['保证充足的蛋白质摄入', '渐进式超负荷训练', '充足的睡眠']
      }
    ];

    const exerciseTypes = [
      {
        id: 1,
        name: '胸部训练',
        exercises: [
          {
            id: 1,
            name: '俯卧撑',
            description: '经典的胸部训练动作，适合各个水平的健身者',
            image: '/images/push-up.jpg',
            muscleGroup: '胸肌',
            difficulty: '初级',
            instructions: ['双手撑地，身体保持直线', '下降至胸部接近地面', '用力推起至起始位置'],
            tips: ['保持核心收紧', '动作要缓慢控制', '呼吸要规律']
          }
        ]
      }
    ];

    const nutrients = [
      {
        id: 1,
        name: '蛋白质',
        description: '肌肉生长和修复的重要营养素',
        color: '#ff7875',
        icon: 'icon-fire',
        benefits: ['肌肉增长', '组织修复', '免疫功能']
      }
    ];

    const mealPlans = [
      {
        id: 1,
        name: '增肌早餐',
        type: '早餐',
        description: '高蛋白、适量碳水的增肌早餐搭配',
        image: '/images/breakfast.jpg',
        calories: 450,
        protein: 25,
        carbs: 35,
        fat: 18
      }
    ];

    const trainingPrograms = [
      {
        id: 1,
        name: '新手全身训练',
        description: '适合健身初学者的全身训练计划',
        type: 'beginner',
        icon: 'icon-user',
        duration: '4周',
        intensity: '中等',
        level: '初级',
        schedule: [
          { day: '周一', content: '全身力量训练' },
          { day: '周三', content: '有氧运动' },
          { day: '周五', content: '全身力量训练' }
        ]
      }
    ];

    const viewKnowledge = (knowledge) => {
      selectedKnowledge.value = knowledge;
      showKnowledgeModal.value = true;
    };

    const playExerciseVideo = (exercise) => {
      selectedExercise.value = exercise;
      showVideoModal.value = true;
    };

    const startProgram = (program) => {
      console.log('开始训练计划:', program.name);
    };

    const viewProgramDetails = (program) => {
      console.log('查看计划详情:', program.name);
    };

    return {
      activeCategory,
      showKnowledgeModal,
      showVideoModal,
      selectedKnowledge,
      selectedExercise,
      categories,
      basicsKnowledge,
      exerciseTypes,
      nutrients,
      mealPlans,
      trainingPrograms,
      viewKnowledge,
      playExerciseVideo,
      startProgram,
      viewProgramDetails
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-knowledge {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 80px;
}

.knowledge-container {
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

.category-nav {
  margin-bottom: 32px;

  .nav-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px;
    border-radius: 16px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);

    .nav-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;

      :deep(svg) {
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        color: white;
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.knowledge-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.knowledge-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .card-image {
    position: relative;
    height: 200px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-overlay {
      position: absolute;
      top: 12px;
      right: 12px;

      .difficulty-badge {
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

  .card-content {
    padding: 20px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .card-meta {
      display: flex;
      gap: 16px;
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
  }
}

.exercise-categories {
  .exercise-type {
    margin-bottom: 32px;

    h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      padding-bottom: 8px;
      border-bottom: 2px solid #4080ff;
    }
  }
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.exercise-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .exercise-image {
    position: relative;
    height: 180px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(64, 128, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      :deep(svg) {
        width: 24px;
        height: 24px;
        color: white;
      }

      &:hover {
        background: rgba(64, 128, 255, 1);
        transform: translate(-50%, -50%) scale(1.1);
      }
    }
  }

  .exercise-info {
    padding: 16px;

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

    .exercise-details {
      display: flex;
      gap: 8px;

      .muscle-group {
        padding: 2px 8px;
        background: #f0f2f5;
        border-radius: 12px;
        font-size: 12px;
        color: #666;
      }

      .difficulty {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        color: white;

        &.初级 {
          background: #00b42a;
        }

        &.中级 {
          background: #ff7d00;
        }

        &.高级 {
          background: #f53f3f;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .knowledge-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .exercise-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .knowledge-grid, .exercise-grid {
    grid-template-columns: 1fr;
  }

  .category-nav .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .knowledge-content {
    padding: 20px;
  }
}
</style>
