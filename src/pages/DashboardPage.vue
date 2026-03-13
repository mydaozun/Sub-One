<script setup lang="ts">
import { ref, watch } from 'vue';

import { DashboardHomeView } from '../features/dashboard';
import { NodeDetailsModal, NodesTabView } from '../features/nodes';
import { ProfilesTabView } from '../features/profiles';
import { SubscriptionsTabView } from '../features/subscriptions';
import { type AppTab } from '../shared/constants/navigation';
import { useDataStore } from '../stores/data';
import type { InitialData, Profile, Subscription } from '../types/index';

const props = withDefaults(
    defineProps<{
        data?: InitialData | null;
        activeTab?: AppTab;
    }>(),
    {
        data: null,
        activeTab: 'dashboard'
    }
);

const emit = defineEmits<{
    (e: 'update:activeTab', value: AppTab): void;
}>();

const dataStore = useDataStore();

const isLoading = ref(true);
const showNodeDetailsModal = ref(false);
const selectedSubscription = ref<Subscription | null>(null);
const selectedProfile = ref<Profile | null>(null);
const tabAction = ref<{ action: string; payload?: unknown } | null>(null);

const switchToTab = (tab: AppTab) => {
    emit('update:activeTab', tab);
};

const handleShowSubscriptionNodes = (subscription: Subscription) => {
    selectedSubscription.value = subscription;
    selectedProfile.value = null;
    showNodeDetailsModal.value = true;
};

const handleShowProfileNodes = (profile: Profile) => {
    selectedProfile.value = profile;
    selectedSubscription.value = null;
    showNodeDetailsModal.value = true;
};

watch(
    () => props.data,
    (data) => {
        if (data) {
            dataStore.initData(data);
        }

        isLoading.value = false;
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="isLoading" class="py-16 text-center text-gray-500">正在加载...</div>

    <div v-else class="container-optimized w-full">
        <Transition name="page-fade" mode="out-in">
            <div :key="activeTab" class="space-y-6 lg:space-y-8">
                <DashboardHomeView
                    v-if="activeTab === 'dashboard'"
                    @add-subscription="switchToTab('subscriptions')"
                    @add-node="switchToTab('nodes')"
                    @add-profile="switchToTab('profiles')"
                />

                <SubscriptionsTabView
                    v-if="activeTab === 'subscriptions'"
                    :tab-action="tabAction"
                    @show-nodes="handleShowSubscriptionNodes"
                    @action-handled="tabAction = null"
                />

                <ProfilesTabView
                    v-if="activeTab === 'profiles'"
                    :tab-action="tabAction"
                    @show-nodes="handleShowProfileNodes"
                    @action-handled="tabAction = null"
                />

                <NodesTabView
                    v-if="activeTab === 'nodes'"
                    :tab-action="tabAction"
                    @action-handled="tabAction = null"
                />
            </div>
        </Transition>
    </div>

    <NodeDetailsModal
        :show="showNodeDetailsModal"
        :subscription="selectedSubscription"
        :profile="selectedProfile"
        @update:show="showNodeDetailsModal = $event"
    />
</template>

<style scoped>
.cursor-move {
    cursor: move;
}

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

@media (max-width: 1024px) {
    .container-optimized {
        width: 100% !important;
    }
}

@media (max-width: 640px) {
    .btn-modern-enhanced {
        font-size: 0.8125rem !important;
        padding: 0.5rem 0.75rem !important;
    }

    .flex.flex-wrap.items-center.gap-3 {
        gap: 0.5rem !important;
    }
}
</style>

