<template>
	<view class="page-root" :key="localeVersion">
		<view class="chat-header-card">
			<text class="section-title">{{ chatName }}</text>
			<text class="section-subtitle">{{ subtitleText }}</text>
		</view>
		<scroll-view class="chat-scroll" :scroll-y="true" :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
			<view class="chat-list">
				<view v-for="item in chatList" :key="item.id" :class="item.isSelf ? 'chat-item-self' : 'chat-item-other'">
					<view :class="item.isSelf ? 'chat-bubble-self' : 'chat-bubble-other'">
						<text :class="item.isSelf ? 'chat-bubble-text-self' : 'chat-bubble-text-other'">{{ item.content }}</text>
					</view>
					<text class="chat-time">{{ item.createdAt }}</text>
				</view>
				<view id="chat-bottom-anchor" class="chat-bottom-anchor"></view>
			</view>
		</scroll-view>
		<view class="chat-input-bar">
			<input class="chat-input" v-model="draft" :placeholder="inputPlaceholder" />
			<view class="primary-button chat-send-button" @tap="handleSend">
				<text class="chat-send-text">{{ sendText }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
	import { nextTick, ref } from 'vue'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { addChatMessageChannelListener, addChatMessageChannelStatusListener, getHistory, getMessagePatch, readChatMessages, sendMessage, startChatMessageChannel, stopChatMessageChannel } from '../../services/message'
	import { getCachedChatHistory, mergeChatMessages, saveCachedChatHistory } from '../../store/message-cache'
	import { setActiveSession } from '../../store/session'
	import type { ChatMessage } from '../../types/message'

	const CHAT_POLL_INTERVAL = 3000

	const localeVersion = ref(0)
	const subtitleText = ref('')
	const inputPlaceholder = ref('')
	const sendText = ref('')
	const uid = ref(0)
	const chatName = ref('Chat')
	const useDefaultChatName = ref(true)
	const draft = ref('')
	const chatList = ref<ChatMessage[]>([])
	const scrollIntoView = ref('chat-bottom-anchor')
	let historyPollTimer: ReturnType<typeof setInterval> | null = null
	let removeRealtimeMessageListener: (() => void) | null = null
	let removeRealtimeStatusListener: (() => void) | null = null

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		subtitleText.value = t('chatSession.subtitle')
		inputPlaceholder.value = t('chatSession.inputPlaceholder')
		sendText.value = t('common.send')
		applyNavigationTitle(t('nav.chat'))
		if (useDefaultChatName.value) {
			chatName.value = t('nav.chat')
		}
	}

	function syncScrollToBottom(): void {
		nextTick(() => {
			scrollIntoView.value = ''
			nextTick(() => {
				scrollIntoView.value = 'chat-bottom-anchor'
			})
		})
	}

	async function markCurrentMessagesRead(list: ChatMessage[]): Promise<void> {
		if (uid.value <= 0 || list.length == 0) {
			return
		}
		const unreadIds: number[] = []
		for (let i = 0; i < list.length; i++) {
			const item = list[i]
			if (!item.isSelf && item.unread == true) {
				unreadIds.push(item.id)
			}
		}
		if (unreadIds.length == 0) {
			return
		}
		await readChatMessages(uid.value, unreadIds).catch(() => false)
		applyChatList(list.map((item) => ({
			...item,
			unread: item.isSelf ? item.unread : false,
		})), false)
	}

	function isCurrentSessionMessage(item: ChatMessage): boolean {
		return (item.fromId == uid.value && item.toId > 0) || (item.toId == uid.value && item.fromId > 0)
	}

	function persistChatHistory(list: ChatMessage[]): void {
		if (uid.value > 0 && list.length > 0) {
			saveCachedChatHistory(uid.value, list)
		}
	}

	function applyChatList(list: ChatMessage[], scrollToBottom: boolean): void {
		chatList.value = list
		persistChatHistory(list)
		if (scrollToBottom) {
			syncScrollToBottom()
		}
	}

	function loadHistoryData(): void {
		const cachedList = getCachedChatHistory(uid.value)
		if (cachedList.length > 0) {
			applyChatList(cachedList, true)
		}
		getHistory(uid.value).then(async (list) => {
			const mergedList = mergeChatMessages(cachedList, list)
			applyChatList(mergedList, mergedList.length != cachedList.length)
			await markCurrentMessagesRead(mergedList)
		}).catch(() => {
			if (cachedList.length > 0) {
				applyChatList(cachedList, false)
			}
		})
	}

	function syncLatestMessages(): void {
		if (uid.value <= 0) {
			return
		}
		getMessagePatch().then(async (patchList) => {
			const currentSessionPatchList = patchList.filter((item) => isCurrentSessionMessage(item))
			if (currentSessionPatchList.length == 0) {
				return
			}
			const mergedList = mergeChatMessages(chatList.value, currentSessionPatchList)
			const changed = mergedList.length != chatList.value.length || mergedList[mergedList.length - 1]?.id != chatList.value[chatList.value.length - 1]?.id
			applyChatList(mergedList, changed)
			await markCurrentMessagesRead(mergedList)
		})
	}

	function applyIncomingRealtimeMessage(message: ChatMessage): void {
		if (!isCurrentSessionMessage(message)) {
			return
		}
		const mergedList = mergeChatMessages(chatList.value, [message])
		const changed = mergedList.length != chatList.value.length || mergedList[mergedList.length - 1]?.id != chatList.value[chatList.value.length - 1]?.id
		applyChatList(mergedList, changed)
		markCurrentMessagesRead(mergedList)
	}

	function bindRealtimeChannel(): void {
		if (removeRealtimeMessageListener == null) {
			removeRealtimeMessageListener = addChatMessageChannelListener((message) => {
				applyIncomingRealtimeMessage(message)
			})
		}
		if (removeRealtimeStatusListener == null) {
			removeRealtimeStatusListener = addChatMessageChannelStatusListener((status) => {
				if (status == 'connected') {
					stopHistoryPolling()
				} else if (uid.value > 0) {
					startHistoryPolling()
				}
			})
		}
	}

	function unbindRealtimeChannel(): void {
		if (removeRealtimeMessageListener != null) {
			removeRealtimeMessageListener()
			removeRealtimeMessageListener = null
		}
		if (removeRealtimeStatusListener != null) {
			removeRealtimeStatusListener()
			removeRealtimeStatusListener = null
		}
	}

	function startHistoryPolling(): void {
		if (historyPollTimer != null) {
			return
		}
		historyPollTimer = setInterval(() => {
			syncLatestMessages()
		}, CHAT_POLL_INTERVAL)
	}

	function stopHistoryPolling(): void {
		if (historyPollTimer == null) {
			return
		}
		clearInterval(historyPollTimer)
		historyPollTimer = null
	}

	function handleSend(): void {
		if (draft.value.length == 0) {
			return
		}
		sendMessage(uid.value, draft.value).then((item) => {
			applyChatList(mergeChatMessages(chatList.value, [item]), true)
			draft.value = ''
		})
	}

		onLoad((options) => {
		const uidValue = options['uid']
		const nameValue = options['name']
		if (uidValue != null) {
			uid.value = parseInt(uidValue as string, 10)
		}
		if (nameValue != null) {
			chatName.value = nameValue as string
			useDefaultChatName.value = false
		} else {
			useDefaultChatName.value = true
		}
		syncLocaleUI()
		setActiveSession(uid.value)
		loadHistoryData()
	})

	onShow(() => {
		syncLocaleUI()
		bindRealtimeChannel()
		syncLatestMessages()
		const opened = startChatMessageChannel()
		if (!opened) {
			startHistoryPolling()
		}
	})

	onHide(() => {
		unbindRealtimeChannel()
		stopHistoryPolling()
		stopChatMessageChannel()
	})

	onUnload(() => {
		unbindRealtimeChannel()
		stopHistoryPolling()
		stopChatMessageChannel()
	})
</script>

<style>
	.chat-header-card {
		display: flex;
		flex-direction: column;
		padding-top: 18px;
		padding-right: 18px;
		padding-bottom: 12px;
		padding-left: 18px;
		background-color: #f4e7d9;
	}

	.chat-scroll {
		flex: 1;
		background-color: #f4e7d9;
	}

	.chat-list {
		display: flex;
		flex-direction: column;
		padding-top: 0px;
		padding-right: 18px;
		padding-bottom: 16px;
		padding-left: 18px;
	}

	.chat-item-self {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		margin-top: 12px;
	}

	.chat-item-other {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-top: 12px;
	}

	.chat-bubble-self {
		max-width: 285px;
		background-color: #1c1613;
		border-radius: 18px;
		padding-top: 12px;
		padding-right: 14px;
		padding-bottom: 12px;
		padding-left: 14px;
	}

	.chat-bubble-other {
		max-width: 285px;
		background-color: #fff9f2;
		border-radius: 18px;
		padding-top: 12px;
		padding-right: 14px;
		padding-bottom: 12px;
		padding-left: 14px;
	}

	.chat-bubble-text-self {
		font-size: 14px;
		line-height: 20px;
		color: #fff9f2;
	}

	.chat-bubble-text-other {
		font-size: 14px;
		line-height: 20px;
		color: #1c1613;
	}

	.chat-time {
		font-size: 11px;
		color: #8a6d54;
		margin-top: 4px;
	}

	.chat-bottom-anchor {
		height: 2px;
	}

	.chat-input-bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-top: 12px;
		padding-right: 18px;
		padding-bottom: 18px;
		padding-left: 18px;
		background-color: #fff9f2;
	}

	.chat-input {
		flex: 1;
		height: 42px;
		border-radius: 14px;
		background-color: #f7efe6;
		padding-top: 0px;
		padding-right: 14px;
		padding-bottom: 0px;
		padding-left: 14px;
		font-size: 14px;
		color: #1c1613;
		margin-right: 10px;
	}

	.chat-send-button {
		padding-left: 14px;
		padding-right: 14px;
	}

	.chat-send-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}
</style>
