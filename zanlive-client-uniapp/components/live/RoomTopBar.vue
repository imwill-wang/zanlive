<template>
	<view class="room-topbar" :style="'top:' + topSafeOffset + 'px;'">
		<view class="room-top-main room-surface-soft">
			<image class="room-anchor-avatar" :src="anchorAvatar" mode="aspectFill" @tap="emit('open-anchor-detail')"></image>
			<view class="room-anchor-copy" @tap="emit('open-anchor-detail')">
				<text class="room-anchor-name">{{ anchorName }}</text>
				<text class="room-anchor-meta">{{ roomTitle }}</text>
			</view>
			<view :class="isFollowing ? 'room-follow-button-active' : 'room-follow-button'" :style="followLoading ? 'opacity:0.72;' : ''" @tap="emit('toggle-follow')">
				<text :class="isFollowing ? 'room-follow-button-text-active' : 'room-follow-button-text'">{{ followButtonText }}</text>
			</view>
		</view>
		<view class="room-top-actions">
			<view class="room-ranking-card room-surface-soft" @tap="emit('tap-ranking')">
				<view class="room-ranking-avatars">
					<image v-for="(avatar, index) in topAudienceAvatars" :key="avatar + index.toString()" class="room-ranking-avatar" :src="avatar" mode="aspectFill"></image>
				</view>
				<view class="room-ranking-metrics">
					<text class="room-ranking-count">{{ onlineText }} {{ roomOnlineCount }}</text>
					<text class="room-ranking-heat">{{ heatText }} {{ roomHeat }}</text>
				</view>
			</view>
			<view class="room-close-button room-surface-soft" @tap="emit('close')">
				<text class="room-close-text">x</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
defineProps<{
	topSafeOffset: number
	anchorAvatar: string
	anchorName: string
	roomTitle: string
	isFollowing: boolean
	followButtonText: string
	followLoading: boolean
	topAudienceAvatars: string[]
	roomOnlineCount: number
	roomHeat: number
	onlineText: string
	heatText: string
}>()

const emit = defineEmits<{
	(event: 'toggle-follow'): void
	(event: 'tap-ranking'): void
	(event: 'open-anchor-detail'): void
	(event: 'close'): void
}>()
</script>

<style>
	.room-topbar {
		position: fixed;
		left: 16px;
		right: 16px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		z-index: 20;
	}

	.room-surface-soft {
		background-color: rgba(110, 110, 110, 0.38);
	}

	.room-top-main {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		height: 40px;
		border-radius: 20px;
		padding-left: 6px;
		padding-right: 10px;
	}

	.room-anchor-avatar {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		background-color: #2b2b2b;
	}

	.room-anchor-copy {
		display: flex;
		flex-direction: column;
		margin-left: 8px;
		flex: 1;
	}

	.room-anchor-name {
		font-size: 14px;
		font-weight: 700;
		color: #f0d7c1;
	}

	.room-anchor-meta {
		font-size: 10px;
		color: #f0d7c1;
		margin-top: 2px;
	}

	.room-top-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.room-follow-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding-left: 12px;
		padding-right: 12px;
		border-radius: 15px;
		background-color: #ff335f;
	}

	.room-follow-button-active {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding-left: 12px;
		padding-right: 12px;
		border-radius: 15px;
		background-color: #ffffff;
	}

	.room-follow-button-text {
		font-size: 11px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-follow-button-text-active {
		font-size: 11px;
		font-weight: 700;
		color: #121212;
	}

	.room-ranking-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 34px;
		padding-left: 8px;
		padding-right: 10px;
		border-radius: 17px;
		margin-left: 8px;
	}

	.room-ranking-avatars {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-right: 6px;
	}

	.room-ranking-avatar {
		width: 18px;
		height: 18px;
		border-radius: 9px;
		margin-right: -4px;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(0, 0, 0, 0.28);
	}

	.room-ranking-count {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-ranking-metrics {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.room-ranking-heat {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.86);
		margin-top: 1px;
	}

	.room-close-button {
		width: 34px;
		height: 34px;
		border-radius: 17px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 8px;
	}

	.room-close-text {
		font-size: 14px;
		font-weight: 700;
		color: #ffffff;
	}
</style>
