<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ titleText }}</text>
				<text class="section-subtitle">{{ subtitleText }}</text>
			</view>
			<view v-for="item in languageOptions" :key="item.code" class="section-card language-card" @tap="selectLanguage(item.code)">
				<view class="section-row">
					<view class="language-copy">
						<text class="language-name">{{ item.nativeName }}</text>
						<text v-if="item.code == currentLocale" class="meta-text">{{ currentText }}</text>
					</view>
					<view v-if="item.code == currentLocale" class="primary-button language-active-pill">
						<text class="language-active-text">{{ currentText }}</text>
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
import { ref } from 'vue'
	import { applyNavigationTitle, getCurrentLocale, getLanguageOptions, i18nStore, setLocale, t } from '../../store/i18n'

	const localeVersion = ref(0)
	const titleText = ref('')
	const subtitleText = ref('')
	const currentText = ref('')
	const currentLocale = ref('en')
	const languageOptions = getLanguageOptions()

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		titleText.value = t('language.title')
		subtitleText.value = t('language.subtitle')
		currentText.value = t('language.current')
		currentLocale.value = getCurrentLocale()
		applyNavigationTitle(t('nav.language'))
	}

	function selectLanguage(locale: string): void {
		setLocale(locale)
		syncLocaleUI()
		uni.navigateBack()
	}

	onShow(() => {
		syncLocaleUI()
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

	.page-content {
		padding-left: 16px;
		padding-right: 16px;
		box-sizing: border-box;
	}

	.language-card {
		margin-bottom: 12px;
	}

	.language-copy {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding-right: 12px;
	}

	.language-name {
		font-size: 16px;
		font-weight: 600;
		color: #1c1613;
		margin-bottom: 6px;
	}

	.language-active-pill {
		height: 34px;
		border-radius: 17px;
		padding-left: 20px;
		padding-right: 20px;
	}

	.language-active-text {
		font-size: 12px;
		font-weight: 600;
		color: #fff9f2;
	}
</style>
