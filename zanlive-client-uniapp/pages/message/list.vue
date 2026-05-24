<template>
	<view class="page-root" :key="localeVersion">
		<!-- #ifdef APP -->
		<scroll-view class="page-scroll" :scroll-y="true">
		<!-- #endif -->
		<view class="page-content">
			<view class="friend-entry-row friend-entry-row-plain">
				<view class="secondary-button friend-entry-button" @tap="openFriendApply">
					<text class="friend-entry-secondary-text">{{ text.friendApply }}</text>
				</view>
			</view>

			<view v-if="initialLoading" class="section-card message-state-card">
				<text class="message-state-title">{{ text.loading }}</text>
			</view>
			<view v-else-if="errorMessage.length > 0" class="section-card message-state-card">
				<text class="message-state-title">{{ errorMessage }}</text>
				<view class="primary-button message-retry-button" @tap="loadAllData">
					<text class="message-retry-text">{{ retryText }}</text>
				</view>
			</view>
			<view v-else-if="messageEntries.length == 0" class="section-card message-state-card">
				<text class="message-state-title">{{ text.empty }}</text>
			</view>
			<view v-for="item in messageEntries" :key="item.key" class="section-card" @tap="openEntry(item)">
				<view class="section-row friend-row">
					<image class="message-avatar" :src="item.avatar" mode="aspectFill"></image>
					<view class="message-main friend-main">
						<view class="message-title-row unified-title-row">
							<text class="message-name">{{ item.name }}</text>
							<text v-if="item.official" class="message-badge">{{ text.official }}</text>
						</view>
						<text class="friend-id-text" @tap.stop="copyFriendId(item.uid)">ID: {{ item.uid }}</text>
						<text v-if="item.previewText.length > 0" class="message-preview friend-preview">{{ item.previewText }}</text>
						<text v-else-if="item.statusText.length > 0" class="message-preview friend-preview">{{ item.statusText }}</text>
					</view>
					<view v-if="item.hasSession" class="message-meta">
						<text class="meta-text">{{ item.timestampText }}</text>
						<view v-if="item.unreadCount > 0" class="message-unread">
							<text class="message-unread-text">{{ item.unreadCount }}</text>
						</view>
					</view>
					<view v-else class="secondary-button friend-chat-button" @tap.stop="openEntry(item)">
						<text class="friend-chat-text">{{ text.friendMessage }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- #ifdef APP -->
		</scroll-view>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
import { onHide, onNavigationBarButtonTap, onShow, onUnload } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
	import { applyNavigationTitle, applyTabBarLocale, getCustomerServiceRoute, i18nStore, t } from '../../store/i18n'
	import { getFriendList } from '../../services/friend'
	import { getCachedSessionList, mergeSessionList, saveCachedSessionList } from '../../store/message-cache'
	import { addChatMessageChannelListener, getSessionList, startChatMessageChannel } from '../../services/message'
	import type { FriendProfile } from '../../types/user'
	import type { SessionItem } from '../../types/message'

	type MessageEntry = {
		key: string
		source: 'session' | 'friend'
		uid: number
		name: string
		avatar: string
		official: boolean
		hasSession: boolean
		previewText: string
		timestampText: string
		timestamp: number
		unreadCount: number
		statusText: string
	}

	const SESSION_POLL_INTERVAL = 3000

	const localeVersion = ref(0)
	const text = reactive({
		loading: '',
		empty: '',
		official: '',
		friendApply: '',
		friendSearch: '',
		friendMessage: '',
	})
	const sessionList = ref<SessionItem[]>(getCachedSessionList())
	const friendList = ref<FriendProfile[]>([])
	const messageEntries = ref<MessageEntry[]>([])
	const initialLoading = ref(sessionList.value.length == 0)
	const errorMessage = ref('')
	const retryText = ref('')
	let sessionPollTimer: ReturnType<typeof setInterval> | null = null
	let removeRealtimeMessageListener: (() => void) | null = null

	function applySessionList(nextList: SessionItem[], persistCache: boolean): void {
		if (nextList.length == 0) {
			sessionList.value = [...sessionList.value]
			return
		}
		const mergedList = mergeSessionList(sessionList.value, nextList)
		sessionList.value = mergedList
		if (persistCache) {
			saveCachedSessionList(mergedList)
		}
	}

	function syncSessionList(): void {
		getSessionList().then((list) => {
			applySessionList(list, true)
			buildMessageEntries()
		}).catch(() => {})
	}

	function startSessionPolling(): void {
		if (sessionPollTimer != null) {
			return
		}
		sessionPollTimer = setInterval(() => {
			syncSessionList()
		}, SESSION_POLL_INTERVAL)
	}

	function stopSessionPolling(): void {
		if (sessionPollTimer == null) {
			return
		}
		clearInterval(sessionPollTimer)
		sessionPollTimer = null
	}

	function bindRealtimeChannel(): void {
		if (removeRealtimeMessageListener != null) {
			return
		}
		removeRealtimeMessageListener = addChatMessageChannelListener(() => {
			syncSessionList()
		})
	}

	function unbindRealtimeChannel(): void {
		if (removeRealtimeMessageListener == null) {
			return
		}
		removeRealtimeMessageListener()
		removeRealtimeMessageListener = null
	}

	function openSession(uid: number, name: string, official: boolean): void {
		if (official) {
			uni.navigateTo({
				url: getCustomerServiceRoute(),
			})
			return
		}
		uni.navigateTo({
			url: '/pages/chat/session?uid=' + uid + '&name=' + encodeURIComponent(name),
		})
	}

	function openFriendSearch(): void {
		uni.navigateTo({
			url: '/pages/friend/search',
		})
	}

	function openFriendApply(): void {
		uni.navigateTo({
			url: '/pages/friend/apply',
		})
	}

	function openEntry(item: MessageEntry): void {
		openSession(item.uid, item.name, item.official)
	}

	function buildMessageEntries(): void {
		const sessionMap: Record<number, SessionItem> = {}
		for (let i = 0; i < sessionList.value.length; i++) {
			const session = sessionList.value[i]
			if (session.uid > 0) {
				sessionMap[session.uid] = session
			}
		}
		const entries: MessageEntry[] = []
		for (let i = 0; i < sessionList.value.length; i++) {
			const item = sessionList.value[i]
			entries.push({
				key: 'session-' + item.uid.toString(),
				source: 'session',
				uid: item.uid,
				name: item.name,
				avatar: item.avatar,
				official: item.official,
				hasSession: true,
				previewText: item.lastMessage,
				timestampText: item.lastTime,
				timestamp: item.lastTimestamp != null ? item.lastTimestamp : 0,
				unreadCount: item.unreadCount,
				statusText: '',
			})
		}
		for (let i = 0; i < friendList.value.length; i++) {
			const friend = friendList.value[i]
			if (sessionMap[friend.id] != null) {
				const target = entries.find((entry) => entry.uid == friend.id)
				if (target != null && target.official != true) {
					target.name = friend.name
					target.avatar = friend.avatar
					target.statusText = friend.statusText
				}
				continue
			}
			entries.push({
				key: 'friend-' + friend.id.toString(),
				source: 'friend',
				uid: friend.id,
				name: friend.name,
				avatar: friend.avatar,
				official: false,
				hasSession: false,
				previewText: '',
				timestampText: '',
				timestamp: 0,
				unreadCount: 0,
				statusText: friend.statusText,
			})
		}
		entries.sort((left, right) => {
			if (left.official != right.official) {
				return left.official ? -1 : 1
			}
			if (left.hasSession != right.hasSession) {
				return left.hasSession ? -1 : 1
			}
			if (left.hasSession && right.hasSession && left.timestamp != right.timestamp) {
				return right.timestamp - left.timestamp
			}
			return left.name.localeCompare(right.name)
		})
		messageEntries.value = entries
	}

	function loadAllData(): void {
		initialLoading.value = true
		errorMessage.value = ''
		let sessionFailed = false
		let friendFailed = false
		const tasks: Promise<void>[] = [
			getSessionList().then((list) => {
				applySessionList(list, true)
			}).catch(() => {
				sessionFailed = true
				const cachedList = getCachedSessionList()
				sessionList.value = cachedList.length > 0 ? cachedList : []
			}),
			getFriendList().then((list) => {
				friendList.value = list
			}).catch(() => {
				friendFailed = true
				friendList.value = []
			}),
		]
		Promise.all(tasks).then(() => {
			buildMessageEntries()
			if (sessionFailed && friendFailed && messageEntries.value.length == 0) {
				errorMessage.value = t('messageList.loadError')
			}
		}).finally(() => {
			initialLoading.value = false
		})
	}

	function copyFriendId(id: number): void {
		if (id <= 0) {
			return
		}
		uni.setClipboardData({
			data: id.toString(),
			success: () => {
				uni.showToast({
					title: t('common.copySuccess'),
					icon: 'none',
				})
			},
		})
	}

	onShow(() => {
		localeVersion.value = i18nStore.version
		applyTabBarLocale()
		text.loading = t('messageList.loading')
		text.empty = t('messageList.empty')
		text.official = t('common.official')
		text.friendApply = t('friendList.applyButton')
		text.friendSearch = t('friendList.searchButton')
		text.friendMessage = t('friendList.sendMessage')
		retryText.value = t('common.retry')
		applyNavigationTitle(t('nav.messages'))
		sessionList.value = getCachedSessionList()
		buildMessageEntries()
		bindRealtimeChannel()
		startChatMessageChannel()
		loadAllData()
		startSessionPolling()
	})

	onNavigationBarButtonTap(() => {
		openFriendSearch()
	})

	onHide(() => {
		unbindRealtimeChannel()
		stopSessionPolling()
	})

	onUnload(() => {
		unbindRealtimeChannel()
		stopSessionPolling()
	})
</script>

<style>
	page {
		background-color: #f4e7d9;
		height: 100%;
	}

	.page-root {
		height: 100vh;
		min-height: 100vh;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	.page-scroll {
		height: 100%;
	}

	.message-state-card {
		align-items: center;
	}

	.message-state-title {
		font-size: 15px;
		line-height: 22px;
		color: #1c1613;
		text-align: center;
	}

	.message-retry-button {
		margin-top: 16px;
		padding-left: 18px;
		padding-right: 18px;
	}

	.message-retry-text {
		font-size: 13px;
		font-weight: 600;
		color: #fff9f2;
	}

	.message-main {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		padding-right: 12px;
	}

	.friend-main {
		padding-right: 16px;
	}

	.unified-title-row {
		margin-bottom: 2px;
	}

	.message-avatar {
		width: 44px;
		height: 44px;
		border-radius: 22px;
		margin-right: 12px;
		background-color: rgba(141, 98, 72, 0.18);
		flex-shrink: 0;
	}

	.message-title-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		min-width: 0;
		margin-bottom: 6px;
	}

	.message-name {
		font-size: 16px;
		font-weight: 600;
		color: #1c1613;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.message-badge {
		font-size: 11px;
		color: #fff9f2;
		background-color: #8d6248;
		padding-top: 4px;
		padding-right: 8px;
		padding-bottom: 4px;
		padding-left: 8px;
		border-radius: 10px;
		margin-left: 8px;
	}

	.message-preview {
		font-size: 13px;
		color: #70584a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.friend-preview {
		white-space: normal;
		overflow: visible;
	}

	.friend-id-text {
		font-size: 12px;
		line-height: 18px;
		color: #7d604d;
		margin-top: 4px;
	}

	.friend-entry-row {
		display: flex;
		flex-direction: row;
		margin-top: 16px;
		gap: 12px;
	}

	.friend-entry-row-plain {
		margin-top: 0;
		margin-bottom: 16px;
	}

	.friend-entry-button {
		align-self: flex-start;
		padding-left: 18px;
		padding-right: 18px;
	}

	.friend-entry-secondary-text {
		font-size: 13px;
		font-weight: 600;
		color: #6f5544;
	}

	.friend-entry-primary-text {
		font-size: 13px;
		font-weight: 600;
		color: #fff9f2;
	}

	.friend-row {
		align-items: center;
	}

	.friend-chat-button {
		min-width: 88px;
		padding-left: 14px;
		padding-right: 14px;
		flex-shrink: 0;
	}

	.friend-chat-text {
		font-size: 13px;
		font-weight: 600;
		color: #6f5544;
	}

	.message-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
		height: 52px;
	}

	.message-unread {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		border-radius: 10px;
		background-color: #c7543c;
		padding-top: 0px;
		padding-right: 6px;
		padding-bottom: 0px;
		padding-left: 6px;
	}

	.message-unread-text {
		font-size: 11px;
		color: #fff9f2;
	}
</style>
