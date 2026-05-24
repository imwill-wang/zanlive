<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ text.title }}</text>
				<text class="section-subtitle">{{ text.subtitle }}</text>
			</view>
			<view v-if="loading" class="section-card apply-state-card">
				<text class="apply-state-text">{{ text.loading }}</text>
			</view>
			<view v-else-if="errorMessage.length > 0" class="section-card apply-state-card">
				<text class="apply-state-text">{{ errorMessage }}</text>
				<view class="primary-button apply-state-action" @tap="loadApplyList">
					<text class="apply-state-action-text">{{ retryText }}</text>
				</view>
			</view>
			<view v-else-if="applyList.length == 0" class="section-card apply-state-card">
				<text class="apply-state-text">{{ text.empty }}</text>
			</view>
			<view v-for="item in applyList" :key="item.id" class="section-card">
				<view class="section-row apply-head-row">
					<view class="apply-user-row">
						<image class="apply-avatar" :src="item.avatar" mode="aspectFill"></image>
						<view class="apply-copy">
							<text class="friend-name">{{ item.name }}</text>
							<text class="apply-id-text" @tap="copyUserId(item.userId)">ID: {{ item.userId }}</text>
							<text class="meta-text">{{ item.createdAt }}</text>
						</view>
					</view>
					<view class="apply-tag-group">
						<text class="apply-direction-tag">{{ resolveDirectionText(item.direction) }}</text>
						<text class="apply-status-tag">{{ resolveStatusText(item.status) }}</text>
					</view>
				</view>
				<text class="apply-message">{{ item.message.length > 0 ? item.message : text.emptyMessage }}</text>
				<text v-if="item.handleAt.length > 0 && item.status != 'PENDING'" class="meta-text">{{ item.handleAt }}</text>
				<view v-if="canAccept(item) || canReject(item) || canChat(item)" class="apply-action-row">
					<view v-if="canReject(item)" class="outline-button apply-action-button" @tap="handleReject(item)">
						<text class="apply-action-outline-text">{{ processingId == item.id && processingAction == 'reject' ? text.rejecting : text.reject }}</text>
					</view>
					<view v-if="canAccept(item)" class="primary-button apply-action-button" @tap="handleAccept(item)">
						<text class="apply-action-primary-text">{{ processingId == item.id && processingAction == 'accept' ? text.accepting : text.accept }}</text>
					</view>
					<view v-if="canChat(item)" class="secondary-button apply-action-button" @tap="openChat(item)">
						<text class="apply-action-secondary-text">{{ text.messageAction }}</text>
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
	import { acceptFriendApply, getFriendApplyList, rejectFriendApply } from '../../services/friend'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import type { FriendApplyItem } from '../../types/user'

	type FriendApplyText = {
		title: string
		subtitle: string
		loading: string
		empty: string
		emptyMessage: string
		accept: string
		reject: string
		accepting: string
		rejecting: string
		incoming: string
		outgoing: string
		statusPending: string
		statusAccepted: string
		statusRejected: string
		messageAction: string
	}

	const localeVersion = ref(0)
	const text = reactive<FriendApplyText>({
		title: '',
		subtitle: '',
		loading: '',
		empty: '',
		emptyMessage: '',
		accept: '',
		reject: '',
		accepting: '',
		rejecting: '',
		incoming: '',
		outgoing: '',
		statusPending: '',
		statusAccepted: '',
		statusRejected: '',
		messageAction: '',
	})
	const applyList = ref<FriendApplyItem[]>([])
	const loading = ref(false)
	const errorMessage = ref('')
	const retryText = ref('')
	const processingId = ref(0)
	const processingAction = ref<'accept' | 'reject' | ''>('')

	function loadApplyList(): void {
		loading.value = true
		errorMessage.value = ''
		getFriendApplyList().then((list) => {
			applyList.value = list
		}).catch((error) => {
			applyList.value = []
			errorMessage.value = resolveUnknownErrorMessage(error, text.loading)
		}).finally(() => {
			loading.value = false
		})
	}

	function canAccept(item: FriendApplyItem): boolean {
		return item.direction == 'IN' && item.status == 'PENDING'
	}

	function canReject(item: FriendApplyItem): boolean {
		return item.direction == 'IN' && item.status == 'PENDING'
	}

	function canChat(item: FriendApplyItem): boolean {
		return item.status == 'ACCEPTED' && item.userId > 0
	}

	function resolveDirectionText(direction: FriendApplyItem['direction']): string {
		return direction == 'IN' ? text.incoming : text.outgoing
	}

	function resolveStatusText(status: FriendApplyItem['status']): string {
		if (status == 'ACCEPTED') {
			return text.statusAccepted
		}
		if (status == 'REJECTED') {
			return text.statusRejected
		}
		return text.statusPending
	}

	function openChat(item: FriendApplyItem): void {
		if (item.userId <= 0) {
			return
		}
		uni.navigateTo({
			url: '/pages/chat/session?uid=' + item.userId + '&name=' + encodeURIComponent(item.name),
		})
	}

	function copyUserId(id: number): void {
		if (id <= 0) {
			return
		}
		uni.setClipboardData({
			data: id.toString(),
			success: () => {
				uni.showToast({
					title: t('common.copySuccess'),
					icon: 'none',
				})
			},
		})
	}

	function handleAccept(item: FriendApplyItem): void {
		if (!canAccept(item) || processingId.value > 0) {
			return
		}
		processingId.value = item.id
		processingAction.value = 'accept'
		acceptFriendApply(item.id, item.userId, item.name).then(() => {
			uni.showToast({
				title: t('friendApply.acceptSuccess'),
				icon: 'none',
			})
			loadApplyList()
		}).catch((error) => {
			uni.showToast({
				title: resolveUnknownErrorMessage(error, text.accept),
				icon: 'none',
			})
		}).finally(() => {
			processingId.value = 0
			processingAction.value = ''
		})
	}

	function handleReject(item: FriendApplyItem): void {
		if (!canReject(item) || processingId.value > 0) {
			return
		}
		processingId.value = item.id
		processingAction.value = 'reject'
		rejectFriendApply(item.id).then(() => {
			uni.showToast({
				title: t('friendApply.rejectSuccess'),
				icon: 'none',
			})
			loadApplyList()
		}).catch((error) => {
			uni.showToast({
				title: resolveUnknownErrorMessage(error, text.reject),
				icon: 'none',
			})
		}).finally(() => {
			processingId.value = 0
			processingAction.value = ''
		})
	}

	onShow(() => {
		localeVersion.value = i18nStore.version
		text.title = t('friendApply.title')
		text.subtitle = t('friendApply.subtitle')
		text.loading = t('friendApply.loading')
		text.empty = t('friendApply.empty')
		text.emptyMessage = t('friendApply.emptyMessage')
		text.accept = t('friendApply.accept')
		text.reject = t('friendApply.reject')
		text.accepting = t('friendApply.accepting')
		text.rejecting = t('friendApply.rejecting')
		text.incoming = t('friendApply.incoming')
		text.outgoing = t('friendApply.outgoing')
		text.statusPending = t('friendApply.statusPending')
		text.statusAccepted = t('friendApply.statusAccepted')
		text.statusRejected = t('friendApply.statusRejected')
		text.messageAction = t('friendApply.messageAction')
		retryText.value = t('common.retry')
		applyNavigationTitle(t('nav.friendApply'))
		loadApplyList()
	})
</script>

<style>
	.apply-state-card {
		align-items: center;
	}

	.apply-state-text {
		font-size: 15px;
		line-height: 22px;
		color: #1c1613;
		text-align: center;
	}

	.apply-state-action {
		margin-top: 16px;
		padding-left: 18px;
		padding-right: 18px;
	}

	.apply-state-action-text {
		font-size: 13px;
		font-weight: 600;
		color: #fff9f2;
	}

	.apply-head-row {
		align-items: flex-start;
	}

	.apply-user-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.apply-avatar {
		width: 44px;
		height: 44px;
		border-radius: 22px;
		margin-right: 12px;
		background-color: rgba(141, 98, 72, 0.18);
		flex-shrink: 0;
	}

	.apply-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.friend-name {
		font-size: 16px;
		font-weight: 700;
		color: #1c1613;
	}

	.apply-id-text {
		font-size: 12px;
		line-height: 18px;
		color: #7d604d;
		margin-top: 4px;
	}

	.apply-tag-group {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
		margin-left: 12px;
	}

	.apply-direction-tag,
	.apply-status-tag {
		font-size: 11px;
		line-height: 16px;
		padding-top: 4px;
		padding-right: 8px;
		padding-bottom: 4px;
		padding-left: 8px;
		border-radius: 10px;
		background-color: #f1e0cd;
		color: #6f5544;
	}

	.apply-message {
		font-size: 14px;
		line-height: 20px;
		color: #3c3028;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	.apply-action-row {
		display: flex;
		flex-direction: row;
		gap: 10px;
		margin-top: 14px;
	}

	.apply-action-button {
		flex: 1;
	}

	.apply-action-primary-text {
		font-size: 13px;
		font-weight: 600;
		color: #fff9f2;
	}

	.apply-action-secondary-text,
	.apply-action-outline-text {
		font-size: 13px;
		font-weight: 600;
		color: #6f5544;
	}
</style>
