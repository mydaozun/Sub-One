<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';

import { storeToRefs } from 'pinia';

import ConfirmModal from '../../../shared/components/ui/ConfirmModal.vue';
import BatchActionToolbar from '../../../shared/components/ui/BatchActionToolbar.vue';
import EmptyState from '../../../shared/components/ui/EmptyState.vue';
import MoreMenu from '../../../shared/components/ui/MoreMenu.vue';
import Pagination from '../../../shared/components/ui/Pagination.vue';
import { useBatchSelection } from '../../../shared/composables/useBatchSelection';
import { usePagination } from '../../../shared/composables/usePagination';
import { useTabActionTrigger } from '../../../shared/composables/useTabActionTrigger';
import { useDataStore } from '../../../stores/data';
import { useToastStore } from '../../../stores/toast';
import type { Profile } from '../../../types/index';
import ProfileCard from '../components/ProfileCard.vue';

const props = defineProps<{
    tabAction?: { action: string } | null;
}>();

const emit = defineEmits<{
    (e: 'show-nodes', profile: Profile): void;
    (e: 'action-handled'): void;
}>();

// Async components
const ProfileModal = defineAsyncComponent(() => import('../components/ProfileModal.vue'));

// Utils
const { showToast } = useToastStore();
const dataStore = useDataStore();
const { profiles, subscriptions, manualNodes, config } = storeToRefs(dataStore);
const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProfiles,
    changePage,
    resetPage
} = usePagination(computed(() => profiles.value), 9);

// Modal States
const showProfileModal = ref(false);
const isNewProfile = ref(false);
const editingProfile = ref<Profile | null>(null);

// Export Modal
const SubscriptionExportModal = defineAsyncComponent(
    () => import('../components/SubscriptionExportModal.vue')
);
const showExportModal = ref(false);
const exportingProfile = ref<Profile | null>(null);

const showDeleteSingleProfileModal = ref(false);
const showDeleteAllProfilesModal = ref(false);
const deletingItemId = ref<string | null>(null);
const profilesMoreMenuItems = [
    { key: 'batch-delete', label: '批量删除' },
    { key: 'clear-all', label: '清空所有', danger: true, dividerBefore: true }
];

// Batch Select
const {
    isBatchDeleteMode,
    selectedCount,
    toggleBatchDeleteMode,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    invertSelection,
    getSelectedIds
} = useBatchSelection(paginatedProfiles);

// Handlers

const handleAddProfile = () => {
    if (!config.value.profileToken?.trim()) {
        return showToast('⚠️ 请先在"设置"中配置"订阅组分享Token"', 'error');
    }
    isNewProfile.value = true;
    editingProfile.value = {
        id: '',
        name: '',
        enabled: true,
        subscriptions: [],
        manualNodes: [],
        customId: '',
        type: 'base64'
    };
    showProfileModal.value = true;
};

const handleEditProfile = (profileId: string) => {
    const profile = profiles.value.find((p) => p.id === profileId);
    if (profile) {
        isNewProfile.value = false;
        editingProfile.value = JSON.parse(JSON.stringify(profile));
        showProfileModal.value = true;
    }
};

const handleSaveProfile = async (profileData: Profile) => {
    if (!profileData?.name) return showToast('⚠️ 订阅组名称不能为空', 'error');

    const success = await (isNewProfile.value
        ? dataStore.addProfile(profileData)
        : dataStore.updateProfile(profileData));

    if (success) {
        showProfileModal.value = false;
        if (isNewProfile.value) {
            resetPage();
        }
    }
};

const handleDeleteProfile = (profileId: string) => {
    deletingItemId.value = profileId;
    showDeleteSingleProfileModal.value = true;
};

const handleConfirmDeleteSingleProfile = async () => {
    if (!deletingItemId.value) return;
    await dataStore.deleteProfile(deletingItemId.value);
    showDeleteSingleProfileModal.value = false;
};

const handleDeleteAllProfiles = async () => {
    await dataStore.deleteAllProfiles();
    showDeleteAllProfilesModal.value = false;
};

const handleBatchDelete = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    await dataStore.batchDeleteProfiles(ids);
    toggleBatchDeleteMode(); // Exit batch mode
    deselectAll();
};

const handleToggleProfile = async (profile: Profile) => {
    await dataStore.toggleProfile(profile.id, profile.enabled);
};

const handleCopyLink = (id: string) => {
    const profile = profiles.value.find((p) => p.id === id);
    if (!profile) return;

    exportingProfile.value = profile;
    showExportModal.value = true;
};

// UI Handlers
const handleToggleBatchDeleteMode = () => {
    toggleBatchDeleteMode();
};

const deleteSelected = async () => {
    if (selectedCount.value === 0) return;
    const idsToDelete = getSelectedIds();
    await handleBatchDelete(idsToDelete);
};

const handleProfilesMoreMenuSelect = (key: string) => {
    if (key === 'batch-delete') {
        handleToggleBatchDeleteMode();
    }

    if (key === 'clear-all') {
        showDeleteAllProfilesModal.value = true;
    }
};

useTabActionTrigger(
    computed(() => props.tabAction),
    'add',
    () => {
        handleAddProfile();
        emit('action-handled');
    }
);
</script>

<template>
    <div class="w-full">
        <div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex-1"></div>
            <div class="ml-auto flex flex-wrap items-center gap-2">
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        class="btn-modern-enhanced btn-add transform px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 sm:px-5 sm:py-2.5 sm:text-sm"
                        @click="handleAddProfile"
                    >
                        新增
                    </button>
                    <MoreMenu
                        :items="profilesMoreMenuItems"
                        width-class="w-36"
                        @select="handleProfilesMoreMenuSelect"
                    />
                </div>
            </div>
        </div>

        <BatchActionToolbar
            :visible="isBatchDeleteMode"
            :selected-count="selectedCount"
            accent="purple"
            @select-all="selectAll"
            @invert-selection="invertSelection"
            @deselect-all="deselectAll"
            @delete-selected="deleteSelected"
            @cancel="handleToggleBatchDeleteMode"
        />

        <div
            v-if="profiles.length > 0"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
        >
            <ProfileCard
                v-for="profile in paginatedProfiles"
                :key="profile.id"
                :profile="profile"
                :all-subscriptions="subscriptions"
                :is-batch-mode="isBatchDeleteMode"
                :is-selected="isSelected(profile.id)"
                @edit="handleEditProfile(profile.id)"
                @delete="handleDeleteProfile(profile.id)"
                @change="handleToggleProfile"
                @copy-link="handleCopyLink(profile.id)"
                @show-nodes="$emit('show-nodes', profile)"
                @toggle-select="toggleSelection(profile.id)"
            />
        </div>
        <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @change-page="changePage"
        />
        <EmptyState
            v-if="profiles.length === 0"
            title="没有订阅组"
            description="创建一个订阅组来组合你的节点吧！"
            bg-gradient-class="bg-linear-to-br from-purple-500/20 to-pink-500/20"
            icon-color-class="text-purple-500"
        >
            <template #icon>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-12 w-12 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            </template>
        </EmptyState>

        <!-- Modals -->
        <ProfileModal
            v-if="showProfileModal"
            v-model:show="showProfileModal"
            :profile="editingProfile"
            :is-new="isNewProfile"
            :all-subscriptions="subscriptions"
            :all-manual-nodes="manualNodes"
            size="2xl"
            @save="handleSaveProfile"
        />

        <ConfirmModal
            v-model:show="showDeleteSingleProfileModal"
            title="确认删除订阅组"
            message="您确定要删除此订阅组吗？此操作不可逆。"
            type="danger"
            @confirm="handleConfirmDeleteSingleProfile"
        />

        <ConfirmModal
            v-model:show="showDeleteAllProfilesModal"
            title="确认清空订阅组"
            message="您确定要删除所有<strong>订阅组</strong>吗？此操作不可逆。"
            type="danger"
            @confirm="handleDeleteAllProfiles"
        />

        <!-- Export Modal -->
        <SubscriptionExportModal
            v-if="showExportModal && exportingProfile"
            v-model:show="showExportModal"
            :profile="exportingProfile"
            :config="config"
        />
    </div>
</template>

