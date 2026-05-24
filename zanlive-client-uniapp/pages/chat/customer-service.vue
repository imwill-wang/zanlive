<template>
	<view class="page-root" :key="localeVersion">
		<view class="chat-header-card">
			<view class="service-profile-row">
				<image class="service-avatar" :src="customerServiceAvatar" mode="aspectFill"></image>
				<view class="service-profile-copy">
					<view class="service-title-row">
						<text class="section-title">{{ customerServiceName }}</text>
						<text v-if="isOfficial" class="service-official-badge">{{ officialText }}</text>
					</view>
					<text class="section-subtitle">{{ headerSubtitle }}</text>
				</view>
			</view>
		</view>
		<scroll-view class="chat-scroll" :scroll-y="true" :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
			<view class="chat-list">
				<view v-if="chatList.length == 0 && !loading" class="section-card service-empty-card">
					<text class="empty-text">{{ emptyText }}</text>
				</view>
				<view v-if="loading" class="section-card service-empty-card">
					<text class="empty-text">{{ loadingText }}</text>
				</view>
				<view v-for="item in chatList" :key="item.id" :class="item.isSelf ? 'chat-item-self' : 'chat-item-other'">
					<view :class="item.isSelf ? 'chat-bubble-self' : 'chat-bubble-other'">
						<text v-if="item.messageType != 'image'" :class="item.isSelf ? 'chat-bubble-text-self' : 'chat-bubble-text-other'">{{ item.content }}</text>
						<image v-else class="chat-image" :src="resolveChatImage(item)" mode="widthFix" @tap="previewChatImage(item)"></image>
					</view>
					<text class="chat-time">{{ item.createdAt }}</text>
				</view>
				<view :style="'height:' + composerPlaceholderHeight + 'px;'" class="chat-composer-spacer"></view>
				<view id="customer-service-bottom-anchor" class="chat-bottom-anchor"></view>
			</view>
		</scroll-view>
		<view class="chat-composer" :style="'bottom:' + keyboardHeight + 'px;'">
			<view class="chat-input-bar">
				<view class="chat-input-shell">
					<input class="chat-input" v-model="draft" :placeholder="inputPlaceholder" :adjust-position="false" confirm-type="send" @confirm="handleSend" @focus="handleInputFocus" />
					<view class="chat-input-icon-button" :class="imageUploading ? 'chat-input-icon-button is-disabled' : 'chat-input-icon-button'" @tap="handleChooseImage">
						<image class="chat-input-icon" src="/static/icon/add-circle.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="chat-send-icon-button" @tap="handleSend">
					<image class="chat-send-icon" src="/static/icon/send-y.png" mode="aspectFit"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { nextTick, ref } from 'vue'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { getCustomerServiceAccount, getCustomerServiceSession, getRechargeOfflineInfo, uploadCustomerServiceImage } from '../../services/customer-service'
	import { addChatMessageChannelListener, addChatMessageChannelStatusListener, getHistory, getMessagePatch, readChatMessages, sendImageMessage, sendTextMessage, startChatMessageChannel, stopChatMessageChannel } from '../../services/message'
	import { getCachedChatHistory, mergeChatMessages, saveCachedChatHistory } from '../../store/message-cache'
	import { clearActiveSession, setActiveSession, setOfficialSession } from '../../store/session'
	import { resolveMediaUrl, resolveUnknownErrorMessage } from '../../services/http'
	import type { ChatMessage } from '../../types/message'

	const CHAT_POLL_INTERVAL = 3000
	const COMPOSER_BASE_HEIGHT = 86

	const localeVersion = ref(0)
	const headerSubtitle = ref('')
	const inputPlaceholder = ref('')
	const uploadingImageText = ref('')
	const emptyText = ref('')
	const loadingText = ref('')
	const officialText = ref('')
	const customerServiceUid = ref(0)
	const customerServiceName = ref('Support')
	const customerServiceAvatar = ref('/static/logo.png')
	const isOfficial = ref(true)
	const chatList = ref<ChatMessage[]>([])
	const draft = ref('')
	const loading = ref(false)
	const imageUploading = ref(false)
	const scrollIntoView = ref('customer-service-bottom-anchor')
	const contextLoading = ref(false)
	const keyboardHeight = ref(0)
	const composerPlaceholderHeight = ref(COMPOSER_BASE_HEIGHT)
	let keyboardHeightChangeHandler: ((result: any) => void) | null = null
	let contextTask: Promise<void> | null = null
	let historyPollTimer: ReturnType<typeof setInterval> | null = null
	let removeRealtimeMessageListener: (() => void) | null = null
	let removeRealtimeStatusListener: (() => void) | null = null

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		headerSubtitle.value = t('support.headerSubtitle')
		inputPlaceholder.value = t('support.inputPlaceholder')
		uploadingImageText.value = t('support.uploadingImage')
		emptyText.value = t('support.empty')
		loadingText.value = t('support.loading')
		officialText.value = t('common.official')
		applyNavigationTitle(t('nav.support'))
	}

	function syncScrollToBottom(): void {
		nextTick(() => {
			scrollIntoView.value = ''
			nextTick(() => {
				scrollIntoView.value = 'customer-service-bottom-anchor'
			})
		})
	}

	function syncComposerPlaceholderHeight(): void {
		composerPlaceholderHeight.value = keyboardHeight.value + COMPOSER_BASE_HEIGHT
	}

	function handleInputFocus(): void {
		syncScrollToBottom()
	}

	function bindKeyboardHeightChange(): void {
		if (keyboardHeightChangeHandler != null) {
			return
		}
		keyboardHeightChangeHandler = (result: any) => {
			const nextHeight = result != null && typeof result.height == 'number' ? result.height : 0
			keyboardHeight.value = nextHeight > 0 ? nextHeight : 0
			syncComposerPlaceholderHeight()
			syncScrollToBottom()
		}
		if (typeof uni.onKeyboardHeightChange == 'function') {
			uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
		}
	}

	function unbindKeyboardHeightChange(): void {
		if (keyboardHeightChangeHandler == null) {
			return
		}
		if (typeof uni.offKeyboardHeightChange == 'function') {
			uni.offKeyboardHeightChange(keyboardHeightChangeHandler)
		}
		keyboardHeightChangeHandler = null
	}

	async function markCurrentMessagesRead(list: ChatMessage[]): Promise<void> {
		if (customerServiceUid.value <= 0 || list.length == 0) {
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
		await readChatMessages(customerServiceUid.value, unreadIds).catch(() => false)
		applyChatList(list.map((item) => ({
			...item,
			unread: item.isSelf ? item.unread : false,
		})), false)
	}

	function isCurrentSessionMessage(item: ChatMessage): boolean {
		return (item.fromId == customerServiceUid.value && item.toId > 0) || (item.toId == customerServiceUid.value && item.fromId > 0)
	}

	function persistChatHistory(list: ChatMessage[]): void {
		if (customerServiceUid.value > 0 && list.length > 0) {
			saveCachedChatHistory(customerServiceUid.value, list)
		}
	}

	function applyChatList(list: ChatMessage[], scrollToBottom: boolean): void {
		chatList.value = list
		persistChatHistory(list)
		if (scrollToBottom) {
			syncScrollToBottom()
		}
	}

	async function loadHistoryData(): Promise<void> {
		if (customerServiceUid.value <= 0) {
			chatList.value = []
			return
		}
		const cachedList = getCachedChatHistory(customerServiceUid.value)
		if (cachedList.length > 0) {
			applyChatList(cachedList, true)
		}
		try {
			const list = await getHistory(customerServiceUid.value)
			const mergedList = mergeChatMessages(cachedList, list)
			applyChatList(mergedList, mergedList.length != cachedList.length)
			await markCurrentMessagesRead(mergedList)
		} catch (_error) {
			if (cachedList.length > 0) {
				applyChatList(cachedList, false)
			}
		}
	}

	async function syncLatestMessages(): Promise<void> {
		if (customerServiceUid.value <= 0 || loading.value) {
			return
		}
		const patchList = await getMessagePatch().catch(() => [] as ChatMessage[])
		const currentSessionPatchList = patchList.filter((item) => isCurrentSessionMessage(item))
		if (currentSessionPatchList.length == 0) {
			return
		}
		const mergedList = mergeChatMessages(chatList.value, currentSessionPatchList)
		const changed = mergedList.length != chatList.value.length || mergedList[mergedList.length - 1].id != chatList.value[chatList.value.length - 1]?.id
		applyChatList(mergedList, changed)
		await markCurrentMessagesRead(mergedList)
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
				} else if (customerServiceUid.value > 0) {
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

	async function loadContext(): Promise<void> {
		if (contextTask != null) {
			await contextTask
			return
		}
		contextTask = (async () => {
			contextLoading.value = true
			loading.value = true
			try {
				const session = await getCustomerServiceSession()
				if (session != null && session.uid > 0) {
					customerServiceUid.value = session.uid
					customerServiceName.value = session.name
					customerServiceAvatar.value = session.avatar
					isOfficial.value = session.official
					setOfficialSession(session.uid)
					setActiveSession(session.uid)
				}
				const rechargeInfo = await getRechargeOfflineInfo()
				if (rechargeInfo != null) {
					if (customerServiceUid.value <= 0 && rechargeInfo.customerServiceUid > 0) {
						customerServiceUid.value = rechargeInfo.customerServiceUid
						setOfficialSession(rechargeInfo.customerServiceUid)
						setActiveSession(rechargeInfo.customerServiceUid)
					}
				if (customerServiceName.value.length == 0 && rechargeInfo.customerServiceName.length > 0) {
					customerServiceName.value = rechargeInfo.customerServiceName
				}
				}
				if (customerServiceUid.value <= 0) {
					const account = await getCustomerServiceAccount().catch(() => null)
				if (account != null && account.id > 0) {
					customerServiceUid.value = account.id
					customerServiceName.value = account.name
					customerServiceAvatar.value = account.avatar
					isOfficial.value = account.official
					setOfficialSession(account.id)
					setActiveSession(account.id)
				}
			}
			if (customerServiceUid.value <= 0) {
				uni.showToast({
					title: t('support.sessionUnavailable'),
						icon: 'none',
					})
					chatList.value = []
					return
				}
				await loadHistoryData()
			} catch (error) {
				uni.showToast({
					title: resolveUnknownErrorMessage(error, t('support.loadError')),
					icon: 'none',
				})
			} finally {
				loading.value = false
				contextLoading.value = false
				contextTask = null
			}
		})()
		await contextTask
	}

	async function ensureCustomerServiceReady(): Promise<boolean> {
		if (customerServiceUid.value > 0) {
			return true
		}
		await loadContext()
		return customerServiceUid.value > 0
	}

	function resolveChatImage(item: ChatMessage): string {
		if (item.image == null) {
			return '/static/logo.png'
		}
		return resolveMediaUrl('/file/' + item.image.bucket + '/' + item.image.image)
	}

	function previewChatImage(item: ChatMessage): void {
		const url = resolveChatImage(item)
		uni.previewImage({
			urls: [url],
			current: url,
		})
	}

	async function handleSend(): Promise<void> {
		const content = draft.value.trim()
		if (content.length == 0) {
			return
		}
		const ready = await ensureCustomerServiceReady()
		if (!ready) {
			return
		}
		sendTextMessage(customerServiceUid.value, content).then((item) => {
			applyChatList(mergeChatMessages(chatList.value, [item]), true)
			draft.value = ''
		}).catch((error) => {
			uni.showToast({
				title: resolveUnknownErrorMessage(error, t('support.sendError')),
				icon: 'none',
			})
		})
	}

	async function handleChooseImage(): Promise<void> {
		if (imageUploading.value) {
			uni.showToast({
				title: uploadingImageText.value,
				icon: 'none',
			})
			return
		}
		const ready = await ensureCustomerServiceReady()
		if (!ready) {
			return
		}
		if (draft.value.trim() == t('support.rechargeAction')) {
			draft.value = ''
		}
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (result) => {
				const filePath = result.tempFilePaths != null && result.tempFilePaths.length > 0 ? result.tempFilePaths[0] : ''
				if (filePath.length == 0) {
					return
				}
				imageUploading.value = true
				uploadCustomerServiceImage(filePath).then((payload) => {
					return sendImageMessage(customerServiceUid.value, payload)
				}).then((item) => {
					applyChatList(mergeChatMessages(chatList.value, [item]), true)
				}).catch((error) => {
					uni.showToast({
						title: resolveUnknownErrorMessage(error, t('support.imageSendError')),
						icon: 'none',
					})
				}).finally(() => {
					imageUploading.value = false
				})
			},
		})
	}

	onLoad((_options) => {
		syncLocaleUI()
		syncComposerPlaceholderHeight()
		bindKeyboardHeightChange()
		loadContext()
	})

	onShow(() => {
		syncLocaleUI()
		bindRealtimeChannel()
		if (customerServiceUid.value > 0) {
			setActiveSession(customerServiceUid.value)
		}
		if (customerServiceUid.value <= 0) {
			loadContext()
		} else {
			syncLatestMessages()
		}
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
		keyboardHeight.value = 0
		unbindRealtimeChannel()
		stopHistoryPolling()
		stopChatMessageChannel()
		unbindKeyboardHeightChange()
		clearActiveSession()
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

	.service-profile-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.service-avatar {
		width: 52px;
		height: 52px;
		border-radius: 26px;
		background-color: #ead8c8;
		flex-shrink: 0;
	}

	.service-profile-copy {
		display: flex;
		flex-direction: column;
		margin-left: 12px;
		flex: 1;
	}

	.service-title-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.service-official-badge {
		font-size: 11px;
		color: #fff9f2;
		background-color: #8d6248;
		padding: 4px 8px;
		border-radius: 10px;
		margin-left: 8px;
	}

	.chat-scroll {
		flex: 1;
		min-height: 0;
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

	.service-empty-card {
		margin-top: 6px;
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

	.chat-image {
		width: 180px;
		max-width: 180px;
		border-radius: 14px;
		background-color: #ead8c8;
	}

	.chat-time {
		font-size: 11px;
		color: #8a6d54;
		margin-top: 4px;
	}

	.chat-bottom-anchor {
		height: 2px;
	}

	.chat-composer-spacer {
		width: 100%;
	}

	.chat-composer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		box-sizing: border-box;
		background-color: #fff9f2;
		padding-bottom: env(safe-area-inset-bottom);
		box-shadow: 0 -8px 18px rgba(28, 22, 19, 0.06);
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

	.chat-input-shell {
		flex: 1;
		height: 46px;
		display: flex;
		flex-direction: row;
		align-items: center;
		border-radius: 16px;
		background-color: #f7efe6;
		padding-left: 14px;
		padding-right: 6px;
		margin-right: 12px;
		box-sizing: border-box;
	}

	.chat-input-icon-button {
		width: 38px;
		height: 38px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.chat-input-icon-button.is-disabled {
		opacity: 0.45;
	}

	.chat-input-icon {
		width: 24px;
		height: 24px;
	}

	.chat-input {
		flex: 1;
		height: 42px;
		background-color: transparent;
		padding-top: 0px;
		padding-right: 8px;
		padding-bottom: 0px;
		padding-left: 0px;
		font-size: 14px;
		color: #1c1613;
	}

	.chat-send-icon-button {
		width: 36px;
		height: 36px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		border-radius: 18px;
		background-color: #1c1613;
		flex-shrink: 0;
	}

	.chat-send-icon {
		width: 14px;
		height: 14px;
	}
</style>
