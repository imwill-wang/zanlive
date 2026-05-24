<template>
	<view class="page-root" :key="localeVersion">
		<view class="auth-toolbar" :style="'padding-top:' + toolbarPaddingTop + 'px;'">
			<view class="auth-toolbar-spacer"></view>
			<LanguageEntryButton />
		</view>
		<view class="page-content" :style="'padding-top:' + pageContentPaddingTop + 'px;'">
			<view class="auth-hero">
				<text class="auth-title">{{ text.title }}</text>
				<text class="auth-subtitle">{{ text.subtitle }}</text>
			</view>
			<view class="section-card">
				<form class="auth-form" @submit="handleLoginSubmit">
					<text class="field-label">{{ text.accountLabel }}</text>
					<input class="field-input" v-model="account" :placeholder="text.accountPlaceholder" :maxlength="16" />
					<text class="field-label">{{ text.passwordLabel }}</text>
					<input class="field-input" v-model="password" :password="true" :placeholder="text.passwordPlaceholder" confirm-type="done" @confirm="handleLogin" />
					<text v-if="errorMessage.length > 0" class="auth-error">{{ errorMessage }}</text>
					<view class="primary-button auth-submit-wrap" @tap="handleLogin">
						<button class="auth-submit-button" form-type="submit" @tap="handleLogin">{{ loading ? text.loadingAction : text.action }}</button>
					</view>
				</form>
				<view class="auth-gap"></view>
				<view class="outline-button" @tap="goRegister">
					<text class="auth-secondary-text">{{ text.registerAction }}</text>
				</view>
				<view class="auth-third-party">
					<view class="auth-third-party-divider">
						<view class="auth-third-party-line"></view>
						<text class="auth-third-party-divider-text">{{ text.thirdPartyDivider }}</text>
						<view class="auth-third-party-line"></view>
					</view>
					<view class="auth-third-party-grid">
						<view
							v-for="item in thirdPartyApps"
							:key="item.key"
							class="auth-third-party-card"
							@tap="handleThirdPartyTap(item.name)"
						>
							<image class="auth-third-party-logo" :src="item.icon" mode="aspectFit" />
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
	import LanguageEntryButton from '../../components/common/LanguageEntryButton.vue'
	import { runRegionAvailabilityCheck } from '../../services/availability'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import { i18nStore, t } from '../../store/i18n'
	import { loginWithPayload, navigateToHomeAfterAuth } from '../../store/auth'

	type LoginPageText = {
		title: string
		subtitle: string
		accountLabel: string
		accountPlaceholder: string
		passwordLabel: string
		passwordPlaceholder: string
		action: string
		loadingAction: string
		registerAction: string
		thirdPartyDivider: string
	}

	type ThirdPartyApp = {
		key: string
		name: string
		icon: string
	}

	const localeVersion = ref(0)
	const text = reactive<LoginPageText>({
		title: '',
		subtitle: '',
		accountLabel: '',
		accountPlaceholder: '',
		passwordLabel: '',
		passwordPlaceholder: '',
		action: '',
		loadingAction: '',
		registerAction: '',
		thirdPartyDivider: '',
	})
	const account = ref('')
	const password = ref('')
	const errorMessage = ref('')
	const loading = ref(false)
	const thirdPartyChecking = ref(false)
	const toolbarPaddingTop = ref(18)
	const pageContentPaddingTop = ref(88)
	const accountMaxLength = 16
	const thirdPartyApps = ref<ThirdPartyApp[]>([
		{ key: 'facebook', name: 'Facebook', icon: '/static/logo/facebook.png' },
		{ key: 'google', name: 'Google', icon: '/static/logo/google.png' },
		{ key: 'kakao', name: 'Kakao', icon: '/static/logo/kakao.png' },
		{ key: 'line', name: 'LINE', icon: '/static/logo/line.png' },
		{ key: 'linkedin', name: 'LinkedIn', icon: '/static/logo/linkedin.png' },
		{ key: 'whatsapp', name: 'WhatsApp', icon: '/static/logo/whatsapp.png' },
	])

	function syncToolbarInset(): void {
		const systemInfo = uni.getSystemInfoSync()
		const statusBarHeight = systemInfo.statusBarHeight != null ? systemInfo.statusBarHeight : 0
		toolbarPaddingTop.value = statusBarHeight + 8
		pageContentPaddingTop.value = statusBarHeight + 64
	}

	function goRegister(): void {
		uni.navigateTo({
			url: '/pages/auth/register',
		})
	}

	async function handleThirdPartyTap(_appName: string): Promise<void> {
		if (thirdPartyChecking.value) {
			return
		}
		thirdPartyChecking.value = true
		try {
			await runRegionAvailabilityCheck(1000, 5000, {
				loadingTitleKey: 'login.thirdPartyCheckingEnvironment',
				resultTitleKey: 'login.thirdPartyUnavailableTitle',
				resultMessageKey: 'login.thirdPartyUnavailableMessage',
				showResultAsModal: true,
			})
		} finally {
			thirdPartyChecking.value = false
		}
	}

	function resolveErrorMessage(error: any | null): string {
		return resolveUnknownErrorMessage(error, t('login.errorDefault'))
	}

	function showErrorToast(message: string): void {
		uni.showToast({
			title: message,
			icon: 'none',
		})
	}

	function finishLoading(): void {
		uni.hideLoading()
		loading.value = false
	}

	function scheduleHomeNavigation(): void {
		setTimeout(() => {
			navigateToHomeAfterAuth().catch((error) => {
				errorMessage.value = resolveErrorMessage(error)
				showErrorToast(errorMessage.value)
			})
		}, 200)
	}

	function handleLogin(): void {
		if (loading.value) {
			return
		}
		errorMessage.value = ''
		if (account.value.length == 0 || password.value.length == 0) {
			errorMessage.value = t('login.errorEmpty')
			showErrorToast(errorMessage.value)
			return
		}
		if (account.value.length > accountMaxLength) {
			errorMessage.value = t('login.errorAccountTooLong')
			showErrorToast(errorMessage.value)
			return
		}
		loading.value = true
		uni.showLoading({
			title: text.loadingAction,
			mask: true,
		})
		loginWithPayload({
			account: account.value,
			password: password.value,
		}).then(() => {
			finishLoading()
			scheduleHomeNavigation()
		}).catch((error) => {
			finishLoading()
			errorMessage.value = resolveErrorMessage(error)
			showErrorToast(errorMessage.value)
		})
	}

	function handleLoginSubmit(): void {
		handleLogin()
	}

	onShow(() => {
		syncToolbarInset()
		localeVersion.value = i18nStore.version
		text.title = t('login.title')
		text.subtitle = t('login.subtitle')
		text.accountLabel = t('login.accountLabel')
		text.accountPlaceholder = t('login.accountPlaceholder')
		text.passwordLabel = t('login.passwordLabel')
		text.passwordPlaceholder = t('login.passwordPlaceholder')
		text.action = t('login.action')
		text.loadingAction = t('login.loadingAction')
		text.registerAction = t('login.registerAction')
		text.thirdPartyDivider = t('login.thirdPartyDivider')
	})
</script>

<style>
	page {
		background-color: #f4e7d9;
	}

	.page-root {
		min-height: 100vh;
	}

	.auth-toolbar {
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		z-index: 10;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
		padding-right: 16px;
		box-sizing: border-box;
	}

	.auth-toolbar-spacer {
		flex: 1;
	}

	.auth-hero {
		display: flex;
		flex-direction: column;
		margin-bottom: 24px;
	}

	.auth-title {
		font-size: 30px;
		font-weight: 700;
		color: #1c1613;
	}

	.auth-subtitle {
		font-size: 14px;
		color: #7d6452;
		margin-top: 8px;
	}

	.auth-error {
		font-size: 12px;
		color: #b33f2b;
		margin-top: 8px;
		margin-bottom: 12px;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
	}

	.auth-gap {
		height: 12px;
	}

	.auth-third-party {
		margin-top: 24px;
		padding-top: 4px;
	}

	.auth-third-party-divider {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}

	.auth-third-party-line {
		flex: 1;
		height: 1px;
		background-color: #ead9ca;
	}

	.auth-third-party-divider-text {
		font-size: 11px;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: #a48773;
	}

	.auth-third-party-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		margin-top: 18px;
	}

	.auth-third-party-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		margin: 0 auto;
		padding: 0px;
		border-radius: 32px;
		background-color: transparent;
		box-sizing: border-box;
	}

	.auth-third-party-logo {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
	}

	.auth-submit-button {
		width: 100%;
		height: 44px;
		padding-top: 0px;
		padding-right: 0px;
		padding-bottom: 0px;
		padding-left: 0px;
		border-width: 0px;
		border-radius: 22px;
		background-color: #1c1613;
		font-size: 15px;
		font-weight: 600;
		color: #fff9f2;
	}

	.auth-secondary-text {
		font-size: 14px;
		font-weight: 600;
		color: #7a5543;
	}

	@media screen and (max-width: 360px) {
		.auth-third-party-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
