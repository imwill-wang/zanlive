<template>
	<view class="page-root" :key="localeVersion">
		<view class="page-content">
			<view v-if="loading" class="section-card follow-state-card">
				<text class="follow-state-title">{{ text.loading }}</text>
			</view>
			<view v-else-if="errorMessage.length > 0" class="section-card follow-state-card">
				<text class="follow-state-title">{{ errorMessage }}</text>
				<view class="primary-button follow-state-action" @tap="loadFollowedAnchors">
					<text class="follow-state-action-text">{{ retryText }}</text>
				</view>
			</view>
			<view v-else-if="anchorList.length == 0" class="section-card follow-state-card">
				<text class="follow-state-title">{{ text.empty }}</text>
			</view>
			<view v-for="item in anchorList" :key="item.anchorId" class="section-card follow-anchor-card" @tap="openAnchor(item)">
				<view class="follow-anchor-row">
					<image class="follow-anchor-avatar" :src="item.anchorAvatar" mode="aspectFill" @tap.stop="openAnchorDetail(item)"></image>
					<view class="follow-anchor-copy" @tap.stop="openAnchorDetail(item)">
						<view class="follow-anchor-name-row">
							<text class="follow-anchor-name">{{ item.anchorName }}</text>
							<text :class="item.isLiving ? 'follow-anchor-status follow-anchor-status-on' : 'follow-anchor-status follow-anchor-status-off'">{{ item.isLiving ? text.liveNow : text.offline }}</text>
						</view>
						<text class="follow-anchor-desc">{{ item.isLiving && item.liveTitle.length > 0 ? item.liveTitle : item.intro }}</text>
						<view class="outline-button follow-anchor-action" @tap.stop="handleUnfollow(item)">
							<text class="follow-anchor-action-text">{{ pendingAnchorId == item.anchorId ? text.unfollowing : text.unfollow }}</text>
						</view>
					</view>
				</view>
			</view>
			<InviteCodeDialog
				:visible="showInviteDialog"
				:title="inviteTitle"
				:placeholder="invitePlaceholder"
				:server-error-text="inviteErrorText"
				:cancel-text="inviteCancelText"
				:confirm-text="inviteConfirmText"
				:confirming-text="inviteConfirmingText"
				:required-text="inviteRequiredText"
				:loading="inviteSubmitting"
				@cancel="closeInviteDialog"
				@confirm="confirmInviteAndEnter"
			/>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
	import { reactive, ref } from 'vue'
	import InviteCodeDialog from '../../components/live/InviteCodeDialog.vue'
	import { applyNavigationTitle, applyTabBarLocale, i18nStore, t } from '../../store/i18n'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import { getFollowedAnchorList, unfollowAnchor } from '../../services/friend'
	import { verifyLiveRoomInviteCode } from '../../services/live'
	import type { AnchorCard } from '../../types/live'

	type FriendListText = {
		empty: string
		loading: string
		refreshSuccess: string
		liveNow: string
		offline: string
		unfollow: string
		unfollowing: string
	}

	const localeVersion = ref(0)
	const text = reactive<FriendListText>({
		empty: '',
		loading: '',
		refreshSuccess: '',
		liveNow: '',
		offline: '',
		unfollow: '',
		unfollowing: '',
	})
	const retryText = ref('')
	const anchorList = ref<AnchorCard[]>([])
	const loading = ref(false)
	const errorMessage = ref('')
	const pendingAnchorId = ref(0)
	const pullRefreshing = ref(false)
	const showInviteDialog = ref(false)
	const inviteSubmitting = ref(false)
	const inviteTitle = ref('')
	const invitePlaceholder = ref('')
	const inviteCancelText = ref('')
	const inviteConfirmText = ref('')
	const inviteConfirmingText = ref('')
	const inviteRequiredText = ref('')
	const inviteErrorText = ref('')
	const pendingRoomId = ref(0)
	const pendingEnterAnchorId = ref(0)

	function loadFollowedAnchors(isPullRefresh: boolean = false): void {
		if (!isPullRefresh) {
			loading.value = true
		}
		pullRefreshing.value = isPullRefresh
		errorMessage.value = ''
		getFollowedAnchorList().then((list) => {
			anchorList.value = list
			if (isPullRefresh) {
				uni.showToast({
					title: text.refreshSuccess,
					icon: 'none',
				})
			}
		}).catch((error) => {
			anchorList.value = []
			errorMessage.value = resolveUnknownErrorMessage(error, t('followedAnchors.errorDefault'))
		}).finally(() => {
			loading.value = false
			if (pullRefreshing.value) {
				pullRefreshing.value = false
				uni.stopPullDownRefresh()
			}
		})
	}

	function openAnchor(item: AnchorCard): void {
		if (!item.isLiving || item.roomId <= 0) {
			uni.showToast({
				title: t('live.anchorOffline'),
				icon: 'none',
			})
			return
		}
		pendingRoomId.value = item.roomId
		pendingEnterAnchorId.value = item.anchorId
		inviteErrorText.value = ''
		showInviteDialog.value = true
	}

	function closeInviteDialog(): void {
		if (inviteSubmitting.value) {
			return
		}
		showInviteDialog.value = false
		pendingRoomId.value = 0
		pendingEnterAnchorId.value = 0
		inviteErrorText.value = ''
	}

	function confirmInviteAndEnter(inviteCode: string): void {
		if (inviteSubmitting.value || pendingRoomId.value <= 0) {
			return
		}
		inviteSubmitting.value = true
		verifyLiveRoomInviteCode(pendingRoomId.value, inviteCode).then(() => {
			uni.navigateTo({
				url: '/pages/live/room?roomId=' + pendingRoomId.value
					+ '&anchorId=' + pendingEnterAnchorId.value
					+ '&inviteCode=' + encodeURIComponent(inviteCode),
				success: () => {
					showInviteDialog.value = false
					pendingRoomId.value = 0
					pendingEnterAnchorId.value = 0
				},
				complete: () => {
					inviteSubmitting.value = false
				},
			})
		}).catch((error) => {
			inviteSubmitting.value = false
			const message = resolveUnknownErrorMessage(error, t('liveInvite.enterFailed'))
			inviteErrorText.value = message.indexOf(t('live.invite_code_invalid')) >= 0 ? t('liveInvite.invalid') : message
			uni.showToast({
				title: inviteErrorText.value,
				icon: 'none',
			})
		})
	}

	function openAnchorDetail(item: AnchorCard): void {
		uni.navigateTo({
			url: '/pages/live/anchor-detail?anchorId=' + item.anchorId.toString()
				+ '&anchorName=' + encodeURIComponent(item.anchorName)
				+ '&anchorAvatar=' + encodeURIComponent(item.anchorAvatar)
				+ '&mainImage=' + encodeURIComponent(item.mainImage)
				+ '&gallery=' + encodeURIComponent(JSON.stringify(item.gallery))
				+ '&intro=' + encodeURIComponent(item.intro)
				+ '&tags=' + encodeURIComponent(JSON.stringify(item.tags))
				+ '&isLiving=' + (item.isLiving ? '1' : '0')
				+ '&roomId=' + item.roomId.toString()
				+ '&liveTitle=' + encodeURIComponent(item.liveTitle)
				+ '&onlineCount=' + item.onlineCount.toString()
				+ '&heat=' + item.heat.toString(),
		})
	}

	function handleUnfollow(item: AnchorCard): void {
		if (pendingAnchorId.value > 0 || item.anchorId <= 0) {
			return
		}
		uni.showModal({
			title: t('followedAnchors.unfollowConfirmTitle'),
			content: t('followedAnchors.unfollowConfirmContent'),
			confirmText: t('followedAnchors.unfollowConfirmAction'),
			cancelText: t('followedAnchors.unfollowCancelAction'),
			success: (result) => {
				if (result.confirm != true) {
					return
				}
				pendingAnchorId.value = item.anchorId
				unfollowAnchor(item.anchorId).then(() => {
					anchorList.value = anchorList.value.filter((anchor) => anchor.anchorId != item.anchorId)
					uni.showToast({
						title: t('followedAnchors.unfollowSuccess'),
						icon: 'none',
					})
				}).catch((error) => {
					uni.showToast({
						title: resolveUnknownErrorMessage(error, t('followedAnchors.unfollowError')),
						icon: 'none',
					})
				}).finally(() => {
					pendingAnchorId.value = 0
				})
			}
		})
	}

	onShow(() => {
		localeVersion.value = i18nStore.version
		applyTabBarLocale()
		text.empty = t('followedAnchors.empty')
		text.loading = t('followedAnchors.loading')
		text.refreshSuccess = t('followedAnchors.refreshSuccess')
		text.liveNow = t('followedAnchors.liveNow')
		text.offline = t('followedAnchors.offline')
		text.unfollow = t('followedAnchors.unfollow')
		text.unfollowing = t('followedAnchors.unfollowing')
		inviteTitle.value = t('liveInvite.title')
		invitePlaceholder.value = t('liveInvite.placeholder')
		inviteCancelText.value = t('liveInvite.cancel')
		inviteConfirmText.value = t('liveInvite.confirm')
		inviteConfirmingText.value = t('liveInvite.confirming')
		inviteRequiredText.value = t('liveInvite.required')
		retryText.value = t('common.retry')
		applyNavigationTitle(t('nav.friends'))
		loadFollowedAnchors()
	})

	onPullDownRefresh(() => {
		loadFollowedAnchors(true)
	})
</script>

<style>
	page {
		background-color: #f4e7d9;
		height: 100%;
	}

	.page-root {
		height: 100vh;
		min-height: 100vh;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	.follow-state-card {
		align-items: center;
	}

	.follow-state-title {
		font-size: 15px;
		line-height: 22px;
		color: #1c1613;
		text-align: center;
	}

	.follow-state-action {
		margin-top: 16px;
	}

	.follow-state-action-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.follow-anchor-card {
		padding-top: 16px;
		padding-bottom: 16px;
	}

	.follow-anchor-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.follow-anchor-avatar {
		width: 64px;
		height: 64px;
		border-radius: 32px;
		background-color: #ead8c8;
		flex-shrink: 0;
	}

	.follow-anchor-copy {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-left: 14px;
		min-width: 0;
	}

	.follow-anchor-name-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.follow-anchor-name {
		font-size: 16px;
		font-weight: 600;
		color: #1c1613;
		margin-bottom: 6px;
		flex: 1;
		min-width: 0;
	}

	.follow-anchor-status {
		font-size: 12px;
		font-weight: 700;
		padding: 4px 10px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.follow-anchor-status-on {
		background-color: #8b2e2e;
		color: #fff1f1;
	}

	.follow-anchor-status-off {
		background-color: #ead8c8;
		color: #7a5543;
	}

	.follow-anchor-desc {
		font-size: 13px;
		line-height: 20px;
		color: #6f5544;
		word-break: break-all;
	}

	.follow-anchor-action {
		align-self: flex-start;
		margin-top: 12px;
		padding-left: 14px;
		padding-right: 14px;
	}

	.follow-anchor-action-text {
		font-size: 13px;
		font-weight: 600;
		color: #7a5543;
	}
</style>
