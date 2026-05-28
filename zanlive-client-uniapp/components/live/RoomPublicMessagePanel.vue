<template>
	<view class="room-message-layer" :style="'bottom:' + bottom + 'px;'">
		<view class="room-message-header room-surface-chat">
			<text class="room-message-header-text">{{ title }}</text>
			<text v-if="comboText.length > 0" class="room-message-combo">{{ comboText }}</text>
		</view>
		<scroll-view class="room-message-scroll" :scroll-y="true" :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
			<view class="room-message-scroll-content">
				<view v-if="messageList.length == 0" class="room-message-empty">
					<text class="room-message-empty-text">{{ emptyText }}</text>
				</view>
				<view v-for="item in messageList" :id="resolveMessageAnchorId(item.id)" :key="item.id" class="room-message-bubble room-surface-chat">
					<text v-if="item.senderName.length > 0" class="room-message-name">{{ item.senderName }}:</text>
					<text class="room-message-content">{{ item.content }}</text>
				</view>
				<view :id="bottomAnchorId" class="room-message-bottom-anchor" :style="'height:' + bottomSpacerHeight + 'px;'"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import type { LiveMessage } from '../../types/live'

defineProps<{
	title: string
	comboText: string
	messageList: LiveMessage[]
	scrollIntoView: string
	bottomAnchorId: string
	bottomSpacerHeight: number
	bottom: number
	emptyText: string
}>()

function resolveMessageAnchorId(messageId: number): string {
	return 'room-message-' + messageId.toString()
}
</script>

<style>
	.room-message-layer {
		position: fixed;
		left: 16px;
		width: 248px;
		z-index: 18;
	}

	.room-surface-chat {
		background-color: rgba(128, 128, 128, 0.42);
	}

	.room-message-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px 12px;
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
	}

	.room-message-header-text {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
		flex: 1;
	}

	.room-message-combo {
		font-size: 10px;
		font-weight: 700;
		color: #ffd66b;
	}

	.room-message-scroll {
		max-height: 214px;
		border-bottom-left-radius: 18px;
		border-bottom-right-radius: 18px;
		overflow: hidden;
	}

	.room-message-scroll-content {
		display: flex;
		flex-direction: column;
		padding: 8px 0px;
	}

	.room-message-empty {
		padding: 16px 12px;
	}

	.room-message-empty-text {
		font-size: 11px;
		line-height: 17px;
		color: rgba(255, 255, 255, 0.68);
	}

	.room-message-bubble {
		margin-left: 8px;
		margin-right: 8px;
		margin-top: 6px;
		padding: 8px 10px;
		border-radius: 14px;
	}

	.room-message-name {
		font-size: 11px;
		font-weight: 700;
		color: #f8d493;
	}

	.room-message-content {
		font-size: 11px;
		line-height: 17px;
		color: #ffffff;
		margin-left: 4px;
	}

	.room-message-bottom-anchor {
		width: 100%;
	}
</style>
