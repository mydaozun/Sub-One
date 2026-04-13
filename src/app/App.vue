<script setup lang="ts">
/**
 * ==================== 应用根组件 ====================
 *
 * 功能说明：
 * - 应用入口和根挂载点
 * - 全局状态初始化 (Theme, Layout, Session)
 * - 全局组件挂载 (Toast)
 *
 * ====================================================
 */
import { onMounted } from 'vue';
import { useThemeStore } from '@/stores/useThemeStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import Toast from '@/common/ui/Toast.vue';

const themeStore = useThemeStore();
const layoutStore = useLayoutStore();

onMounted(async () => {
    // 1. 初始化主题和布局状态
    themeStore.initTheme();
    layoutStore.init();
});
</script>

<template>
    <div id="app-root">
        <!-- 路由出口 -->
        <router-view />
        
        <!-- 全局通知组件 -->
        <Toast />
    </div>
</template>

<style>
#app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* 页面切换动画的基础全局定义 */
.page-fade-enter-active,
.page-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.page-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>
