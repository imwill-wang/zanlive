<template>
	<view class="language-entry-button" @tap="openLanguagePage">
		<view class="language-icon">
			<view class="language-icon-ring"></view>
			<view class="language-icon-meridian"></view>
			<view class="language-icon-latitude language-icon-latitude-top"></view>
			<view class="language-icon-latitude language-icon-latitude-middle"></view>
			<view class="language-icon-latitude language-icon-latitude-bottom"></view>
		</view>
	</view>
</template>

<script setup lang="ts">
	function openLanguagePage(): void {
		uni.navigateTo({
			url: '/pages/user/language',
		})
	}
</script>

<style>
	.language-entry-button {
		width: 44px;
		height: 44px;
		border-radius: 22px;
		background-color: rgba(255, 249, 242, 0.94);
		border-width: 1px;
		border-style: solid;
		border-color: rgba(122, 85, 67, 0.12);
		box-shadow: 0 6px 16px rgba(78, 49, 37, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.language-icon {
		width: 18px;
		height: 18px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.language-icon-ring {
		width: 18px;
		height: 18px;
		border-radius: 9px;
		border-width: 1.5px;
		border-style: solid;
		border-color: #7a5543;
	}

	.language-icon-meridian {
		position: absolute;
		width: 6px;
		height: 18px;
		border-radius: 9px;
		border-width: 1px;
		border-style: solid;
		border-color: #7a5543;
	}

	.language-icon-latitude {
		position: absolute;
		left: 2px;
		width: 14px;
		border-top-width: 1px;
		border-top-style: solid;
		border-top-color: #7a5543;
	}

	.language-icon-latitude-top {
		top: 4px;
	}

	.language-icon-latitude-middle {
		top: 8.5px;
	}

	.language-icon-latitude-bottom {
		top: 13px;
	}
</style>
