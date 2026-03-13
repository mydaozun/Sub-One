<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';

import { storeToRefs } from 'pinia';

import Footer from './shared/components/layout/AppFooter.vue';
import Sidebar from './shared/components/layout/AppSidebar.vue';
import Toast from './shared/components/ui/Toast.vue';
import { useDataCounts } from './shared/composables/useDataCounts';
import { APP_TABS, type AppTab } from './shared/constants/navigation';
import Dashboard from './pages/DashboardPage.vue';
import Login from './pages/LoginPage.vue';
import { useLayoutStore } from './stores/layout';
import { useSessionStore } from './stores/session';
import { useThemeStore } from './stores/theme';
import { useUIStore } from './stores/ui';

const SettingsModal = defineAsyncComponent(() =>
    import('./features/settings').then((module) => module.SettingsModal)
);
const HelpModal = defineAsyncComponent(() =>
    import('./features/settings').then((module) => module.HelpModal)
);

const sessionStore = useSessionStore();
const themeStore = useThemeStore();
const layoutStore = useLayoutStore();
const uiStore = useUIStore();

const { sessionState, initialData } = storeToRefs(sessionStore);
const { checkSession, initializeSystem, login, logout } = sessionStore;

const { subscriptionsCount, profilesCount, manualNodesCount } = useDataCounts(initialData);

const activeTab = ref<AppTab>('dashboard');
const showHelpModal = ref(false);

const isLoggedIn = computed(() => sessionState.value === 'loggedIn');
const isLoadingSession = computed(() => sessionState.value === 'loading');
const isNeedsSetup = computed(() => sessionState.value === 'needsSetup');
const currentTabInfo = computed(() => APP_TABS[activeTab.value] ?? APP_TABS.dashboard);

const openSettings = () => {
    uiStore.show();
};

const openHelp = () => {
    showHelpModal.value = true;
};

onMounted(() => {
    themeStore.initTheme();
    layoutStore.init();
    checkSession();
});
</script>

<template>
    <div class="app-container">
        <div v-if="!isLoggedIn" class="login-page">
            <div v-if="isLoadingSession" class="loading-container">
                <div class="loading-spinner-wrapper">
                    <div class="loading-spinner-outer"></div>
                    <div class="loading-spinner-inner"></div>
                </div>
                <p class="loading-text">正在加载...</p>
            </div>

            <div v-else-if="isNeedsSetup" class="login-form-container">
                <Login :login="initializeSystem" :is-setup="true" />
            </div>

            <div v-else class="login-form-container">
                <Login :login="login" />
            </div>
        </div>

        <div v-else class="dashboard-container">
            <Sidebar
                v-model="activeTab"
                :subscriptions-count="subscriptionsCount"
                :profiles-count="profilesCount"
                :manual-nodes-count="manualNodesCount"
                @logout="logout"
                @settings="openSettings"
                @help="openHelp"
            />

            <main class="main-content" :class="{ 'main-content-full': layoutStore.sidebarCollapsed }">
                <div class="content-wrapper">
                    <header class="page-header">
                        <div class="header-content">
                            <div class="header-text">
                                <h1 class="page-title">{{ currentTabInfo.title }}</h1>
                                <p class="page-description">{{ currentTabInfo.description }}</p>
                            </div>
                        </div>
                    </header>

                    <div class="dashboard-content">
                        <Dashboard v-model:active-tab="activeTab" :data="initialData" />
                    </div>

                    <Footer class="dashboard-footer" />
                </div>
            </main>
        </div>

        <Toast />
        <SettingsModal v-model:show="uiStore.isSettingsModalVisible" />
        <HelpModal v-if="showHelpModal" v-model:show="showHelpModal" />
    </div>
</template>

