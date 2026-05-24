<template>
	<view v-if="visible" class="room-ranking-modal-root">
		<view class="room-ranking-modal-mask" @tap="emit('close')"></view>
		<view class="room-ranking-modal-card">
			<view class="room-ranking-modal-header">
				<text class="room-ranking-modal-title">{{ title }}</text>
				<text class="room-ranking-modal-close" @tap="emit('close')">x</text>
			</view>
			<scroll-view class="room-ranking-modal-scroll" :scroll-y="true">
				<view v-if="loading" class="room-ranking-modal-empty">
					<text class="room-ranking-modal-empty-text">{{ loadingText }}</text>
				</view>
				<view v-else-if="items.length == 0" class="room-ranking-modal-empty">
					<text class="room-ranking-modal-empty-text">{{ emptyText }}</text>
				</view>
				<view v-for="item in items" :key="item.rankNo.toString() + '-' + item.roomId.toString()" class="room-ranking-modal-item">
					<text class="room-ranking-modal-rank">#{{ item.rankNo }}</text>
					<image class="room-ranking-modal-avatar" :src="item.anchorAvatar" mode="aspectFill"></image>
					<view class="room-ranking-modal-copy">
						<text class="room-ranking-modal-name">{{ item.anchorName }}</text>
						<text class="room-ranking-modal-meta">{{ item.liveTitle }}</text>
					</view>
					<text class="room-ranking-modal-score">{{ scoreLabel }} {{ item.totalAmount }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
import type { LiveRoomRankingItem } from '../../types/live'

defineProps<{
	visible: boolean
	loading: boolean
	title: string
	loadingText: string
	emptyText: string
	scoreLabel: string
	items: LiveRoomRankingItem[]
}>()

const emit = defineEmits<{
	(event: 'close'): void
}>()
</script>

<style>
	.room-ranking-modal-root {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		z-index: 34;
	}

	.room-ranking-modal-mask {
		position: absolute;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-color: rgba(0, 0, 0, 0.58);
	}

	.room-ranking-modal-card {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 24px;
		max-height: 360px;
		border-radius: 22px;
		background: linear-gradient(180deg, rgba(30, 25, 24, 0.96) 0%, rgba(17, 16, 18, 0.98) 100%);
		overflow: hidden;
	}

	.room-ranking-modal-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom-width: 1px;
		border-bottom-style: solid;
		border-bottom-color: rgba(255, 255, 255, 0.08);
	}

	.room-ranking-modal-title {
		font-size: 15px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-ranking-modal-close {
		font-size: 14px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.72);
	}

	.room-ranking-modal-scroll {
		max-height: 288px;
	}

	.room-ranking-modal-empty {
		padding: 28px 18px;
	}

	.room-ranking-modal-empty-text {
		font-size: 12px;
		line-height: 18px;
		color: rgba(255, 255, 255, 0.72);
	}

	.room-ranking-modal-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 14px 16px;
		border-bottom-width: 1px;
		border-bottom-style: solid;
		border-bottom-color: rgba(255, 255, 255, 0.04);
	}

	.room-ranking-modal-rank {
		width: 36px;
		font-size: 12px;
		font-weight: 700;
		color: #ffcc73;
	}

	.room-ranking-modal-avatar {
		width: 34px;
		height: 34px;
		border-radius: 17px;
		background-color: #2b2b2b;
	}

	.room-ranking-modal-copy {
		flex: 1;
		margin-left: 10px;
		display: flex;
		flex-direction: column;
	}

	.room-ranking-modal-name {
		font-size: 13px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-ranking-modal-meta {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.68);
		margin-top: 4px;
	}

	.room-ranking-modal-score {
		font-size: 12px;
		font-weight: 700;
		color: #ffd66b;
		margin-left: 8px;
	}
</style>
