<template>
	<view class="page-root" :key="localeVersion">
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ text.title }}</text>
			</view>
			<view class="section-card">
				<view v-if="errorMessage.length > 0" class="auth-error-panel">
					<text class="auth-error-title">{{ text.errorTitle }}</text>
					<text class="auth-error">{{ errorMessage }}</text>
				</view>
				<form class="auth-form" @submit="handleRegisterSubmit">
					<text :class="fieldErrors.name.length > 0 ? 'field-label field-label-error' : 'field-label'">{{ text.nameLabel }}</text>
					<input :class="fieldErrors.name.length > 0 ? 'field-input field-input-error' : 'field-input'" v-model="name" :placeholder="text.namePlaceholder" :maxlength="16" />
					<text v-if="fieldErrors.name.length > 0" class="field-error-text">{{ fieldErrors.name }}</text>
					<text :class="fieldErrors.account.length > 0 ? 'field-label field-label-error' : 'field-label'">{{ text.accountLabel }}</text>
					<input :class="fieldErrors.account.length > 0 ? 'field-input field-input-error' : 'field-input'" v-model="account" :placeholder="text.accountPlaceholder" :maxlength="16" />
					<text v-if="fieldErrors.account.length > 0" class="field-error-text">{{ fieldErrors.account }}</text>
					<text :class="fieldErrors.password.length > 0 ? 'field-label field-label-error' : 'field-label'">{{ text.passwordLabel }}</text>
					<input :class="fieldErrors.password.length > 0 ? 'field-input field-input-error' : 'field-input'" v-model="password" :password="true" :placeholder="text.passwordPlaceholder" />
					<text v-if="fieldErrors.password.length > 0" class="field-error-text">{{ fieldErrors.password }}</text>
					<view class="primary-button auth-submit-wrap" @tap="handleRegister">
						<button class="auth-submit-button" form-type="submit" @tap="handleRegister">{{ loading ? text.loadingAction : text.action }}</button>
					</view>
				</form>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { navigateToHomeAfterAuth, registerWithPayload } from '../../store/auth'

	type RegisterPageText = {
		title: string
		subtitle: string
		nameLabel: string
		namePlaceholder: string
		accountLabel: string
		accountPlaceholder: string
		passwordLabel: string
		passwordPlaceholder: string
		action: string
		loadingAction: string
		errorTitle: string
	}

	type RegisterFieldKey = 'name' | 'account' | 'password'

	type RegisterFieldErrors = {
		name: string
		account: string
		password: string
	}

	const localeVersion = ref(0)
	const text = reactive<RegisterPageText>({
		title: '',
		subtitle: '',
		nameLabel: '',
		namePlaceholder: '',
		accountLabel: '',
		accountPlaceholder: '',
		passwordLabel: '',
		passwordPlaceholder: '',
		action: '',
		loadingAction: '',
		errorTitle: '',
	})
	const fieldErrors = reactive<RegisterFieldErrors>({
		name: '',
		account: '',
		password: '',
	})
	const name = ref('')
	const account = ref('')
	const password = ref('')
	const errorMessage = ref('')
	const loading = ref(false)
	const accountMaxLength = 16

	function clearFieldErrors(): void {
		fieldErrors.name = ''
		fieldErrors.account = ''
		fieldErrors.password = ''
	}

	function setFieldError(field: RegisterFieldKey, message: string): void {
		fieldErrors[field] = message
	}

	function getFirstFieldError(): string {
		if (fieldErrors.name.length > 0) {
			return fieldErrors.name
		}
		if (fieldErrors.account.length > 0) {
			return fieldErrors.account
		}
		if (fieldErrors.password.length > 0) {
			return fieldErrors.password
		}
		return t('register.errorEmpty')
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

	function validateRequiredFields(): boolean {
		let isValid = true
		if (name.value.length == 0) {
			setFieldError('name', t('register.errorNameRequired'))
			isValid = false
		}
		if (account.value.length == 0) {
			setFieldError('account', t('register.errorAccountRequired'))
			isValid = false
		} else if (account.value.length > accountMaxLength) {
			setFieldError('account', t('register.errorAccountTooLong'))
			isValid = false
		}
		if (password.value.length == 0) {
			setFieldError('password', t('register.errorPasswordRequired'))
			isValid = false
		}
		return isValid
	}

	function mapRemoteErrorToField(message: string): void {
		const lowerMessage = message.toLowerCase()
		if (message.indexOf('账号') >= 0 || lowerMessage.indexOf('account') >= 0) {
			setFieldError('account', message)
			return
		}
		if (message.indexOf('密码') >= 0 || lowerMessage.indexOf('password') >= 0) {
			setFieldError('password', message)
			return
		}
		if (message.indexOf('昵称') >= 0 || lowerMessage.indexOf('name') >= 0) {
			setFieldError('name', message)
		}
	}

	function resolveErrorMessage(error: any | null): string {
		return resolveUnknownErrorMessage(error, t('register.errorDefault'))
	}

	function scheduleHomeNavigation(): void {
		setTimeout(() => {
			navigateToHomeAfterAuth().catch((error) => {
				errorMessage.value = resolveErrorMessage(error)
				mapRemoteErrorToField(errorMessage.value)
				showErrorToast(errorMessage.value)
			})
		}, 200)
	}

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		text.title = t('register.title')
		text.subtitle = t('register.subtitle')
		text.nameLabel = t('register.nameLabel')
		text.namePlaceholder = t('register.namePlaceholder')
		text.accountLabel = t('register.accountLabel')
		text.accountPlaceholder = t('register.accountPlaceholder')
		text.passwordLabel = t('register.passwordLabel')
		text.passwordPlaceholder = t('register.passwordPlaceholder')
		text.action = t('register.action')
		text.loadingAction = t('register.loadingAction')
		text.errorTitle = t('register.errorTitle')
		applyNavigationTitle(t('nav.register'))
	}

	function handleRegister(): void {
		if (loading.value) {
			return
		}
		errorMessage.value = ''
		clearFieldErrors()
		if (!validateRequiredFields()) {
			errorMessage.value = getFirstFieldError()
			showErrorToast(errorMessage.value)
			return
		}
		loading.value = true
		uni.showLoading({
			title: text.loadingAction,
			mask: true,
		})
		registerWithPayload({
			name: name.value,
			account: account.value,
			password: password.value,
		}).then(() => {
			finishLoading()
			scheduleHomeNavigation()
		}).catch((error) => {
			finishLoading()
			errorMessage.value = resolveErrorMessage(error)
			mapRemoteErrorToField(errorMessage.value)
			showErrorToast(errorMessage.value)
		})
	}

	function handleRegisterSubmit(): void {
		handleRegister()
	}

	onShow(() => {
		syncLocaleUI()
	})
</script>

<style>
	page {
		background-color: #f4e7d9;
	}

	.page-root {
		min-height: 100vh;
	}

	.auth-error-panel {
		background-color: #fff1ef;
		border-width: 1px;
		border-style: solid;
		border-color: #f1c0ba;
		border-radius: 14px;
		padding-top: 12px;
		padding-right: 12px;
		padding-bottom: 12px;
		padding-left: 12px;
		margin-bottom: 16px;
	}

	.auth-error-title {
		font-size: 13px;
		font-weight: 600;
		color: #922b1d;
		margin-bottom: 4px;
	}

	.auth-error {
		font-size: 12px;
		color: #b33f2b;
	}

	.field-label-error {
		color: #b33f2b;
	}

	.field-input-error {
		border-width: 1px;
		border-style: solid;
		border-color: #d86a57;
		background-color: #fff8f7;
	}

	.field-error-text {
		font-size: 12px;
		color: #b33f2b;
		margin-top: -6px;
		margin-bottom: 12px;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
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
		color: #fff9f2;
		font-size: 15px;
		font-weight: 600;
	}

</style>
