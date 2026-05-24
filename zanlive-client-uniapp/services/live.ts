import { getCurrencyName, t } from '../store/i18n'
import { formatTimestamp, readBooleanValue, readNumberValue, readObjectArrayValue, readObjectValue, readStringArrayValue, readStringValue, requestApi, resolveMediaUrl } from './http'
import type { AnchorCard, LiveCategory, LiveGiftEvent, LiveMessage, LiveMessageSendResult, LiveRoomActivity, LiveRoomDetail, LiveRoomRankingItem } from '../types/live'

const ROOM_ACTIVITY_SYNC_WINDOW = 12
const USE_MOCK_ROOM_ACTIVITY = false

type MockRoomActivityState = {
	messages: LiveMessage[]
	gifts: LiveGiftEvent[]
	lastSyncTime: number
	messageSequence: number
	giftSequence: number
	nextAutoEventAt: number
}

const mockRoomActivityStore: Record<number, MockRoomActivityState> = {}

function cloneLiveMessage(item: LiveMessage): LiveMessage {
	return {
		id: item.id,
		serverMessageId: item.serverMessageId,
		clientMessageId: item.clientMessageId,
		senderId: item.senderId,
		senderName: item.senderName,
		content: item.content,
		createdAt: item.createdAt,
		timestamp: item.timestamp,
		messageType: item.messageType,
		isSelf: item.isSelf,
		status: item.status,
	}
}

function cloneLiveGiftEvent(item: LiveGiftEvent): LiveGiftEvent {
	return {
		id: item.id,
		senderName: item.senderName,
		giftId: item.giftId,
		giftName: item.giftName,
		giftIcon: item.giftIcon,
		quantity: item.quantity,
		comboCount: item.comboCount,
		createdAt: item.createdAt,
	}
}

function cloneLiveMessages(list: LiveMessage[]): LiveMessage[] {
	return list.map((item) => cloneLiveMessage(item))
}

function cloneLiveGiftEvents(list: LiveGiftEvent[]): LiveGiftEvent[] {
	return list.map((item) => cloneLiveGiftEvent(item))
}

function createInitialRoomMessages(): LiveMessage[] {
	return []
}

function getMockRoomActivityState(roomId: number): MockRoomActivityState {
	let state = mockRoomActivityStore[roomId]
	if (state != null) {
		return state
	}
	const messages = createInitialRoomMessages()
	let messageSequence = 1000
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].id > messageSequence) {
			messageSequence = messages[i].id
		}
	}
	state = {
		messages,
		gifts: [],
		lastSyncTime: Date.now(),
		messageSequence,
		giftSequence: 2000,
		nextAutoEventAt: Date.now() + 8000,
	}
	mockRoomActivityStore[roomId] = state
	return state
}

function appendMockRoomMessage(roomId: number, senderName: string, content: string): LiveMessage {
	const state = getMockRoomActivityState(roomId)
	state.messageSequence += 1
	const item: LiveMessage = {
		id: state.messageSequence,
		serverMessageId: state.messageSequence,
		senderName,
		content,
		createdAt: t('common.now'),
		status: 'sent',
	}
	state.messages = [...state.messages, item]
	if (state.messages.length > 80) {
		state.messages = state.messages.slice(state.messages.length - 80)
	}
	state.lastSyncTime = Date.now()
	return cloneLiveMessage(item)
}

function appendMockGiftEvent(roomId: number, senderName: string, giftId: number, giftName: string, giftIcon: string, quantity: number, comboCount: number): LiveGiftEvent {
	const state = getMockRoomActivityState(roomId)
	state.giftSequence += 1
	const event: LiveGiftEvent = {
		id: state.giftSequence,
		senderName,
		giftId,
		giftName,
		giftIcon,
		quantity,
		comboCount,
		createdAt: t('common.now'),
	}
	state.gifts = [...state.gifts, event]
	if (state.gifts.length > 40) {
		state.gifts = state.gifts.slice(state.gifts.length - 40)
	}
	state.lastSyncTime = Date.now()
	const giftBroadcast = senderName + ' ' + t('common.send') + ' ' + giftName + ' x' + quantity.toString() + (comboCount > quantity ? ' · combo x' + comboCount.toString() : '')
	appendMockRoomMessage(roomId, t('room.broadcastName'), giftBroadcast)
	return cloneLiveGiftEvent(event)
}

function maybeGenerateMockRemoteActivity(roomId: number): void {
	if (!USE_MOCK_ROOM_ACTIVITY) {
		return
	}
	const state = getMockRoomActivityState(roomId)
	const now = Date.now()
	if (now < state.nextAutoEventAt) {
		return
	}
	const giftList: { giftId: number, name: string, icon: string }[] = []
	const remoteSpeakers = ['阿泽', '路人甲', 'Luna', 'Mika']
	const remotePhrases = ['今晚状态真好', '这首歌太适合深夜了', '主播继续唱', '这个礼物特效不错', '前排打卡']
	const speaker = remoteSpeakers[state.messageSequence % remoteSpeakers.length]
	if (state.messageSequence % 3 == 0 && giftList.length > 0) {
		const gift = giftList[state.giftSequence % giftList.length]
		const quantity = gift.giftId == 1 ? 1 : 2
		const comboCount = quantity + (state.giftSequence % 2)
		appendMockGiftEvent(roomId, speaker, gift.giftId, gift.name, gift.icon, quantity, comboCount)
	} else {
		const content = remotePhrases[state.messageSequence % remotePhrases.length]
		appendMockRoomMessage(roomId, speaker, content)
	}
	state.nextAutoEventAt = now + 5000
}

type AnchorCardResponse = {
	anchorId: number
	anchorName: string | null
	anchorAvatar: string | null
	mainImage: string | null
	gallery: string[] | null
	intro: string | null
	tags: string[] | null
	isLiving: boolean | null
	roomId: number | null
	liveTitle: string | null
	onlineCount: number | null
	heat: number | null
}

type AnchorListResponse = {
	batchNo: number | null
	hasMoreBatch: boolean | null
	list: AnchorCardResponse[] | null
}

type LiveCategoryResponse = {
	code: string | null
	name: string | null
	sort: number | null
}

type LiveRoomDetailResponse = {
	roomId: number
	anchorId: number
	anchorName: string | null
	anchorAvatar: string | null
	liveTitle: string | null
	cover: string | null
	onlineCount: number | null
	heat: number | null
	playUrl: string | null
	messageEnabled: boolean | null
	giftEnabled: boolean | null
	rewardEnabled: boolean | null
}

type LiveRoomEnterResponse = {
	roomId: number
	anchorId: number
	playUrl: string | null
	joinToken: string | null
	socketUrl?: string | null
	wsUrl?: string | null
	onlineCount: number | null
	heat: number | null
}

type LiveMessageResponse = {
	id: number
	uid: number | null
	messageType: string | null
	content: string
	createTime: number | null
}

type LiveMessageSendResponse = {
	messageId: number | null
	timestamp: number | null
}

type LiveRoomRankingResponse = {
	rankNo: number | null
	roomId: number | null
	anchorId: number | null
	anchorName: string | null
	anchorAvatar: string | null
	liveTitle: string | null
	onlineCount: number | null
	heat: number | null
	giftTotalAmount: number | null
	rewardTotalAmount: number | null
	totalAmount: number | null
}

function resolveImage(url: string | null): string {
	if (url == null || url.length == 0 || url.indexOf('example.com') >= 0) {
		return '/static/logo.png'
	}
	return resolveMediaUrl(url)
}

function resolveSenderName(uid: number | null, messageType: string | null): string {
	if (messageType == 'system') {
		return t('room.broadcastName')
	}
	if (uid == null || uid <= 0) {
		return t('common.defaultMember')
	}
	return t('common.defaultMember') + ' ' + uid.toString()
}

function buildAnchorCard(item: UTSJSONObject): AnchorCard {
	const galleryValues = readStringArrayValue(item, 'gallery')
	const tagValues = readStringArrayValue(item, 'tags')
	const categoryValues = readStringArrayValue(item, 'categoryCodes')
	const anchorAvatarValue = readStringValue(item, 'anchorAvatar')
	const mainImageValue = readStringValue(item, 'mainImage')
	const gallery = galleryValues != null && galleryValues.length > 0
		? galleryValues.map((image) => resolveImage(image))
		: [resolveImage(anchorAvatarValue)]
	const mainImage = mainImageValue != null && mainImageValue.length > 0
		? resolveImage(mainImageValue)
		: resolveImage(anchorAvatarValue)
	return {
		anchorId: readNumberValue(item, 'anchorId') != null ? (readNumberValue(item, 'anchorId') as number) : 0,
		anchorName: readStringValue(item, 'anchorName') != null ? (readStringValue(item, 'anchorName') as string) : t('common.anchor'),
		anchorAvatar: resolveImage(anchorAvatarValue),
		mainImage,
		gallery,
		intro: readStringValue(item, 'intro') != null ? (readStringValue(item, 'intro') as string) : '',
		tags: tagValues != null ? tagValues : [],
		categoryCodes: categoryValues != null ? categoryValues : [],
		isLiving: readBooleanValue(item, 'isLiving') == true,
		roomId: readNumberValue(item, 'roomId') != null ? (readNumberValue(item, 'roomId') as number) : 0,
		liveTitle: readStringValue(item, 'liveTitle') != null ? (readStringValue(item, 'liveTitle') as string) : '',
		onlineCount: readNumberValue(item, 'onlineCount') != null ? (readNumberValue(item, 'onlineCount') as number) : 0,
		heat: readNumberValue(item, 'heat') != null ? (readNumberValue(item, 'heat') as number) : 0,
	}
}

export async function getLiveCategories(): Promise<LiveCategory[]> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/anchor/category/list',
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const list = readObjectArrayValue(response.data, 'list')
		if (list == null || list.length == 0) {
			return []
		}
		return list.map((item) => ({
			code: readStringValue(item, 'code') != null ? (readStringValue(item, 'code') as string) : '',
			name: readStringValue(item, 'name') != null ? (readStringValue(item, 'name') as string) : '',
			sort: readNumberValue(item, 'sort') != null ? (readNumberValue(item, 'sort') as number) : 0,
		})).filter((item) => item.code.length > 0)
	} catch (_error) {
		return []
	}
}

export async function getAnchorList(options: { batchNo?: number, tag?: string }): Promise<AnchorCard[]> {
	const batchNo = options.batchNo != null ? options.batchNo : 0
	const tag = options.tag != null ? options.tag.trim() : ''
	try {
		const queryParts: string[] = []
		if (tag.length > 0) {
			queryParts.push('tag=' + encodeURIComponent(tag))
		}
		if (batchNo > 0) {
			queryParts.push('batchNo=' + batchNo.toString())
		}
		const response = await requestApi<UTSJSONObject>({
			url: '/anchor/list' + (queryParts.length > 0 ? '?' + queryParts.join('&') : ''),
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const list = readObjectArrayValue(response.data, 'list')
		if (list == null || list.length == 0) {
			return []
		}
		return list.map((item) => buildAnchorCard(item))
	} catch (_error) {
		return []
	}
}

export async function getLiveRoom(roomId: number): Promise<LiveRoomDetail> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/live/room/' + roomId.toString(),
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const room = response.data
		if (room == null) {
			throw new Error(t('live.anchorOffline'))
		}
		return {
			roomId: readNumberValue(room, 'roomId') != null ? (readNumberValue(room, 'roomId') as number) : roomId,
			anchorId: readNumberValue(room, 'anchorId') != null ? (readNumberValue(room, 'anchorId') as number) : 0,
			anchorName: readStringValue(room, 'anchorName') != null && (readStringValue(room, 'anchorName') as string).length > 0 ? (readStringValue(room, 'anchorName') as string) : t('common.anchor'),
			anchorAvatar: resolveImage(readStringValue(room, 'anchorAvatar')),
			liveTitle: readStringValue(room, 'liveTitle') != null ? (readStringValue(room, 'liveTitle') as string) : t('common.live'),
			streamUrl: readStringValue(room, 'playUrl') != null && (readStringValue(room, 'playUrl') as string).length > 0 ? (readStringValue(room, 'playUrl') as string) : 'mock://stream',
			joinToken: '',
			socketUrl: '',
			onlineCount: readNumberValue(room, 'onlineCount') != null ? (readNumberValue(room, 'onlineCount') as number) : 0,
			heat: readNumberValue(room, 'heat') != null ? (readNumberValue(room, 'heat') as number) : 0,
			roomNotice: readStringValue(room, 'cover') != null ? (readStringValue(room, 'cover') as string) : '',
			allowMessage: readBooleanValue(room, 'messageEnabled') != false,
			allowGift: readBooleanValue(room, 'giftEnabled') == true,
			allowReward: readBooleanValue(room, 'rewardEnabled') == true,
		}
	} catch (_error) {
		throw _error
	}
}

export async function enterRoom(roomId: number, inviteCode: string): Promise<LiveRoomDetail> {
	const detail = await getLiveRoom(roomId)
	const response = await requestApi<UTSJSONObject>({
		url: '/live/room/' + roomId.toString() + '/enter',
		method: 'POST',
		withAuth: true,
		data: {
			source: 'uniapp',
			inviteCode,
		} as UTSJSONObject,
	})
	const entered = response.data
	if (entered == null) {
		return detail
	}
	return {
		roomId: readNumberValue(entered, 'roomId') != null ? (readNumberValue(entered, 'roomId') as number) : detail.roomId,
		anchorId: readNumberValue(entered, 'anchorId') != null ? (readNumberValue(entered, 'anchorId') as number) : detail.anchorId,
		anchorName: detail.anchorName,
		anchorAvatar: detail.anchorAvatar,
		liveTitle: detail.liveTitle,
		roomNotice: detail.roomNotice,
		streamUrl: readStringValue(entered, 'playUrl') != null && (readStringValue(entered, 'playUrl') as string).length > 0 ? (readStringValue(entered, 'playUrl') as string) : detail.streamUrl,
		joinToken: readStringValue(entered, 'joinToken') != null ? (readStringValue(entered, 'joinToken') as string) : detail.joinToken,
		socketUrl: readStringValue(entered, 'socketUrl') != null
			? (readStringValue(entered, 'socketUrl') as string)
			: (readStringValue(entered, 'wsUrl') != null ? (readStringValue(entered, 'wsUrl') as string) : detail.socketUrl),
		onlineCount: readNumberValue(entered, 'onlineCount') != null ? (readNumberValue(entered, 'onlineCount') as number) : detail.onlineCount,
		heat: readNumberValue(entered, 'heat') != null ? (readNumberValue(entered, 'heat') as number) : detail.heat,
		allowMessage: detail.allowMessage,
		allowGift: detail.allowGift,
		allowReward: detail.allowReward,
	}
}

export async function verifyLiveRoomInviteCode(roomId: number, inviteCode: string): Promise<boolean> {
	await requestApi<UTSJSONObject>({
		url: '/live/room/' + roomId.toString() + '/verify-invite',
		method: 'POST',
		withAuth: true,
		data: {
			inviteCode,
		} as UTSJSONObject,
	})
	return true
}

export async function leaveRoom(roomId: number): Promise<boolean> {
	await requestApi<UTSJSONObject>({
		url: '/live/room/' + roomId.toString() + '/leave',
		method: 'POST',
		withAuth: true,
		data: null,
	})
	return true
}

export async function getLiveMessages(roomId: number): Promise<LiveMessage[]> {
	try {
		const response = await requestApi<any>({
			url: '/live/message/list?roomId=' + roomId.toString() + '&pageNum=1&pageSize=20',
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const directList = Array.isArray(response.data) ? response.data as UTSJSONObject[] : null
		const topLevelList = response.data != null ? readObjectArrayValue(response.data as UTSJSONObject, 'list') : null
		const dataObject = response.data != null ? readObjectValue(response.data as UTSJSONObject, 'data') : null
		const nestedList = readObjectArrayValue(dataObject, 'list')
		const list = directList != null ? directList : (topLevelList != null ? topLevelList : nestedList)
		if (list == null || list.length == 0) {
			return []
		}
		return list.map((item) => {
			const messageId = readNumberValue(item, 'messageId') != null ? (readNumberValue(item, 'messageId') as number) : readNumberValue(item, 'id')
			const timestamp = readNumberValue(item, 'timestamp') != null ? (readNumberValue(item, 'timestamp') as number) : readNumberValue(item, 'createTime')
			const rawSenderName = readStringValue(item, 'senderName')
			const message: LiveMessage = {
				id: messageId != null ? messageId : Date.now(),
				serverMessageId: messageId != null ? messageId : undefined,
				senderId: readNumberValue(item, 'uid') != null ? (readNumberValue(item, 'uid') as number) : undefined,
				senderName: rawSenderName != null && rawSenderName.length > 0 ? rawSenderName : resolveSenderName(readNumberValue(item, 'uid'), readStringValue(item, 'messageType')),
				content: readStringValue(item, 'content') != null ? (readStringValue(item, 'content') as string) : '',
				createdAt: formatTimestamp(timestamp),
				timestamp: timestamp != null ? timestamp : undefined,
				messageType: readStringValue(item, 'messageType') != null ? (readStringValue(item, 'messageType') as string) : 'text',
				status: 'sent',
			}
			return message
		})
	} catch (_error) {
		return []
	}
}

export function getLiveRoomActivity(roomId: number): Promise<LiveRoomActivity> {
	if (!USE_MOCK_ROOM_ACTIVITY) {
		return Promise.resolve({
			messages: [],
			gifts: [],
		})
	}
	maybeGenerateMockRemoteActivity(roomId)
	const state = getMockRoomActivityState(roomId)
	return Promise.resolve({
		messages: cloneLiveMessages(state.messages.slice(Math.max(0, state.messages.length - ROOM_ACTIVITY_SYNC_WINDOW))),
		gifts: cloneLiveGiftEvents(state.gifts.slice(Math.max(0, state.gifts.length - ROOM_ACTIVITY_SYNC_WINDOW))),
	})
}

export async function sendLiveMessage(roomId: number, content: string, clientMessageId: string): Promise<LiveMessageSendResult> {
	const response = await requestApi<UTSJSONObject>({
		url: '/live/message/send',
		method: 'POST',
		withAuth: true,
		data: {
			roomId,
			content,
			type: 'text',
			clientMessageId,
		} as UTSJSONObject,
	})
	const data = response.data
	const messageId = readNumberValue(data, 'messageId')
	const timestamp = readNumberValue(data, 'timestamp')
	return {
		messageId: messageId != null ? messageId : Date.now(),
		timestamp: timestamp != null ? timestamp : Date.now(),
		clientMessageId,
	}
}

export async function getLiveRoomRanking(pageSize: number = 10): Promise<LiveRoomRankingItem[]> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/live/rank/list?pageNum=1&pageSize=' + pageSize.toString(),
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const dataObject = response.data != null ? readObjectValue(response.data, 'data') : null
		const topLevelList = response.data != null ? readObjectArrayValue(response.data, 'list') : null
		const nestedList = readObjectArrayValue(dataObject, 'list')
		const list = topLevelList != null ? topLevelList : nestedList
		if (list == null || list.length == 0) {
			return []
		}
		return list.map((item, index) => ({
			rankNo: readNumberValue(item, 'rankNo') != null ? (readNumberValue(item, 'rankNo') as number) : index + 1,
			roomId: readNumberValue(item, 'roomId') != null ? (readNumberValue(item, 'roomId') as number) : 0,
			anchorId: readNumberValue(item, 'anchorId') != null ? (readNumberValue(item, 'anchorId') as number) : 0,
			anchorName: readStringValue(item, 'anchorName') != null ? (readStringValue(item, 'anchorName') as string) : t('common.anchor'),
			anchorAvatar: resolveImage(readStringValue(item, 'anchorAvatar')),
			liveTitle: readStringValue(item, 'liveTitle') != null ? (readStringValue(item, 'liveTitle') as string) : '',
			onlineCount: readNumberValue(item, 'onlineCount') != null ? (readNumberValue(item, 'onlineCount') as number) : 0,
			heat: readNumberValue(item, 'heat') != null ? (readNumberValue(item, 'heat') as number) : 0,
			giftTotalAmount: readNumberValue(item, 'giftTotalAmount') != null ? (readNumberValue(item, 'giftTotalAmount') as number) : 0,
			rewardTotalAmount: readNumberValue(item, 'rewardTotalAmount') != null ? (readNumberValue(item, 'rewardTotalAmount') as number) : 0,
			totalAmount: readNumberValue(item, 'totalAmount') != null ? (readNumberValue(item, 'totalAmount') as number) : 0,
		}))
	} catch (_error) {
		return []
	}
}

export async function sendRoomGift(roomId: number, anchorId: number, giftId: number, giftName: string, quantity: number, comboCount: number): Promise<string> {
	await requestApi<UTSJSONObject>({
		url: '/gift/send',
		method: 'POST',
		withAuth: true,
		data: {
			roomId,
			anchorId,
			giftId,
			count: quantity,
		} as UTSJSONObject,
	})
	const comboText = comboCount > quantity ? ' · combo x' + comboCount.toString() : ''
	return t('common.room') + ' ' + roomId.toString() + ': ' + giftName + ' x' + quantity.toString() + comboText
}

export async function sendRoomReward(roomId: number, anchorId: number, amount: number): Promise<string> {
	await requestApi<UTSJSONObject>({
		url: '/reward/send',
		method: 'POST',
		withAuth: true,
		data: {
			roomId,
			anchorId,
			amount,
			message: '',
		} as UTSJSONObject,
	})
	return t('room.reward') + ' #' + roomId.toString() + ': ' + amount.toString() + ' ' + getCurrencyName()
}
