<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <footer class="global-footer">
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">桂ICP备2024028689号-4</a>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import '@arco-design/web-vue/dist/arco.css';
@import './styles/main.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f0f2f5;
  height: 100%;
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 全局页脚样式
.global-footer {
  text-align: center;
  padding: 12px;
  background-color: #fff;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100;
  
  a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #4080ff;
    }
  }
}

// 页面过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
