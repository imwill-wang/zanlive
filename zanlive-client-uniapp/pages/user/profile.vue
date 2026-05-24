<template>
	<view class="page-root" :key="localeVersion">
		<view class="page-content">
			<view class="section-card">
				<view class="profile-header-row">
					<image class="profile-avatar" :src="userAvatar" mode="aspectFill"></image>
					<view class="profile-header-copy">
						<text class="section-title">{{ userName }}</text>
						<text class="section-subtitle">{{ accountPrefix }}{{ account }}</text>
					</view>
				</view>
			</view>
			<view class="section-card">
				<text class="field-label">{{ mottoLabel }}</text>
				<text class="profile-motto">{{ motto }}</text>
				<view class="secondary-button profile-button">
					<text class="profile-button-text">{{ editText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { authStore, restoreAuthState } from '../../store/auth'

	const localeVersion = ref(0)
	const accountPrefix = ref('')
	const mottoLabel = ref('')
	const editText = ref('')
	const userName = ref('')
	const userAvatar = ref('/static/logo.png')
	const account = ref('')
	const motto = ref('')

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		accountPrefix.value = t('userProfile.accountPrefix')
		mottoLabel.value = t('userProfile.mottoLabel')
		editText.value = t('userProfile.editComingSoon')
		applyNavigationTitle(t('nav.profile'))
	}

	onShow(() => {
		syncLocaleUI()
		restoreAuthState().then(() => {
			const user = authStore.user
			if (user != null) {
				userName.value = user.name
				userAvatar.value = user.avatar.length > 0 ? user.avatar : '/static/logo.png'
				account.value = user.account
				motto.value = user.motto
			}
		})
	})
</script>

<style>
	.profile-header-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.profile-avatar {
		width: 76px;
		height: 76px;
		border-radius: 38px;
		background-color: #ead8c8;
		flex-shrink: 0;
	}

	.profile-header-copy {
		display: flex;
		flex-direction: column;
		margin-left: 14px;
		flex: 1;
	}

	.profile-motto {
		font-size: 15px;
		line-height: 22px;
		color: #1c1613;
		margin-bottom: 16px;
	}

	.profile-button {
		align-self: flex-start;
		padding-left: 16px;
		padding-right: 16px;
	}

	.profile-button-text {
		font-size: 13px;
		font-weight: 600;
		color: #6f5544;
	}
</style>
