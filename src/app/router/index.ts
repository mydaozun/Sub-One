import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/stores/useSessionStore';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: { guest: true }
        },
        {
            path: '/',
            component: () => import('@/app/layouts/MainLayout.vue'),
            redirect: '/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/DashboardView.vue')
                },
                {
                    path: 'subscriptions',
                    name: 'subscriptions',
                    component: () => import('@/views/SubscriptionsView.vue')
                },
                {
                    path: 'profiles',
                    name: 'profiles',
                    component: () => import('@/views/ProfilesView.vue')
                },
                {
                    path: 'nodes',
                    name: 'nodes',
                    component: () => import('@/views/NodesView.vue')
                }
            ]
        },
        // 404 捕获所有未匹配路径
        {
            path: '/:pathMatch(.*)*',
            redirect: '/dashboard'
        }
    ]
});

// 路由守卫：处理登录拦截
router.beforeEach(async (to, _from, next) => {
    const sessionStore = useSessionStore();

    // 1. 如果状态还是 loading，说明是刷新页面，尝试恢复会话
    if (sessionStore.sessionState === 'loading') {
        await sessionStore.checkSession();
    }

    const isLoggedIn = sessionStore.sessionState === 'loggedIn';
    const isNeedsSetup = sessionStore.sessionState === 'needsSetup';

    // 2. 特殊阶段：系统需要初始化（建立第一个账号）
    if (isNeedsSetup && to.name !== 'login') {
        return next({ name: 'login' });
    }

    // 3. 拦截未登录访问
    if (!to.meta.guest && !isLoggedIn && !isNeedsSetup) {
        return next({ name: 'login' });
    }

    // 4. 已登录用户访问登录页 -> 跳到首页
    if (to.name === 'login' && isLoggedIn) {
        return next({ name: 'dashboard' });
    }

    next();
});

export default router;
