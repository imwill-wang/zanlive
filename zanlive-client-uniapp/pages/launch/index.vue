<template>
	<view class="launch-page" :key="localeVersion">
		<view class="launch-mark"></view>
		<text class="launch-title">{{ titleText }}</text>
	</view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { ref } from 'vue'
	import { i18nStore, t } from '../../store/i18n'
	import { navigateToHomeAfterAuth, restoreAuthState } from '../../store/auth'

	const localeVersion = ref(0)
	const titleText = ref('')

	onReady(() => {
		localeVersion.value = i18nStore.version
		titleText.value = t('launch.title')
		restoreAuthState().then((loggedIn) => {
			if (loggedIn) {
				setTimeout(() => {
					navigateToHomeAfterAuth()
				}, 120)
				return
			}
			uni.redirectTo({
				url: '/pages/auth/login',
			})
		})
	})
</script>

<style>
	.launch-page {
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 100%;
		height: 100vh;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		background-color: #f4e7d9;
		padding-top: 24px;
		padding-right: 24px;
		padding-bottom: calc(24px + env(safe-area-inset-bottom));
		padding-left: 24px;
		box-sizing: border-box;
		overflow: hidden;
	}

	.launch-mark {
		width: 88px;
		height: 88px;
		border-radius: 44px;
		background-color: #1c1613;
		margin-bottom: 20px;
		box-shadow: 0 14px 32px rgba(28, 22, 19, 0.16);
	}

	.launch-title {
		font-size: 30px;
		font-weight: 700;
		color: #1c1613;
		letter-spacing: 1px;
	}
</style>
