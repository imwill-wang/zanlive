<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="section-card">
				<text class="section-title">{{ text.availableBalance }}</text>
				<text class="wallet-balance">{{ balanceText }}</text>
			</view>
			<view class="section-card">
				<view class="primary-button wallet-button" @tap="openGiftRecord">
					<text class="wallet-button-text">{{ text.giftRecords }}</text>
				</view>
				<view class="wallet-gap"></view>
				<view class="outline-button wallet-button" @tap="openRewardRecord">
					<text class="wallet-outline-text">{{ text.rewardRecords }}</text>
				</view>
				<view class="wallet-gap"></view>
				<view class="secondary-button wallet-button" @tap="openRecharge">
					<text class="wallet-secondary-text">{{ text.recharge }}</text>
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
	import { applyNavigationTitle, getCurrencyName, getRechargeRoute, i18nStore, t } from '../../store/i18n'
	import { getBalance } from '../../services/wallet'

	type WalletPageText = {
		availableBalance: string
		giftRecords: string
		rewardRecords: string
		recharge: string
	}

	const localeVersion = ref(0)
	const text = reactive<WalletPageText>({
		availableBalance: '',
		giftRecords: '',
		rewardRecords: '',
		recharge: '',
	})
	const balanceText = ref('0 Coins')

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		text.availableBalance = t('wallet.availableBalance')
		text.giftRecords = t('wallet.giftRecords')
		text.rewardRecords = t('wallet.rewardRecords')
		text.recharge = t('wallet.recharge')
		applyNavigationTitle(t('nav.wallet'))
	}

	function loadBalance(): void {
		getBalance().then((data) => {
			balanceText.value = data.balance.toString() + ' ' + getCurrencyName()
		}).catch(() => {
			balanceText.value = '0 ' + getCurrencyName()
		})
	}

	function openGiftRecord(): void {
		uni.navigateTo({
			url: '/pages/wallet/gift-record',
		})
	}

	function openRewardRecord(): void {
		uni.navigateTo({
			url: '/pages/wallet/reward-record',
		})
	}

	function openRecharge(): void {
		uni.navigateTo({
			url: getRechargeRoute(),
		})
	}

	onShow(() => {
		syncLocaleUI()
		loadBalance()
	})
</script>

<style>
	.wallet-balance {
		font-size: 36px;
		font-weight: 700;
		color: #1c1613;
		margin-top: 10px;
	}

	.wallet-button {
		width: 100%;
	}

	.wallet-gap {
		height: 12px;
	}

	.wallet-button-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.wallet-outline-text {
		font-size: 14px;
		font-weight: 600;
		color: #7a5543;
	}

	.wallet-secondary-text {
		font-size: 14px;
		font-weight: 600;
		color: #6f5544;
	}
</style>
