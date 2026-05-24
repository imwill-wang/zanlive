<template>
	<view class="page-root" :key="localeVersion">
		<view class="page-content">
			<view class="section-card">
				<view class="user-profile-row">
					<image class="user-avatar" :src="userAvatar" mode="aspectFill"></image>
					<view class="user-profile-copy">
						<text class="section-title">{{ userName }}</text>
						<text class="meta-text user-id-text">{{ userIdLabel }} {{ displayUserId }}</text>
						<text class="section-subtitle">{{ userMotto }}</text>
					</view>
				</view>
				<view class="user-badge-row">
					<text class="tag-chip">{{ memberType }}</text>
					<text class="tag-chip">{{ balancePrefix }} {{ balanceText }}</text>
				</view>
			</view>
			<view class="section-card">
				<view class="primary-button user-action-button" @tap="openWallet">
					<text class="user-action-text">{{ walletAndRecordsText }}</text>
				</view>
				<view class="user-gap"></view>
				<view class="outline-button user-action-button" @tap="openProfile">
					<text class="user-outline-text">{{ profileText }}</text>
				</view>
				<view class="user-gap"></view>
				<view class="outline-button user-action-button" @tap="openLanguage">
					<view class="user-language-row">
						<text class="user-outline-text">{{ languageText }}</text>
						<text class="meta-text">{{ currentLanguage }}</text>
					</view>
				</view>
				<view class="user-gap"></view>
				<view class="secondary-button user-action-button" @tap="openRecharge">
					<text class="user-secondary-text">{{ rechargeText }}</text>
				</view>
				<view class="user-gap"></view>
				<view class="outline-button user-action-button" @tap="openCustomerService">
					<text class="user-outline-text">{{ contactSupportText }}</text>
				</view>
				<view class="user-gap"></view>
				<view class="outline-button user-action-button" @tap="handleLogout">
					<text class="user-outline-text">{{ logoutText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
	import { applyNavigationTitle, applyTabBarLocale, getCurrentLanguageLabel, getCurrencyName, getCustomerServiceRoute, getRechargeRoute, i18nStore, t, translateMemberType } from '../../store/i18n'
	import { authStore, logoutCurrentUser, restoreAuthState } from '../../store/auth'
	import { refreshBalance, userStore } from '../../store/user'

	const localeVersion = ref(0)
	const balancePrefix = ref('')
	const walletAndRecordsText = ref('')
	const profileText = ref('')
	const languageText = ref('')
	const rechargeText = ref('')
	const contactSupportText = ref('')
	const logoutText = ref('')
	const userIdLabel = ref('ID:')
	const userName = ref('')
	const userMotto = ref('')
	const userAvatar = ref('/static/logo.png')
	const memberType = ref('')
	const balanceText = ref('0 Coins')
	const currentLanguage = ref('English')
	const displayUserId = ref('--')

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		applyTabBarLocale()
		balancePrefix.value = t('user.balancePrefix')
		walletAndRecordsText.value = t('user.walletAndRecords')
		profileText.value = t('user.profile')
		languageText.value = t('user.language')
		rechargeText.value = t('user.recharge')
		contactSupportText.value = t('user.contactSupport')
		logoutText.value = t('user.logout')
		userIdLabel.value = t('user.idLabel')
		applyNavigationTitle(t('nav.user'))
		currentLanguage.value = getCurrentLanguageLabel()
		if (authStore.user == null) {
			userName.value = t('common.notLoggedIn')
			memberType.value = t('common.defaultMember')
			displayUserId.value = '--'
		}
	}

	function syncProfile(): void {
		syncLocaleUI()
		const user = authStore.user
		if (user != null) {
			userName.value = user.name
			userMotto.value = user.motto
			userAvatar.value = user.avatar.length > 0 ? user.avatar : '/static/logo.png'
			memberType.value = translateMemberType(user.memberType)
			displayUserId.value = authStore.userId > 0 ? authStore.userId.toString() : '--'
		} else {
			userName.value = t('common.notLoggedIn')
			userAvatar.value = '/static/logo.png'
			memberType.value = t('common.defaultMember')
			displayUserId.value = '--'
		}
		const balance = userStore.balance
		if (balance != null) {
			balanceText.value = balance.balance.toString() + ' ' + getCurrencyName()
		}
	}

	function openWallet(): void {
		uni.navigateTo({
			url: '/pages/wallet/index',
		})
	}

	function openProfile(): void {
		uni.navigateTo({
			url: '/pages/user/profile',
		})
	}

	function openLanguage(): void {
		uni.navigateTo({
			url: '/pages/user/language',
		})
	}

	function openRecharge(): void {
		uni.navigateTo({
			url: getRechargeRoute(),
		})
	}

	function openCustomerService(): void {
		uni.navigateTo({
			url: getCustomerServiceRoute(),
		})
	}

	function handleLogout(): void {
		logoutCurrentUser().then(() => {
			uni.redirectTo({
				url: '/pages/auth/login',
			})
		})
	}

	onShow(() => {
		restoreAuthState().then(() => {
			refreshBalance().then(() => {
				syncProfile()
			}).catch(() => {
				syncProfile()
			})
		})
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

	.user-profile-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.user-avatar {
		width: 72px;
		height: 72px;
		border-radius: 36px;
		background-color: #ead8c8;
		flex-shrink: 0;
	}

	.user-profile-copy {
		display: flex;
		flex-direction: column;
		margin-left: 14px;
		flex: 1;
	}

	.user-id-text {
		margin-top: 4px;
	}

	.user-badge-row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 16px;
	}

	.user-action-button {
		width: 100%;
	}

	.user-language-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0 12rpx;
	}

	.user-gap {
		height: 12px;
	}

	.user-action-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.user-outline-text {
		font-size: 14px;
		font-weight: 600;
		color: #7a5543;
	}

	.user-secondary-text {
		font-size: 14px;
		font-weight: 600;
		color: #6f5544;
	}
</style>
