<template>
	<view class="compat-page"></view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
	uni.redirectTo({
		url: '/pages/launch/index',
	})
})
</script>

<style>
	.compat-page {
		display: flex;
		flex: 1;
		background-color: #f4e7d9;
	}
</style>
