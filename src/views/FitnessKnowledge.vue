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
                <img 
                  :src="item.image" 
                  :alt="item.title" 
                  loading="lazy"
                  @error="handleImageError"
                />
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
                    <img 
                      :src="exercise.image" 
                      :alt="exercise.name" 
                      loading="lazy"
                      @error="handleImageError"
                    />
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
                      <img 
                        :src="meal.image" 
                        :alt="meal.name" 
                        loading="lazy"
                        @error="handleImageError"
                      />
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
    <a-modal 
      v-model:visible="showKnowledgeModal" 
      :footer="false" 
      width="900px"
      :body-style="{ padding: 0 }"
      modal-class="knowledge-modal"
    >
      <template #title>
        <div class="modal-title-simple">
          {{ selectedKnowledge?.title }}
        </div>
      </template>
      <div v-if="selectedKnowledge" class="knowledge-detail">
        <div class="detail-image-wrapper">
          <img 
            :src="selectedKnowledge.image" 
            :alt="selectedKnowledge.title" 
            class="detail-image" 
            loading="lazy"
          />
        </div>
        <div class="detail-content">
          <!-- 文章元数据 -->
          <div class="article-meta">
            <span class="difficulty-tag" :class="selectedKnowledge.difficulty">
              {{ selectedKnowledge.difficulty }}
            </span>
            <span class="meta-item">
              <icon-clock-circle /> {{ selectedKnowledge.readTime }} 分钟阅读
            </span>
            <span class="meta-item">
              <icon-eye /> {{ selectedKnowledge.views }} 次浏览
            </span>
          </div>
          <div class="content-section">
            <h4 class="section-title">
              <icon-book /> 核心内容
            </h4>
            <div class="content-text">
              <p>{{ selectedKnowledge.content }}</p>
            </div>
          </div>
          
          <div class="content-section tips-section">
            <h4 class="section-title">
              <icon-fire /> 重要提示
            </h4>
            <ul class="tips-list">
              <li v-for="(tip, index) in selectedKnowledge.tips" :key="tip" class="tip-item">
                <span class="tip-number">{{ index + 1 }}</span>
                <span class="tip-text">{{ tip }}</span>
              </li>
            </ul>
          </div>

          <div class="detail-footer">
            <div class="footer-stats">
              <div class="stat-item">
                <icon-eye class="stat-icon" />
                <div class="stat-info">
                  <div class="stat-value">{{ selectedKnowledge.views }}</div>
                  <div class="stat-label">浏览量</div>
                </div>
              </div>
              <div class="stat-item">
                <icon-clock-circle class="stat-icon" />
                <div class="stat-info">
                  <div class="stat-value">{{ selectedKnowledge.readTime }}分钟</div>
                  <div class="stat-label">阅读时间</div>
                </div>
              </div>
              <div class="stat-item">
                <icon-fire class="stat-icon" />
                <div class="stat-info">
                  <div class="stat-value">{{ selectedKnowledge.difficulty }}</div>
                  <div class="stat-label">难度等级</div>
                </div>
              </div>
            </div>
            <div class="action-buttons">
              <a-button type="outline" size="large" @click="shareKnowledge">
                <icon-share-alt /> 分享文章
              </a-button>
              <a-button type="primary" size="large" @click="printKnowledge">
                <icon-printer /> 打印保存
              </a-button>
            </div>
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
  IconEye, IconPlayArrow, IconShareAlt, IconPrinter
} from '@arco-design/web-vue/es/icon';

export default {
  name: 'FitnessKnowledge',
  components: {
    IconBook, IconTrophy, IconFire, IconHeart, IconUser, IconClockCircle, 
    IconEye, IconPlayArrow, IconShareAlt, IconPrinter
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
        image: '/images/knowledge/fitness-basics.jpg',
        difficulty: '初级',
        readTime: 5,
        views: 1234,
        content: '健身是一个循序渐进的过程。作为初学者，首先要明确自己的健身目标：是为了减脂、增肌还是提升体能？不同的目标需要不同的训练方式。建议新手从每周3-4次的全身训练开始，每次训练30-45分钟，逐步适应运动强度。记住，坚持比强度更重要，循序渐进才能避免受伤并获得长期效果。',
        tips: ['制定合理的训练计划', '注意休息和恢复', '保持饮食均衡', '学习正确的动作姿势', '记录训练进度']
      },
      {
        id: 2,
        title: '肌肉增长原理',
        description: '了解肌肉是如何增长的，掌握增肌的科学方法',
        image: '/images/knowledge/muscle-growth.jpg',
        difficulty: '中级',
        readTime: 8,
        views: 856,
        content: '肌肉增长（肌肥大）需要三个关键因素：机械张力、肌肉损伤和代谢压力。通过阻力训练造成肌纤维微损伤，身体在恢复期通过蛋白质合成修复并增强肌纤维。渐进式超负荷是增肌的核心原则——持续增加训练强度、重量或次数，迫使肌肉适应更大的负荷。同时，充足的蛋白质摄入（每公斤体重1.6-2.2克）和高质量睡眠（7-9小时）是肌肉恢复和生长的必要条件。',
        tips: ['保证充足的蛋白质摄入（体重kg×1.8-2.2g）', '渐进式超负荷训练', '充足的睡眠（7-9小时）', '训练后48-72小时恢复期', '适度热量盈余（300-500kcal/天）']
      },
      {
        id: 3,
        title: '科学减脂攻略',
        description: '掌握正确的减脂方法，健康高效地降低体脂率',
        image: '/images/knowledge/fat-loss.jpg',
        difficulty: '初级',
        readTime: 7,
        views: 2341,
        content: '减脂的核心原理是热量缺口，即消耗的热量大于摄入的热量。建议每日热量赤字控制在300-500卡，这样每周可以减重0.5-1kg，既能保持肌肉量，又能持续减脂。结合力量训练和有氧运动效果最佳：力量训练维持肌肉量提高基础代谢，有氧运动增加热量消耗。避免过度节食，保证每日蛋白质摄入（1.8-2.2g/kg体重），多吃蔬菜水果和全谷物，控制精制碳水和高脂肪食物。',
        tips: ['每日热量赤字300-500卡', '保持高蛋白饮食', '结合力量训练和有氧', '每周减重0.5-1kg为宜', '多喝水保持代谢', '避免极端节食']
      },
      {
        id: 4,
        title: '核心力量训练的重要性',
        description: '强大的核心是一切运动的基础，提升运动表现和预防损伤',
        image: '/images/knowledge/core-training.jpg',
        difficulty: '初级',
        readTime: 6,
        views: 1567,
        content: '核心肌群包括腹肌、背部肌群、骨盆底肌和髋部肌群，它们像身体的"动力中枢"，负责稳定脊柱、传递力量和保持平衡。强大的核心不仅能让你拥有好看的腹肌，更能提升所有运动的表现，减少下背痛和运动损伤风险。核心训练应该包括抗伸展（平板支撑）、抗旋转（侧平板）、抗屈曲（死虫式）等多个维度，而不仅仅是传统的仰卧起坐。',
        tips: ['每周2-3次核心专项训练', '注重动作质量而非数量', '包含多角度核心动作', '呼吸与动作配合', '从静态到动态逐步进阶']
      },
      {
        id: 5,
        title: '运动后恢复的科学',
        description: '正确的恢复方法能让你训练效果翻倍，避免过度训练',
        image: '/images/knowledge/recovery.jpg',
        difficulty: '中级',
        readTime: 9,
        views: 1123,
        content: '恢复和训练同样重要。肌肉在休息时生长，而非训练时。充足睡眠是最佳恢复方式，深度睡眠时生长激素分泌达到峰值。运动后30分钟内是"黄金窗口期"，及时补充蛋白质和碳水化合物能加速肌肉修复。主动恢复如轻度有氧、拉伸、泡沫轴按摩能促进血液循环，加速代谢废物排出。过度训练的信号包括：持续疲劳、表现下降、睡眠质量差、情绪低落，出现这些症状应立即休息调整。',
        tips: ['保证每晚7-9小时高质量睡眠', '训练后及时补充营养', '主动恢复：拉伸、泡沫轴', '每周至少1-2天完全休息', '关注过度训练信号', '保持充足水分摄入']
      },
      {
        id: 6,
        title: '柔韧性与活动度训练',
        description: '改善柔韧性和关节活动度，提升运动表现并减少受伤风险',
        image: '/images/knowledge/flexibility.jpg',
        difficulty: '初级',
        readTime: 6,
        views: 892,
        content: '柔韧性是指肌肉的延展能力，而活动度是指关节的运动范围。良好的柔韧性和活动度能让你完成更标准的动作，激活更多肌肉纤维，同时降低拉伤和关节损伤风险。训练前应进行动态拉伸（如腿部摆动、臂部环绕）来激活肌肉和提高关节活动度；训练后则进行静态拉伸，每个部位保持15-30秒，促进肌肉放松和恢复。瑜伽和普拉提也是提升柔韧性的绝佳选择。',
        tips: ['训练前动态拉伸激活', '训练后静态拉伸放松', '每个拉伸保持15-30秒', '呼吸自然不要憋气', '循序渐进避免过度拉伸', '将柔韧训练纳入常规计划']
      },
      {
        id: 7,
        title: '健身常见误区解析',
        description: '避开这些健身误区，让你的训练事半功倍',
        image: '/images/knowledge/myths.jpg',
        difficulty: '初级',
        readTime: 7,
        views: 1876,
        content: '误区1：局部减脂——脂肪消耗是全身性的，无法通过某个部位的训练来减掉该部位的脂肪。误区2：女性力量训练会变壮——女性睾酮水平远低于男性，适度力量训练只会让身材更紧致。误区3：出汗越多效果越好——出汗只是调节体温，与燃脂效果无直接关系。误区4：蛋白质越多越好——过量蛋白质无法被利用，还会增加肾脏负担。误区5：每天训练效果更好——肌肉需要休息恢复，过度训练反而适得其反。',
        tips: ['减脂需要全身性方案', '女性应该进行力量训练', '关注训练质量而非出汗量', '蛋白质适量即可', '合理安排休息日', '避免盲目跟风']
      },
      {
        id: 8,
        title: '如何突破健身平台期',
        description: '当进步停滞时，这些策略能帮你重新突破',
        image: '/images/knowledge/plateau.jpg',
        difficulty: '高级',
        readTime: 10,
        views: 745,
        content: '平台期是每个健身者都会遇到的挑战。身体适应了当前训练强度后，进步会变慢甚至停滞。突破方法：1.改变训练变量（重量、次数、组数、休息时间）；2.尝试新的训练方法（超级组、递减组、金字塔训练）；3.调整训练频率和分化方式；4.增加或减少训练量；5.检查饮食和睡眠是否充足；6.deload周（降低训练强度让身体完全恢复）。记住，有时候退一步是为了进两步。',
        tips: ['定期改变训练计划（每4-6周）', '尝试不同的训练方法', '每6-8周安排deload周', '重新评估饮食和恢复', '保持训练日志追踪进度', '保持耐心和信心']
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
            image: '/images/exercises/push-up.jpg',
            muscleGroup: '胸肌',
            difficulty: '初级',
            instructions: [
              '双手撑地与肩同宽，手指朝前',
              '身体从头到脚保持一条直线，核心收紧',
              '弯曲手肘下降身体，直到胸部接近地面',
              '保持肘部与身体约45度角',
              '用力推起至起始位置，胸肌主动发力'
            ],
            tips: ['保持核心收紧避免塌腰', '动作要缓慢控制避免下落过快', '下降时吸气，推起时呼气', '初学者可从跪姿俯卧撑开始', '保持颈部中立不要低头或仰头']
          },
          {
            id: 2,
            name: '哑铃卧推',
            description: '最有效的胸肌增长动作，可独立训练两侧胸肌',
            image: '/images/exercises/dumbbell-press.jpg',
            muscleGroup: '胸肌',
            difficulty: '中级',
            instructions: [
              '仰卧在平板凳上，双脚踏实地面',
              '双手各握一个哑铃，举至胸部上方',
              '缓慢下放哑铃至胸部两侧，感受胸肌拉伸',
              '大臂与身体约45度角',
              '用力推起哑铃至起始位置，胸肌主动收缩'
            ],
            tips: ['选择合适重量，保证动作质量', '下放时吸气，推起时呼气', '保持肩胛骨后收下沉', '避免手腕过度弯曲', '哑铃轨迹呈弧线而非直线']
          },
          {
            id: 3,
            name: '双杠臂屈伸',
            description: '上胸和下胸的极佳训练动作，被称为"上肢深蹲"',
            image: '/images/exercises/dips.jpg',
            muscleGroup: '胸肌下部',
            difficulty: '中级',
            instructions: [
              '双手撑在双杠上，身体悬空',
              '身体略前倾，激活胸肌',
              '弯曲手肘缓慢下降，直到肩部低于肘部',
              '胸肌发力推起身体回到起始位置',
              '全程保持身体稳定控制'
            ],
            tips: ['身体前倾练胸，直立练肱三头肌', '初学者可使用弹力带辅助', '避免肩部过度前伸', '下降时吸气，推起时呼气', '循序渐进增加下降深度']
          }
        ]
      },
      {
        id: 2,
        name: '背部训练',
        exercises: [
          {
            id: 4,
            name: '引体向上',
            description: '背部训练的王者动作，全面强化背部肌群',
            image: '/images/exercises/pull-up.jpg',
            muscleGroup: '背阔肌',
            difficulty: '中级',
            instructions: [
              '正手抓住单杠，手距略宽于肩',
              '身体悬空，肩胛骨下沉后收',
              '背部肌群发力，将身体向上拉',
              '直到下巴超过单杠或胸部接近单杠',
              '控制速度缓慢下降至起始位置'
            ],
            tips: ['避免耳耘就肩，保持肩部下沉', '用背部发力而非手臂', '下降时不要完全放松', '初学者可使用弹力带辅助', '每次都要做到全程运动']
          },
          {
            id: 5,
            name: '哑铃划船',
            description: '增加背部厚度的经典动作，可单侧训练',
            image: '/images/exercises/dumbbell-row.jpg',
            muscleGroup: '背阔肌中部',
            difficulty: '初级',
            instructions: [
              '单手和同侧膝盖支撑在平板凳上',
              '另一只手抓住哑铃，手臂自然下垂',
              '保持背部平直，核心稳定',
              '将哑铃向上拉至髋部侧面，手肘贴近身体',
              '挤压肩胛骨，然后控制下放'
            ],
            tips: ['手肘贴近身体，不要外展', '上拉时呼气，下放时吸气', '背部全程保持平直', '不要用惯性甩动哑铃', '感受背部肌群发力']
          },
          {
            id: 6,
            name: '硬拉',
            description: '全身力量的综合动作，强化后侧链肌群',
            image: '/images/exercises/deadlift.jpg',
            muscleGroup: '下背/腿后',
            difficulty: '高级',
            instructions: [
              '双脚与髋同宽站立，杠铃置于脚前',
              '弯曲髋部下蹲，背部保持自然中立',
              '双手正反握或正手掌抓住杠铃',
              '腿部和背部同时发力，上拉杠铃',
              '站直后肩胛骨后收，然后控制下放'
            ],
            tips: ['保持背部中立，不要弓背', '动作开始时杠铃贴近胫骨', '上拉时呼气，下放时吸气', '初学者一定要请教练指导', '选择合适重量，不要勉强']
          }
        ]
      },
      {
        id: 3,
        name: '腿部训练',
        exercises: [
          {
            id: 7,
            name: '深蹲',
            description: '力量训练之王，全面发展下肢力量',
            image: '/images/exercises/squat.jpg',
            muscleGroup: '股四头肌/臀大肌',
            difficulty: '中级',
            instructions: [
              '双脚与肩同宽或略宽，脚尖微向外',
              '杠铃放在斜方肌上，不要压在颈植上',
              '胸部挺起，核心稳定，眼睛直视前方',
              '屈髋屈膝下蹲，直至大腿与地面平行或以下',
              '腿部发力站起，髋部前顶回到起始位置'
            ],
            tips: ['膝盖与脚尖方向一致', '下蹲时吸气，站起时呼气', '保持胸部挺起不要前倾', '重心放在脚跟中部', '初学者先掌握徒手深蹲']
          },
          {
            id: 8,
            name: '弓步蹲',
            description: '单腿训练动作，改善左右力量不平衡',
            image: '/images/exercises/lunge.jpg',
            muscleGroup: '股四头肌/臀部',
            difficulty: '初级',
            instructions: [
              '站直，双脚并龙，双手叉腰或持哑铃',
              '一腿向前跨一大步',
              '下蹲直到后腿膝盖接近地面',
              '前腿大腿与地面平行，膝盖不超过脚尖',
              '前腿发力站起，回到起始位置后换腿'
            ],
            tips: ['保持身体直立不要前倾', '前腿膝盖与脚尖方向一致', '下蹲时吸气，站起时呼气', '可以行走弓步或原地弓步', '注意保持平衡和控制']
          },
          {
            id: 9,
            name: '罗马尼亚硬拉',
            description: '专注腿后侧链和臀部的高效动作',
            image: '/images/exercises/rdl.jpg',
            muscleGroup: '腿后侧链/臀大肌',
            difficulty: '中级',
            instructions: [
              '双脚与髋同宽站立，正手抓住杠铃',
              '肩胛骨后收，背部保持自然中立',
              '髋部向后推，身体以髋为轴前屈',
              '感受腿后侧拉伸，直到杠铃到小腿中部',
              '髋部和腿后侧发力，站直身体'
            ],
            tips: ['背部全程保持中立，不要弓背', '髋部主动向后推', '膝盖微屈但不大幅弯曲', '感受腿后侧和臀部发力', '返回时髋部前顶']
          }
        ]
      },
      {
        id: 4,
        name: '肩部训练',
        exercises: [
          {
            id: 10,
            name: '哑铃推举',
            description: '打造饱满三角肌的首选动作',
            image: '/images/exercises/shoulder-press.jpg',
            muscleGroup: '三角肌',
            difficulty: '中级',
            instructions: [
              '坐姿或站姿，双手各持一个哑铃',
              '哑铃举至肩部两侧，掌心朝前',
              '垂直向上推起哑铃至手臂伸直',
              '顶峰略停，感受三角肌收缩',
              '控制速度下放至起始位置'
            ],
            tips: ['保持核心稳定，避免塌腰', '不要完全锁死手肘', '推起时呼气，下放时吸气', '手肘略在手腕前方', '避免肩部过度耸动']
          },
          {
            id: 11,
            name: '侧平举',
            description: '针对三角肌中束的孤立动作',
            image: '/images/exercises/lateral-raise.jpg',
            muscleGroup: '三角肌中束',
            difficulty: '初级',
            instructions: [
              '站立，双手各持一个哑铃置于身体两侧',
              '保持手肘微屈，身体直立',
              '以三角肌发力，将哑铃向两侧举起',
              '直到手臂与地面平行或略高',
              '控制下放至起始位置'
            ],
            tips: ['不要用惯性甩动哑铃', '手肘略高于手腕', '上举时呼气，下放时吸气', '选择较轻重量保证动作质量', '感受三角肌中束发力']
          },
          {
            id: 12,
            name: '俯身飞鸟',
            description: '强化三角肌后束和上背部',
            image: '/images/exercises/rear-delt-fly.jpg',
            muscleGroup: '三角肌后束',
            difficulty: '初级',
            instructions: [
              '俦身前屈或坐在平板凳边缘',
              '双手各持哑铃，手臂自然下垂',
              '保持背部平直，手肘微屈',
              '以三角肌后束发力，将哑铃向两侧后上方举起',
              '顶峰收缩肩胛骨，然后控制下放'
            ],
            tips: ['避免用手臂代偿发力', '挖压肩胛骨增强刺激', '上举时呼气，下放时吸气', '保持背部中立不要弓背', '选择较轻重量保证动作质量']
          }
        ]
      },
      {
        id: 5,
        name: '手臂训练',
        exercises: [
          {
            id: 13,
            name: '哑铃弯举',
            description: '打造肱二头肌峰值的经典动作',
            image: '/images/exercises/bicep-curl.jpg',
            muscleGroup: '肱二头肌',
            difficulty: '初级',
            instructions: [
              '站立，双手各持哑铃，手臂自然下垂',
              '保持大臂贴近身体，不要摆动',
              '以肱二头肌发力，弯曲手肘向上卷起哑铃',
              '直到哑铃接近肩部，顶峰收缩',
              '控制下放至起始位置'
            ],
            tips: ['大臂保持固定不要摆动', '不要用身体借力摇摆', '卷起时呼气，下放时吸气', '控制下放速度增强离心收缩', '可尝试交替弯举或锤式弯举']
          },
          {
            id: 14,
            name: '绳索下压',
            description: '塑造肱三头肌线条的首选动作',
            image: '/images/exercises/tricep-pushdown.jpg',
            muscleGroup: '肱三头肌',
            difficulty: '初级',
            instructions: [
              '站在缆绳器械前，双手抓住绳索或把手',
              '大臂贴近身体两侧，手肘弯曲的90度',
              '以肱三头肌发力，向下推伸直手臂',
              '顶峰收缩肱三头肌，留在下方略停',
              '控制速度返回起始位置'
            ],
            tips: ['大臂紧贴身体不要离开', '只移动前臂，大臂固定', '下压时呼气，返回时吸气', '不要用身体重量压下去', '感受肱三头肌的收缩和拉伸']
          }
        ]
      },
      {
        id: 6,
        name: '核心训练',
        exercises: [
          {
            id: 15,
            name: '平板支撑',
            description: '最佳核心稳定性训练动作',
            image: '/images/exercises/plank.jpg',
            muscleGroup: '核心肌群',
            difficulty: '初级',
            instructions: [
              '俯卧，前臂支撑地面，手肘位于肩部下方',
              '双脚后伸，脚尖支撑',
              '身体从头到脚保持一条直线',
              '核心紧缩，臀部不要下沉或抬高',
              '保持该姿势30-60秒或更长'
            ],
            tips: ['呼吸保持均匀不要憋气', '颈部保持中立，眼睛看地面', '不要塌腰或拱背', '初学者从短时间开始逐步增加', '感受核心肌群的持续紧张']
          },
          {
            id: 16,
            name: '俄罗斯转体',
            description: '强化腹斜肌和旋转力量的动作',
            image: '/images/exercises/russian-twist.jpg',
            muscleGroup: '腹斜肌',
            difficulty: '中级',
            instructions: [
              '坐在地上，双腿微屈上抬，上身后倾45度',
              '双手合十或持哑铃置于胸前',
              '保持身体稳定，上身向左右两侧旋转',
              '手部或哑铃轻触地面，感受腹斜肌收缩',
              '左右交替进行'
            ],
            tips: ['保持腿部稳定不要摇摆', '用核心力量旋转而非手臂', '呼吸保持规律', '初学者可以脚跟着地', '动作要控制不要过快']
          },
          {
            id: 17,
            name: '死虫式',
            description: '下背痛恩星，安全高效的核心训练',
            image: '/images/exercises/dead-bug.jpg',
            muscleGroup: '腹直肌/核心',
            difficulty: '初级',
            instructions: [
              '仰卧，双手垂直上举，双腿屈膝90度抬起',
              '下背贴地，核心紧缩',
              '同时伸展对侧手臂和腿部',
              '保持下背始终贴地',
              '返回起始位置后换另一侧'
            ],
            tips: ['下背全程贴地不要拱起', '动作缓慢控制', '呼吸保持均匀', '腹部持续紧缩', '自如不能全伸直可先小范围']
          }
        ]
      }
    ];

    const nutrients = [
      {
        id: 1,
        name: '蛋白质',
        description: '肌肉生长和修复的基础，建议每公斤体重摄入1.8-2.2克',
        color: '#ff7875',
        icon: 'icon-fire',
        benefits: ['肌肉合成与修复', '增强饱腹感', '维持免疫系统', '促进代谢', '保持肌肉量']
      },
      {
        id: 2,
        name: '碳水化合物',
        description: '身体的主要能量来源，为训练提供燃料和促进肌糖原恢复',
        color: '#ffa940',
        icon: 'icon-fire',
        benefits: ['提供训练能量', '促进肌糖原恢复', '节省蛋白质', '提高训练表现', '支持大脑功能']
      },
      {
        id: 3,
        name: '健康脂肪',
        description: '激素合成、维生素吸收的必需营养素，占总热量20-30%',
        color: '#ffc53d',
        icon: 'icon-heart',
        benefits: ['激素分泌平衡', '脂溶性维生素吸收', '抗炎作用', '保护关节健康', '增强饱腹感']
      },
      {
        id: 4,
        name: '维生素与矿物质',
        description: '微量营养素支持各项生理功能，对健身者尤其重要',
        color: '#95de64',
        icon: 'icon-star',
        benefits: ['支持能量代谢', '增强免疫力', '骨骼健康', '肌肉收缩功能', '抗氧化保护']
      },
      {
        id: 5,
        name: '水分',
        description: '生命之源，建议每日3-4升，训练时需增加摄入',
        color: '#69c0ff',
        icon: 'icon-droplet',
        benefits: ['维持体温调节', '营养物质转运', '关节润滑', '代谢废物排出', '预防运动疲劳']
      },
      {
        id: 6,
        name: '补剂与运动营养',
        description: '合理使用补剂可以辅助训练，但不能替代真实食物',
        color: '#b37feb',
        icon: 'icon-experiment',
        benefits: ['方便补充蛋白质', '提高训练表现', '加速恢复过程', '弥补饮食不足', '优化身体成分']
      }
    ];

    const mealPlans = [
      {
        id: 1,
        name: '增肌能量早餐',
        type: '早餐',
        description: '高蛋白、适量碳水的增肌早餐搭配：燕麦粥+鸡蛋+香蕉+坚果',
        image: '/images/breakfast.jpg',
        calories: 520,
        protein: 30,
        carbs: 55,
        fat: 15
      },
      {
        id: 2,
        name: '训练前能量餐',
        type: '训练前',
        description: '提供持久能量的训练前餐：全麦面包+花生酱+香蕉+咖啡',
        image: '/images/pre-workout.jpg',
        calories: 380,
        protein: 15,
        carbs: 65,
        fat: 8
      },
      {
        id: 3,
        name: '训练后恢复餐',
        type: '训练后',
        description: '黄金窗口期营养：蛋白粉+葡萄汁+香蕉+麦片',
        image: '/images/post-workout.jpg',
        calories: 420,
        protein: 35,
        carbs: 50,
        fat: 5
      },
      {
        id: 4,
        name: '增肌主食午餐',
        type: '午餐',
        description: '均衡营养的增肌午餐：鸡胸肉+糙米+西兰花+甘蔗',
        image: '/images/lunch.jpg',
        calories: 650,
        protein: 45,
        carbs: 70,
        fat: 15
      },
      {
        id: 5,
        name: '减脂清淡午餐',
        type: '午餐',
        description: '高蛋白低脂的减脂餐：三文鱼+藜麦+混合蔬菜沙拉',
        image: '/images/diet-lunch.jpg',
        calories: 480,
        protein: 40,
        carbs: 45,
        fat: 12
      },
      {
        id: 6,
        name: '高蛛白晚餐',
        type: '晚餐',
        description: '促进夜间恢复的晚餐：牛肉+红薯+芦笋+蔬菜',
        image: '/images/dinner.jpg',
        calories: 580,
        protein: 42,
        carbs: 50,
        fat: 18
      },
      {
        id: 7,
        name: '轻食主义沙拉餐',
        type: '晚餐',
        description: '低热量高营养：烤鸡胸沙拉+牛油果+藜麦+橄榄油',
        image: '/images/salad.jpg',
        calories: 420,
        protein: 35,
        carbs: 30,
        fat: 20
      },
      {
        id: 8,
        name: '健康加餐小食',
        type: '加餐',
        description: '补充能量的健康小食：希腊酸奶+水果+坚果+蜂蜜',
        image: '/images/snack.jpg',
        calories: 280,
        protein: 15,
        carbs: 28,
        fat: 12
      },
      {
        id: 9,
        name: '素食蛋白餐',
        type: '午餐',
        description: '素食者高蛋白选择：豆腐+鹹嘴豆+糙米+混合蔬菜',
        image: '/images/vegan.jpg',
        calories: 500,
        protein: 28,
        carbs: 60,
        fat: 14
      },
      {
        id: 10,
        name: '快速便携餐',
        type: '加餐',
        description: '忙碌时的快速补充：全麦三明治+牛奶+鸡蛋+香蕉',
        image: '/images/quick-meal.jpg',
        calories: 450,
        protein: 25,
        carbs: 50,
        fat: 16
      },
      {
        id: 11,
        name: '低碳高蛛白餐',
        type: '晚餐',
        description: '减脂期低碳餐：三文鱼+水煮鸡蛋+牛油果+芦笋',
        image: '/images/low-carb.jpg',
        calories: 380,
        protein: 45,
        carbs: 15,
        fat: 18
      },
      {
        id: 12,
        name: '高热量增重餐',
        type: '午餐',
        description: '增重期高热量餐：義大利面+肉丸+芝士+橄榄油',
        image: '/images/mass-gain.jpg',
        calories: 850,
        protein: 40,
        carbs: 95,
        fat: 28
      }
    ];

    const trainingPrograms = [
      {
        id: 1,
        name: '新手全身训练',
        description: '适合健身初学者的全身训练计划，每周三练，每次45分钟',
        type: 'beginner',
        icon: 'icon-user',
        duration: '8周',
        intensity: '低-中等',
        level: '初级',
        schedule: [
          { day: '周一', content: '全身力量：深蹲、俯卧撑、哑铃划船、平板支撑' },
          { day: '周三', content: '轻度有氧+柔韧拉伸，30分钟慢跑或快走' },
          { day: '周五', content: '全身力量：弓步蹲、哑铃卧推、引体向上、俄罗斯转体' },
          { day: '周六', content: '活动性恢复：瑜伽或散步' },
          { day: '其他时间', content: '完全休息或轻度活动' }
        ]
      },
      {
        id: 2,
        name: '上下肢分化训练',
        description: '经典的上下肢分化计划，适合有一定基础的训练者',
        type: 'intermediate',
        icon: 'icon-fire',
        duration: '12周',
        intensity: '中-高等',
        level: '中级',
        schedule: [
          { day: '周一', content: '上肢：胸+肱三头肌 - 卧推、双杠臂屈伸、飞鸟、下压' },
          { day: '周二', content: '下肢：腿+核心 - 深蹲、硬拉、弓步蹲、提跟、平板' },
          { day: '周四', content: '上肢：背+肱二头肌 - 引体向上、划船、硬拉、弯举' },
          { day: '周五', content: '下肢：腿+核心 - 前蹲、腿弯举、腿屈伸、RDL、核心组合' },
          { day: '周六', content: '上肢：肩+核心 - 推举、侧平举、俯身飞鸟、核心训练' },
          { day: '周日', content: '完全休息或轻度有氧' }
        ]
      },
      {
        id: 3,
        name: 'PPL推拉腿分化',
        description: '高效的推拉腿分化计划，适合中高级训练者',
        type: 'advanced',
        icon: 'icon-trophy',
        duration: '16周+',
        intensity: '高等',
        level: '中高级',
        schedule: [
          { day: '周一', content: '推：胸+肩+肱三 - 卧推、上斜卧推、推举、侧平举' },
          { day: '周二', content: '拉：背+肱二 - 引体向上、划船、硬拉、弯举、锤式弯举' },
          { day: '周三', content: '腿：股四+腿后+臀 - 深蹲、RDL、腿举、腿弯举、提跟' },
          { day: '周四', content: '推：胸+肩+肱三 - 不同角度和动作变化' },
          { day: '周五', content: '拉：背+肱二 - 不同角度和动作变化' },
          { day: '周六', content: '腿：股四+腿后+臀 - 不同角度和动作变化' },
          { day: '周日', content: '完全休息或主动恢复' }
        ]
      },
      {
        id: 4,
        name: '减脂塑形计划',
        description: '结合力量和有氧的减脂计划，保持肌肉同时减脂',
        type: 'fat-loss',
        icon: 'icon-fire',
        duration: '12周',
        intensity: '中-高等',
        level: '初中级',
        schedule: [
          { day: '周一', content: '全身力量 + 20分钟HIIT' },
          { day: '周二', content: '中等强度有氧 40分钟（快走/轻跑）' },
          { day: '周三', content: '上肢力量 + 15分钟核心' },
          { day: '周四', content: '中等强度有氧 40分钟（单车/游泳）' },
          { day: '周五', content: '下肢力量 + 20分钟HIIT' },
          { day: '周六', content: '活动性恢复：轻度有氧 30分钟' },
          { day: '周日', content: '完全休息' }
        ]
      },
      {
        id: 5,
        name: '力量举训绅计划',
        description: '专注于提升三大项（深蹲、卧推、硬拉）的力量',
        type: 'strength',
        icon: 'icon-trophy',
        duration: '12-16周',
        intensity: '高等',
        level: '中高级',
        schedule: [
          { day: '周一', content: '深蹲日：主项深蹲 + 辅助动作（前蹲、腿举）' },
          { day: '周二', content: '卧推日：主项卧推 + 辅助动作（上斜、双杠）' },
          { day: '周四', content: '硬拉日：主项硬拉 + 辅助动作（RDL、划船）' },
          { day: '周五', content: '辅助训练：肩、手臂、核心' },
          { day: '其他时间', content: '休息恢复和柔韧训练' }
        ]
      },
      {
        id: 6,
        name: '居家徒手训练',
        description: '不需要器械的徒手训练计划，随时随地训练',
        type: 'bodyweight',
        icon: 'icon-user',
        duration: '8周',
        intensity: '中等',
        level: '初中级',
        schedule: [
          { day: '周一', content: '上肢推：俯卧撑变式、三头撰臂屈伸、冲刺波比' },
          { day: '周二', content: '下肢：徒手深蹲、弓步蹲、单腿深蹲、提跟' },
          { day: '周三', content: '核心：平板变式、山式跑、俄罗斯转体、卧卷腹' },
          { day: '周四', content: '上肢拉：反手俯卧撑、引体向上（有条件）、超人式' },
          { day: '周五', content: '下肢+核心：跳跃深蹲、波比跳、登山者、平板支撑' },
          { day: '周六', content: '全身循环：组合全身动作进行循环训练' },
          { day: '周日', content: '休息或轻度拉伸/瑜伽' }
        ]
      },
      {
        id: 7,
        name: '女性美体塑形',
        description: '针对女性的全面塑形计划，侧重臀腿和核心',
        type: 'female',
        icon: 'icon-heart',
        duration: '12周',
        intensity: '中等',
        level: '初中级',
        schedule: [
          { day: '周一', content: '下肢+臀：深蹲、臀桥、弓步蹲、蚹壳式' },
          { day: '周二', content: '上肢+核心：哑铃卧推、划船、推举、核心训练' },
          { day: '周三', content: '有氧+柔韧：瑜伽或普拉提 60分钟' },
          { day: '周四', content: '下肢+臀：单腿深蹲、RDL、臀冲、腿外展' },
          { day: '周五', content: '全身循环+有氧：循环训练 + 20分钟HIIT' },
          { day: '周六', content: '轻度有氧：慢跑、单车或游泳 40分钟' },
          { day: '周日', content: '休息或活动性恢复' }
        ]
      },
      {
        id: 8,
        name: '职场人士快速训练',
        description: '适合时间紧张的上班族，每次30-40分钟高效训练',
        type: 'busy',
        icon: 'icon-clock-circle',
        duration: '8周',
        intensity: '中-高等',
        level: '初中级',
        schedule: [
          { day: '周一', content: '全身复合：深蹲+卧推+划船 3轮循环 30分钟' },
          { day: '周三', content: 'HIIT训练：波比、登山者、跳跃深蹲 25分钟' },
          { day: '周五', content: '全身力量：硬拉+推举+引体向上 3轮 35分钟' },
          { day: '周六/日', content: '轻度活动：散步、瑜伽或休息' }
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

    // 图片加载错误处理
    const handleImageError = (event) => {
      // 使用渐变色占位图
      event.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      event.target.style.display = 'flex';
      event.target.style.alignItems = 'center';
      event.target.style.justifyContent = 'center';
      event.target.alt = '图片加载失败';
    };

    // 分享文章
    const shareKnowledge = () => {
      if (selectedKnowledge.value) {
        const text = `${selectedKnowledge.value.title} - ${selectedKnowledge.value.description}`;
        if (navigator.share) {
          navigator.share({
            title: selectedKnowledge.value.title,
            text: text,
            url: window.location.href
          });
        } else {
          // 复制到剪贴板
          navigator.clipboard.writeText(text).then(() => {
            console.log('已复制到剪贴板');
          });
        }
      }
    };

    // 打印文章
    const printKnowledge = () => {
      window.print();
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
      viewProgramDetails,
      handleImageError,
      shareKnowledge,
      printKnowledge
    };
  }
};
</script>

<style lang="scss" scoped>
// 图片加载优化
img {
  // 渐进式加载效果
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  
  &.loaded,
  &[loading="lazy"] {
    opacity: 1;
  }
  
  // 图片加载时的背景
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  // 图片加载失败时的样式
  &[alt="图片加载失败"] {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
  }
}

.fitness-knowledge {
  min-height: 100vh;
  background: #ffffff;
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
  color: #1a1a1a;

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
    background: #f5f5f5;
    padding: 8px;
    border-radius: 16px;

    .nav-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      color: #666666;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;

      :deep(svg) {
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: #1a1a1a;
        background: #e8e8e8;
      }

      &.active {
        color: #ffffff;
        background: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
    border-color: #667eea;

    &::before {
      transform: scaleX(1);
    }

    .card-image img {
      transform: scale(1.05);
    }
  }

  .card-image {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-overlay {
      position: absolute;
      top: 16px;
      right: 16px;

      .difficulty-badge {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        &.初级 {
          background: linear-gradient(135deg, rgba(0, 180, 42, 0.95) 0%, rgba(0, 214, 143, 0.95) 100%);
        }

        &.中级 {
          background: linear-gradient(135deg, rgba(255, 125, 0, 0.95) 0%, rgba(255, 169, 64, 0.95) 100%);
        }

        &.高级 {
          background: linear-gradient(135deg, rgba(245, 63, 63, 0.95) 0%, rgba(255, 120, 117, 0.95) 100%);
        }
      }
    }
  }

  .card-content {
    padding: 24px;
    background: white;

    h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 12px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;

      span {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #999;
        font-weight: 500;

        :deep(svg) {
          width: 14px;
          height: 14px;
          color: #667eea;
        }
      }
    }

    .arco-btn {
      width: 100%;
      height: 42px;
      font-size: 15px;
      font-weight: 500;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      position: relative;

      &::after {
        content: '→';
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        transition: transform 0.3s ease;
      }

      &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);

        &::after {
          transform: translateY(-50%) translateX(4px);
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

// 知识详情弹窗样式
// 修复 Modal 默认样式
:deep(.knowledge-modal) {
  .arco-modal-header {
    padding: 24px 32px !important;
    border-bottom: 1px solid #f0f0f0;
  }
}

// 简化的标题样式
.modal-title-simple {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
}

.knowledge-detail {
  .detail-image-wrapper {
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(to top, rgba(255, 255, 255, 1), transparent);
    }
  }

  .detail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-content {
    padding: 32px;
    background: white;

    // 文章元数据
    .article-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%);
      border-radius: 12px;
      border: 1px solid #e8e8ff;
      margin-bottom: 32px;

      .difficulty-tag {
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        color: white;

        &.初级 {
          background: linear-gradient(135deg, #00b42a 0%, #00d68f 100%);
        }

        &.中级 {
          background: linear-gradient(135deg, #ff7d00 0%, #ffa940 100%);
        }

        &.高级 {
          background: linear-gradient(135deg, #f53f3f 0%, #ff7875 100%);
        }
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #666;
        font-size: 14px;
        font-weight: 500;

        :deep(svg) {
          width: 16px;
          height: 16px;
          color: #667eea;
        }
      }
    }

    .content-section {
      margin-bottom: 32px;

      &:last-of-type {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
        padding-bottom: 12px;
        border-bottom: 2px solid #f0f0f0;

        :deep(svg) {
          width: 20px;
          height: 20px;
          color: #667eea;
        }
      }

      .content-text {
        p {
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: #333;
          text-align: justify;
          text-indent: 2em;
        }
      }
    }

    .tips-section {
      background: linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e8e8ff;

      .section-title {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 16px;
      }

      .tips-list {
        margin: 0;
        padding: 0;
        list-style: none;

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
          transition: all 0.3s ease;

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          }

          .tip-number {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            font-size: 14px;
            font-weight: 600;
          }

          .tip-text {
            flex: 1;
            font-size: 15px;
            line-height: 1.6;
            color: #333;
          }
        }
      }
    }

    .detail-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;

      .footer-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%);
          border-radius: 12px;
          border: 1px solid #e8e8ff;

          .stat-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
            flex-shrink: 0;

            :deep(svg) {
              width: 20px;
              height: 20px;
            }
          }

          .stat-info {
            flex: 1;

            .stat-value {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 2px;
            }

            .stat-label {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }

      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        .arco-btn {
          height: 48px;
          font-size: 15px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;

          :deep(svg) {
            margin-right: 6px;
          }

          &[type="outline"] {
            border: 2px solid #667eea;
            color: #667eea;

            &:hover {
              background: #667eea;
              color: white;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
            }
          }

          &[type="primary"] {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;

            &:hover {
              opacity: 0.9;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
          }
        }
      }
    }
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

  .knowledge-detail {
    .detail-image-wrapper {
      height: 250px;
    }

    .detail-content {
      padding: 20px;

      .content-section {
        margin-bottom: 24px;

        .content-text p {
          font-size: 15px;
        }
      }

      .tips-section {
        padding: 16px;

        .tips-list .tip-item {
          padding: 12px;

          .tip-text {
            font-size: 14px;
          }
        }
      }
    }
  }

  .modal-title-wrapper {
    h3 {
      font-size: 20px;
    }

    .title-meta {
      flex-wrap: wrap;
      gap: 8px;
      font-size: 12px;
    }
  }
}
</style>
