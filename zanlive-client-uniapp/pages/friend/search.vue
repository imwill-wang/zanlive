<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ text.title }}</text>
				<text class="section-subtitle">{{ text.subtitle }}</text>
				<text class="field-label search-label">{{ text.placeholder }}</text>
				<input class="field-input" v-model="keyword" :placeholder="text.placeholder" />
				<view class="primary-button search-action-button" @tap="handleSearch">
					<text class="search-action-text">{{ loading ? text.searching : text.searchAction }}</text>
				</view>
			</view>

			<view v-if="searched && result == null && errorMessage.length > 0" class="section-card search-state-card">
				<text class="search-state-text">{{ errorMessage }}</text>
			</view>

			<view v-else-if="result != null" class="section-card">
				<view class="section-row search-result-row">
					<image class="search-avatar" :src="result.avatar" mode="aspectFill"></image>
					<view class="search-copy">
						<text class="search-name">{{ result.name }}</text>
						<text class="search-meta">ID: {{ result.userId }}</text>
						<text v-if="result.statusText.length > 0" class="search-desc">{{ result.statusText }}</text>
					</view>
				</view>
				<view class="search-action-row">
					<view v-if="result.relationStatus == 'SELF'" class="secondary-button search-result-button">
						<text class="search-result-secondary-text">{{ text.selfState }}</text>
					</view>
					<view v-else-if="result.canChat" class="secondary-button search-result-button" @tap="openChat">
						<text class="search-result-secondary-text">{{ text.messageAction }}</text>
					</view>
					<view v-else-if="result.canHandle" class="secondary-button search-result-button" @tap="openApplyPage">
						<text class="search-result-secondary-text">{{ text.handleAction }}</text>
					</view>
					<view v-else-if="result.canApply" class="primary-button search-result-button" @tap="handleApply">
						<text class="search-result-primary-text">{{ submitting ? text.adding : text.addAction }}</text>
					</view>
					<view v-else class="secondary-button search-result-button">
						<text class="search-result-secondary-text">{{ text.sentAction }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- #ifdef APP -->
		</scroll-view>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { applyFriend, searchFriend } from '../../services/friend'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import type { FriendSearchResult } from '../../types/user'

	type FriendSearchText = {
		title: string
		subtitle: string
		placeholder: string
		searchAction: string
		searching: string
		addAction: string
		adding: string
		sentAction: string
		handleAction: string
		messageAction: string
		selfState: string
		emptyKeyword: string
		applySuccess: string
		defaultApplyMessage: string
	}

	const localeVersion = ref(0)
	const keyword = ref('')
	const loading = ref(false)
	const searched = ref(false)
	const submitting = ref(false)
	const errorMessage = ref('')
	const result = ref<FriendSearchResult | null>(null)
	const text = reactive<FriendSearchText>({
		title: '',
		subtitle: '',
		placeholder: '',
		searchAction: '',
		searching: '',
		addAction: '',
		adding: '',
		sentAction: '',
		handleAction: '',
		messageAction: '',
		selfState: '',
		emptyKeyword: '',
		applySuccess: '',
		defaultApplyMessage: '',
	})

	function handleSearch(): void {
		if (loading.value) {
			return
		}
		if (keyword.value.trim().length == 0) {
			uni.showToast({
				title: text.emptyKeyword,
				icon: 'none',
			})
			return
		}
		loading.value = true
		searched.value = false
		errorMessage.value = ''
		result.value = null
		searchFriend(keyword.value.trim()).then((data) => {
			searched.value = true
			result.value = data
			if (data == null) {
				errorMessage.value = t('friendSearch.noResult')
			}
		}).catch((error) => {
			searched.value = true
			result.value = null
			errorMessage.value = resolveUnknownErrorMessage(error, t('friendSearch.noResult'))
		}).finally(() => {
			loading.value = false
		})
	}

	function handleApply(): void {
		if (result.value == null || !result.value.canApply || submitting.value) {
			return
		}
		submitting.value = true
		applyFriend(result.value.userId, text.defaultApplyMessage).then(() => {
			if (result.value != null) {
				result.value.relationStatus = 'APPLY_SENT'
				result.value.canApply = false
				result.value.canHandle = false
				result.value.canChat = false
			}
			uni.showToast({
				title: text.applySuccess,
				icon: 'none',
			})
		}).catch((error) => {
			uni.showToast({
				title: resolveUnknownErrorMessage(error, text.addAction),
				icon: 'none',
			})
		}).finally(() => {
			submitting.value = false
		})
	}

	function openApplyPage(): void {
		uni.navigateTo({
			url: '/pages/friend/apply',
		})
	}

	function openChat(): void {
		if (result.value == null || result.value.userId <= 0) {
			return
		}
		uni.navigateTo({
			url: '/pages/chat/session?uid=' + result.value.userId + '&name=' + encodeURIComponent(result.value.name),
		})
	}

	onShow(() => {
		localeVersion.value = i18nStore.version
		text.title = t('friendSearch.title')
		text.subtitle = t('friendSearch.subtitle')
		text.placeholder = t('friendSearch.placeholder')
		text.searchAction = t('friendSearch.searchAction')
		text.searching = t('friendSearch.searching')
		text.addAction = t('friendSearch.addAction')
		text.adding = t('friendSearch.adding')
		text.sentAction = t('friendSearch.sentAction')
		text.handleAction = t('friendSearch.handleAction')
		text.messageAction = t('friendSearch.messageAction')
		text.selfState = t('friendSearch.selfState')
		text.emptyKeyword = t('friendSearch.emptyKeyword')
		text.applySuccess = t('friendSearch.applySuccess')
		text.defaultApplyMessage = t('friendSearch.defaultApplyMessage')
		applyNavigationTitle(t('nav.friendSearch'))
	})
</script>

<style>
	.search-label {
		margin-top: 14px;
	}

	.search-action-button {
		margin-top: 16px;
	}

	.search-action-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.search-state-card {
		align-items: center;
	}

	.search-state-text {
		font-size: 15px;
		line-height: 22px;
		color: #1c1613;
		text-align: center;
	}

	.search-result-row {
		align-items: flex-start;
	}

	.search-avatar {
		width: 56px;
		height: 56px;
		border-radius: 28px;
		margin-right: 14px;
		background-color: rgba(141, 98, 72, 0.18);
		flex-shrink: 0;
	}

	.search-copy {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.search-name {
		font-size: 17px;
		font-weight: 700;
		color: #1c1613;
	}

	.search-meta {
		font-size: 12px;
		color: #7d604d;
		margin-top: 6px;
	}

	.search-desc {
		font-size: 13px;
		line-height: 20px;
		color: #3c3028;
		margin-top: 10px;
	}

	.search-action-row {
		display: flex;
		margin-top: 18px;
	}

	.search-result-button {
		flex: 1;
	}

	.search-result-primary-text {
		font-size: 13px;
		font-weight: 600;
		color: #fff9f2;
	}

	.search-result-secondary-text {
		font-size: 13px;
		font-weight: 600;
		color: #6f5544;
	}
</style>
