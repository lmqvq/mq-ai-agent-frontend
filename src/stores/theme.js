import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // 从localStorage获取初始主题，如果没有则默认为light
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    } catch (e) {
      return 'light';
    }
  };

  // 主题模式：'light' 或 'dark'
  const theme = ref(getInitialTheme());

  // 应用主题到document
  const applyTheme = (themeValue) => {
    if (typeof document === 'undefined') return;
    
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  };

  // 初始化时应用主题
  applyTheme(theme.value);

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('app-theme', theme.value);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    applyTheme(theme.value);
  };

  // 设置主题
  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      theme.value = newTheme;
      try {
        localStorage.setItem('app-theme', newTheme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e);
      }
      applyTheme(newTheme);
    }
  };

  // 计算属性
  const isDark = computed(() => theme.value === 'dark');
  const isLight = computed(() => theme.value === 'light');

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark,
    isLight
  };
});
