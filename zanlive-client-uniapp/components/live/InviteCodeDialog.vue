<template>
	<view v-if="visible" class="invite-dialog-root">
		<view class="invite-dialog-mask" @tap="handleCancel"></view>
		<view class="invite-dialog-panel">
			<text class="invite-dialog-title">{{ title }}</text>
			<input
				class="invite-dialog-input"
				v-model="inputValue"
				:placeholder="placeholder"
				:maxlength="32"
				confirm-type="done"
				@confirm="handleConfirm"
			/>
			<text v-if="errorText.length > 0" class="invite-dialog-error">{{ errorText }}</text>
			<view class="invite-dialog-actions">
				<view class="invite-dialog-cancel" @tap="handleCancel">
					<text class="invite-dialog-cancel-text">{{ cancelText }}</text>
				</view>
				<view class="invite-dialog-confirm" @tap="handleConfirm">
					<text class="invite-dialog-confirm-text">{{ loading ? confirmingText : confirmText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
	visible: boolean
	title: string
	placeholder: string
	serverErrorText: string
	cancelText: string
	confirmText: string
	confirmingText: string
	requiredText: string
	loading: boolean
}>()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'confirm', value: string): void
}>()

const inputValue = ref('')
const errorText = ref('')

watch(() => props.visible, (visible) => {
	if (!visible) {
		inputValue.value = ''
		errorText.value = ''
	}
})

watch(() => props.serverErrorText, (message) => {
	if (message != null && message.length > 0) {
		errorText.value = message
	}
})

watch(inputValue, () => {
	if (errorText.value.length > 0) {
		errorText.value = ''
	}
})

function handleCancel(): void {
	if (props.loading) {
		return
	}
	inputValue.value = ''
	errorText.value = ''
	emit('cancel')
}

function handleConfirm(): void {
	if (props.loading) {
		return
	}
	const nextValue = inputValue.value.trim()
	if (nextValue.length == 0) {
		errorText.value = props.requiredText
		return
	}
	errorText.value = ''
	emit('confirm', nextValue)
}
</script>

<style>
	.invite-dialog-root {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 90;
	}

	.invite-dialog-mask {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(28, 22, 19, 0.46);
	}

	.invite-dialog-panel {
		position: absolute;
		left: 24px;
		right: 24px;
		top: 50%;
		transform: translateY(-50%);
		background-color: #fff9f2;
		border-radius: 24px;
		padding: 24px;
		box-sizing: border-box;
	}

	.invite-dialog-title {
		display: block;
		font-size: 18px;
		font-weight: 700;
		color: #1c1613;
		margin-bottom: 16px;
	}

	.invite-dialog-input {
		height: 46px;
		border-radius: 14px;
		background-color: #f7efe6;
		padding: 0 14px;
		font-size: 15px;
		color: #1c1613;
	}

	.invite-dialog-error {
		display: block;
		font-size: 12px;
		color: #b04632;
		margin-top: 10px;
	}

	.invite-dialog-actions {
		display: flex;
		flex-direction: row;
		margin-top: 20px;
	}

	.invite-dialog-cancel,
	.invite-dialog-confirm {
		flex: 1;
		height: 44px;
		border-radius: 22px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.invite-dialog-cancel {
		margin-right: 12px;
		background-color: #ead8c2;
	}

	.invite-dialog-confirm {
		background-color: #1c1613;
	}

	.invite-dialog-cancel-text {
		font-size: 14px;
		font-weight: 600;
		color: #6f5544;
	}

	.invite-dialog-confirm-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}
</style>
