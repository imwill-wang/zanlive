<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ titleText }}</text>
			</view>
			<view v-for="item in recordList" :key="item.id" class="section-card">
				<text class="record-title">{{ item.title }}</text>
				<text class="record-amount">{{ item.amount }}</text>
				<text class="meta-text">{{ item.time }}</text>
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
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { getRewardRecords } from '../../services/wallet'
	import type { WalletRecord } from '../../types/wallet'

	const localeVersion = ref(0)
	const titleText = ref('')
	const recordList = ref<WalletRecord[]>([])

	onShow(() => {
		localeVersion.value = i18nStore.version
		titleText.value = t('walletReward.title')
		applyNavigationTitle(t('nav.rewardRecord'))
		getRewardRecords().then((list) => {
			recordList.value = list
		})
	})
</script>

<style>
	.record-title {
		font-size: 15px;
		font-weight: 600;
		color: #1c1613;
		margin-bottom: 8px;
	}

	.record-amount {
		font-size: 22px;
		font-weight: 700;
		color: #8b4c30;
		margin-bottom: 6px;
	}
</style>
