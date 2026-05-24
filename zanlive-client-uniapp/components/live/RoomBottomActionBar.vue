<template>
	<view :key="renderKey" class="room-bottom-bar" :style="'bottom:' + bottom + 'px;'">
		<input class="room-input room-surface-soft" :value="modelValue" :placeholder="placeholder" confirm-type="send" @input="handleInput" @confirm="emit('submit-message')" />
		<view :class="submitEnabled ? 'room-bottom-button room-bottom-button-send-active' : 'room-bottom-button room-bottom-button-send-disabled'" @tap="emit('submit-message')">
			<text :class="submitEnabled ? 'room-bottom-button-text-active' : 'room-bottom-button-text-disabled'">{{ submitting ? sendingText : sendText }}</text>
		</view>
		<view class="room-bottom-button room-bottom-button-accent" @tap="emit('open-gift-panel')">
			<text class="room-bottom-button-text-accent">{{ giftPanelText }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
defineProps<{
	modelValue: string
	placeholder: string
	sendText: string
	sendingText: string
	giftPanelText: string
	bottom: number
	renderKey: number
	submitEnabled: boolean
	submitting: boolean
}>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void
	(event: 'submit-message'): void
	(event: 'open-gift-panel'): void
}>()

function handleInput(event: any): void {
	const detail = event != null && event.detail != null ? event.detail : event
	const value = detail != null && typeof detail.value == 'string' ? detail.value : ''
	emit('update:modelValue', value)
}
</script>

<style>
	.room-bottom-bar {
		position: fixed;
		left: 16px;
		right: 16px;
		display: flex;
		flex-direction: row;
		align-items: center;
		z-index: 20;
	}

	.room-surface-soft {
		background-color: rgba(110, 110, 110, 0.38);
	}

	.room-input {
		flex: 1;
		height: 44px;
		border-radius: 22px;
		padding-left: 16px;
		padding-right: 16px;
		font-size: 13px;
		color: #ffffff;
	}

	.room-bottom-button {
		height: 40px;
		border-radius: 20px;
		padding-left: 14px;
		padding-right: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 10px;
	}

	.room-bottom-button-send-active {
		background-color: #ffffff;
	}

	.room-bottom-button-send-disabled {
		background-color: rgba(255, 255, 255, 0.26);
	}

	.room-bottom-button-accent {
		background-color: #ff6f4b;
	}

	.room-bottom-button-text-active {
		font-size: 12px;
		font-weight: 700;
		color: #111111;
	}

	.room-bottom-button-text-disabled {
		font-size: 12px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
	}

	.room-bottom-button-text-accent {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
	}
</style>
