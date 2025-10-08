<template>
  <div class="fitness-ranking" :class="{ 'dark-mode': themeStore.theme === 'dark' }">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <icon-left />
      <span>返回</span>
    </div>

    <!-- 主题切换按钮 -->
    <div class="theme-toggle" @click="themeStore.toggleTheme()">
      <transition name="icon-fade" mode="out-in">
        <icon-moon v-if="themeStore.theme === 'light'" key="moon" />
        <icon-sun v-else key="sun" />
      </transition>
    </div>

    <div class="ranking-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-icon">
          <icon-trophy />
        </div>
        <h1>健身排行榜</h1>
        <p>展示所有用户的健身成就，激励彼此进步</p>
      </div>

      <!-- 我的排名卡片 -->
      <div class="my-ranking-card" v-if="myRanking && myRanking.isOnBoard">
        <div class="card-header">
          <h3><icon-star />我的排名</h3>
          <div class="rank-badge" :class="getRankBadgeClass(myRanking.myRank)">
            #{{ myRanking.myRank }}
          </div>
        </div>
        <div class="card-content">
          <div class="stat-item">
            <div class="stat-label">积分</div>
            <div class="stat-value">{{ myRanking.myScore }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">总时长</div>
            <div class="stat-value">{{ myRanking.totalMinutes }}<span>分钟</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">总卡路里</div>
            <div class="stat-value">{{ myRanking.totalCalories }}<span>kcal</span></div>
          </div>
          <div class="stat-item">
            <div class="stat-label">超越</div>
            <div class="stat-value">{{ myRanking.beatPercent.toFixed(1) }}<span>%</span></div>
          </div>
        </div>
        <div class="card-footer">
          <div class="encourage-message">
            <icon-fire />
            <span>{{ myRanking.encourageMessage }}</span>
          </div>
          <div class="rank-change" v-if="myRanking.rankChange !== 0">
            <icon-arrow-up v-if="myRanking.rankChangeType === 'UP'" class="up" />
            <icon-arrow-down v-else class="down" />
            <span>{{ Math.abs(myRanking.rankChange) }}</span>
          </div>
        </div>
      </div>

      <!-- 未上榜提示 -->
      <div class="not-on-board" v-else-if="myRanking && !myRanking.isOnBoard">
        <icon-trophy />
        <h3>加油！继续努力</h3>
        <p>{{ myRanking.encourageMessage }}</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="statisticInfo">
        <div class="stat-card">
          <div class="stat-icon">
            <icon-user-group />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ statisticInfo.totalUsers }}</div>
            <div class="stat-text">参与用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <icon-trophy />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ statisticInfo.topScore }}</div>
            <div class="stat-text">最高积分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <icon-dashboard />
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ statisticInfo.averageScore.toFixed(0) }}</div>
            <div class="stat-text">平均积分</div>
          </div>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div class="ranking-list">
        <div class="list-header">
          <h3>排行榜</h3>
          <div class="list-controls">
            <a-radio-group v-model="currentRankingType" @change="handleRankingTypeChange">
              <a-radio value="week">本周</a-radio>
              <a-radio value="month">本月</a-radio>
            </a-radio-group>
          </div>
        </div>

        <!-- 加载中 -->
        <div class="loading-state" v-if="loading">
          <a-spin size="large" />
          <p>加载中...</p>
        </div>

        <!-- 排行榜项 -->
        <div class="ranking-items" v-else-if="rankingList.length > 0">
          <div 
            v-for="item in rankingList" 
            :key="item.userId"
            class="ranking-item"
            :class="{ 'is-me': isCurrentUser(item.userId) }"
          >
            <div class="rank-number" :class="getRankClass(item.rank)">
              <icon-trophy v-if="item.rank <= 3" />
              <span v-else>{{ item.rank }}</span>
            </div>
            <div class="user-info">
              <div class="user-avatar">
                <img v-if="item.userAvatar" :src="item.userAvatar" :alt="item.userName" />
                <icon-user v-else />
              </div>
              <div class="user-details">
                <div class="user-name">
                  {{ item.userName }}
                  <span class="me-badge" v-if="isCurrentUser(item.userId)">我</span>
                </div>
                <div class="user-stats">
                  <span class="stat-badge">{{ item.totalMinutes }}分钟</span>
                  <span class="stat-badge">{{ item.totalCalories }}kcal</span>
                </div>
              </div>
            </div>
            <div class="score-info">
              <div class="score">{{ item.score }}</div>
              <div class="score-label">积分</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-else>
          <icon-trophy />
          <p>暂无排行榜数据</p>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="total > pageSize && !loading">
          <a-pagination
            v-model:current="currentPage"
            :total="total"
            :page-size="pageSize"
            :show-total="(total) => `共 ${total} 条记录`"
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useUserStore } from '@/stores/user';
import { Message } from '@arco-design/web-vue';
import {
  IconTrophy,
  IconStar,
  IconFire,
  IconArrowUp,
  IconArrowDown,
  IconUser,
  IconUserGroup,
  IconDashboard,
  IconLeft,
  IconMoon,
  IconSun
} from '@arco-design/web-vue/es/icon';
import ApiService from '@/services/api';

export default {
  name: 'FitnessRanking',
  components: {
    IconTrophy,
    IconStar,
    IconFire,
    IconArrowUp,
    IconArrowDown,
    IconUser,
    IconUserGroup,
    IconDashboard,
    IconLeft,
    IconMoon,
    IconSun
  },
  setup() {
    const router = useRouter();
    const themeStore = useThemeStore();
    const userStore = useUserStore();

    const loading = ref(false);
    const rankingList = ref([]);
    const myRanking = ref(null);
    const statisticInfo = ref(null);
    const currentRankingType = ref('week');
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);

    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 获取当前用户ID
    const currentUserId = computed(() => {
      return userStore.userInfo?.id;
    });

    // 判断是否是当前用户
    const isCurrentUser = (userId) => {
      return userId === currentUserId.value;
    };

    // 获取排名等级样式
    const getRankClass = (rank) => {
      if (rank === 1) return 'rank-1';
      if (rank === 2) return 'rank-2';
      if (rank === 3) return 'rank-3';
      return '';
    };

    // 获取排名徽章样式
    const getRankBadgeClass = (rank) => {
      if (rank <= 3) return 'top-3';
      if (rank <= 10) return 'top-10';
      return '';
    };

    // 加载排行榜数据
    const loadRankingData = async () => {
      loading.value = true;
      try {
        const response = await ApiService.getRankingList({
          current: currentPage.value,
          pageSize: pageSize.value,
          rankingType: currentRankingType.value
        });

        if (response.code === 0 && response.data) {
          rankingList.value = response.data.records || [];
          total.value = response.data.total || 0;
          statisticInfo.value = response.data.statisticInfo || null;
        } else {
          Message.error(response.message || '获取排行榜数据失败');
        }
      } catch (error) {
        console.error('获取排行榜数据失败:', error);
        Message.error('获取排行榜数据失败');
      } finally {
        loading.value = false;
      }
    };

    // 加载我的排名
    const loadMyRanking = async () => {
      try {
        const response = await ApiService.getMyRanking(currentRankingType.value);

        if (response.code === 0 && response.data) {
          myRanking.value = response.data;
        }
      } catch (error) {
        console.error('获取我的排名失败:', error);
        // 静默失败，不显示错误消息
      }
    };

    // 切换排行榜类型
    const handleRankingTypeChange = () => {
      currentPage.value = 1;
      loadRankingData();
      loadMyRanking();
    };

    // 切换页码
    const handlePageChange = (page) => {
      currentPage.value = page;
      loadRankingData();
    };

    // 页面加载时初始化数据
    onMounted(async () => {
      await userStore.checkLoginStatus();
      if (!userStore.isLoggedIn) {
        Message.warning('请先登录');
        router.push('/login');
        return;
      }
      loadRankingData();
      loadMyRanking();
    });

    return {
      themeStore,
      loading,
      rankingList,
      myRanking,
      statisticInfo,
      currentRankingType,
      currentPage,
      pageSize,
      total,
      goBack,
      isCurrentUser,
      getRankClass,
      getRankBadgeClass,
      handleRankingTypeChange,
      handlePageChange
    };
  }
};
</script>

<style lang="scss" scoped>
.fitness-ranking {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  padding: 30px;
  position: relative;
  transition: background 0.3s ease;

  &.dark-mode {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(141, 154, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(157, 125, 197, 0.06) 0%, transparent 50%),
        linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 50px 50px, 50px 50px;
      pointer-events: none;
      opacity: 0.5;
    }
  }
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-weight: 500;
  color: #333;

  :deep(svg) {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .dark-mode & {
    background: linear-gradient(135deg, rgba(45, 48, 62, 0.98) 0%, rgba(38, 40, 52, 0.98) 100%);
    color: #e8e8e8;
    border: 1px solid rgba(141, 154, 255, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);

    &:hover {
      border-color: rgba(141, 154, 255, 0.5);
      box-shadow: 0 6px 20px rgba(141, 154, 255, 0.3);
    }
  }
}

.theme-toggle {
  position: fixed;
  top: 30px;
  right: 30px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  border: 2px solid #f0f0f0;
  
  :deep(svg) {
    width: 24px;
    height: 24px;
    color: #667eea;
    transition: all 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    
    :deep(svg) {
      color: white;
      transform: rotate(-15deg);
    }
  }
  
  .dark-mode & {
    background: linear-gradient(135deg, rgba(40, 42, 54, 0.95) 0%, rgba(32, 34, 45, 0.95) 100%);
    border: 2px solid rgba(141, 154, 255, 0.3);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(141, 154, 255, 0.15) inset;
    backdrop-filter: blur(12px);
    
    :deep(svg) {
      color: #ffd700;
      filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.5));
    }
    
    &:hover {
      background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
      box-shadow: 0 8px 28px rgba(141, 109, 178, 0.5),
                  0 0 40px rgba(141, 154, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.2);
      
      :deep(svg) {
        color: white;
        filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.4));
      }
    }
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.ranking-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.6s ease;

  .header-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;

    :deep(svg) {
      width: 40px;
      height: 40px;
      color: white;
    }
  }

  h1 {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 16px;
    color: #5a6c7d;
    margin: 0;
    font-weight: 500;
  }

  .dark-mode & {
    .header-icon {
      background: linear-gradient(135deg, #8d9aff 0%, #a58dd0 100%);
      box-shadow: 0 20px 60px rgba(141, 109, 178, 0.8),
                  0 0 80px rgba(141, 154, 255, 0.5);
      border: 3px solid rgba(141, 154, 255, 0.5);
    }

    h1 {
      color: #ffffff;
      -webkit-text-fill-color: #ffffff;
      text-shadow: 0 3px 20px rgba(141, 154, 255, 0.9),
                   0 0 50px rgba(141, 154, 255, 0.6);
    }

    p {
      color: #e8e8e8;
      text-shadow: 0 2px 8px rgba(141, 154, 255, 0.4);
    }
  }
}

.my-ranking-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s ease;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #333;

      :deep(svg) {
        width: 20px;
        height: 20px;
        color: #667eea;
      }
    }

    .rank-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

      &.top-3 {
        background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
        color: #333;
      }

      &.top-10 {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      }
    }
  }

  .card-content {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-item {
      text-align: center;

      .stat-label {
        font-size: 13px;
        color: #999;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 800;
        color: #333;

        span {
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
          margin-left: 4px;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .encourage-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #667eea;
      font-weight: 600;

      :deep(svg) {
        width: 18px;
        height: 18px;
      }
    }

    .rank-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;

      :deep(svg) {
        width: 16px;
        height: 16px;

        &.up {
          color: #52c41a;
        }

        &.down {
          color: #f5222d;
        }
      }
    }
  }

  .dark-mode & {
    background: linear-gradient(135deg, rgba(45, 48, 62, 0.98) 0%, rgba(38, 40, 52, 0.98) 100%);
    border: 2px solid rgba(141, 154, 255, 0.5);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);

    .card-header {
      h3 {
        color: #e8e8e8;
      }

      .rank-badge {
        background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
        color: white;
      }
    }

    .card-content .stat-item {
      .stat-label {
        color: #b0b0b0;
      }

      .stat-value {
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(141, 154, 255, 0.4);
      }
    }

    .card-footer {
      border-top-color: rgba(141, 154, 255, 0.2);

      .encourage-message {
        color: #a5b4ff;
      }
    }
  }
}

.not-on-board {
  background: white;
  border-radius: 16px;
  padding: 60px 24px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease;

  :deep(svg) {
    width: 60px;
    height: 60px;
    color: #ccc;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 700;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #999;
  }

  .dark-mode & {
    background: linear-gradient(135deg, rgba(45, 48, 62, 0.98) 0%, rgba(38, 40, 52, 0.98) 100%);
    border: 2px solid rgba(141, 154, 255, 0.3);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);

    :deep(svg) {
      color: #666;
    }

    h3 {
      color: #e8e8e8;
    }

    p {
      color: #b0b0b0;
    }
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  animation: slideUp 0.6s ease 0.1s both;

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(svg) {
        width: 24px;
        height: 24px;
        color: white;
      }
    }

    .stat-info {
      .stat-number {
        font-size: 28px;
        font-weight: 800;
        color: #333;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-text {
        font-size: 13px;
        color: #999;
      }
    }

    .dark-mode & {
      background: linear-gradient(135deg, rgba(45, 48, 62, 0.98) 0%, rgba(38, 40, 52, 0.98) 100%);
      border: 1px solid rgba(141, 154, 255, 0.3);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);

      &:hover {
        border-color: rgba(141, 154, 255, 0.5);
        box-shadow: 0 8px 24px rgba(141, 154, 255, 0.3);
      }

      .stat-icon {
        background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
        box-shadow: 0 4px 16px rgba(141, 109, 178, 0.5);
      }

      .stat-info {
        .stat-number {
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(141, 154, 255, 0.4);
        }

        .stat-text {
          color: #b0b0b0;
        }
      }
    }
  }
}

.ranking-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.6s ease 0.2s both;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;

    :deep(svg) {
      width: 60px;
      height: 60px;
      color: #ccc;
      margin-bottom: 16px;
    }

    p {
      margin: 16px 0 0 0;
      font-size: 14px;
    }
  }

  .ranking-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f2f5;
      transform: translateX(4px);
    }

    &.is-me {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border: 2px solid rgba(102, 126, 234, 0.3);
    }

    .rank-number {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      color: #666;
      margin-right: 16px;

      :deep(svg) {
        width: 32px;
        height: 32px;
      }

      &.rank-1 {
        color: #ffd700;
      }

      &.rank-2 {
        color: #c0c0c0;
      }

      &.rank-3 {
        color: #cd7f32;
      }
    }

    .user-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        :deep(svg) {
          width: 24px;
          height: 24px;
          color: white;
        }
      }

      .user-details {
        .user-name {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;

          .me-badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
          }
        }

        .user-stats {
          display: flex;
          gap: 8px;

          .stat-badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            font-weight: 500;
          }
        }
      }
    }

    .score-info {
      text-align: right;

      .score {
        font-size: 28px;
        font-weight: 800;
        color: #667eea;
        line-height: 1;
      }

      .score-label {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .pagination {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }

  .dark-mode & {
    background: linear-gradient(135deg, rgba(45, 48, 62, 0.98) 0%, rgba(38, 40, 52, 0.98) 100%);
    border: 2px solid rgba(141, 154, 255, 0.5);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);

    .list-header h3 {
      color: #e8e8e8;
    }

    .loading-state,
    .empty-state {
      color: #b0b0b0;

      :deep(svg) {
        color: #666;
      }
    }

    .ranking-item {
      background: rgba(50, 53, 68, 0.5);

      &:hover {
        background: rgba(60, 63, 78, 0.7);
      }

      &.is-me {
        background: linear-gradient(135deg, rgba(141, 154, 255, 0.15) 0%, rgba(157, 125, 197, 0.12) 100%);
        border-color: rgba(141, 154, 255, 0.5);
      }

      .rank-number {
        color: #b0b0b0;
      }

      .user-info {
        .user-avatar {
          background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
        }

        .user-details {
          .user-name {
            color: #e8e8e8;

            .me-badge {
              background: linear-gradient(135deg, #8d9aff 0%, #9d7dc5 100%);
            }
          }

          .user-stats .stat-badge {
            background: rgba(141, 154, 255, 0.2);
            color: #a5b4ff;
          }
        }
      }

      .score-info {
        .score {
          color: #a5b4ff;
          text-shadow: 0 2px 8px rgba(141, 154, 255, 0.4);
        }

        .score-label {
          color: #b0b0b0;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .fitness-ranking {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .my-ranking-card .card-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .ranking-item {
    .rank-number {
      width: 36px;
      height: 36px;
      font-size: 16px;

      :deep(svg) {
        width: 24px;
        height: 24px;
      }
    }

    .user-info {
      .user-avatar {
        width: 40px;
        height: 40px;
      }
    }

    .score-info .score {
      font-size: 22px;
    }
  }
}
</style>
