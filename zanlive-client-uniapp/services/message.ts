import { t } from '../store/i18n'
import { formatTimestamp, readBooleanValue, readNumberValue, readObjectArrayValue, readObjectValue, readStringValue, requestApi, resolveMediaUrl, resolveSocketEndpoint } from './http'
import type { LiveGiftEvent, LiveMessage } from '../types/live'
import type { ChatImagePayload, ChatMessage, SessionItem } from '../types/message'

const TOKEN_KEY = 'zanlive_mock_token'
const USER_ID_KEY = 'zanlive_mock_user_id'
const MESSAGE_MAX_ID_KEY = 'zanlive_message_max_id'
const MESSAGE_FORMAT_TEXT = 0
const MESSAGE_FORMAT_IMAGE = 1
const CHAT_MESSAGE_ACTION = '0'
const CHAT_SYNC_ACTION = '109'
const CHAT_SOCKET_PORT = 8070
const CHAT_SOCKET_RECONNECT_DELAY = 1800

export type LiveMessageChannelStatus = 'idle' | 'connecting' | 'connected' | 'polling' | 'closed' | 'error'

export type LiveMessageChannelOptions = {
	roomId: number
	joinToken: string
	socketUrl: string
	onStatusChange?: (status: LiveMessageChannelStatus) => void
	onMessages?: (messages: LiveMessage[]) => void
	onGiftEvents?: (events: LiveGiftEvent[]) => void
	onError?: (error: Error) => void
	onFallback?: () => void
}

type LiveSocketRuntime = {
	task: any | null
	options: LiveMessageChannelOptions | null
	closedManually: boolean
}

const liveSocketRuntime: LiveSocketRuntime = {
	task: null,
	options: null,
	closedManually: false,
}

function normalizeGiftType(type: string | null): string {
	if (type == null) {
		return ''
	}
	return type.trim().toUpperCase()
}

function emitLiveChannelStatus(options: LiveMessageChannelOptions | null, status: LiveMessageChannelStatus): void {
	if (options != null && typeof options.onStatusChange == 'function') {
		options.onStatusChange(status)
	}
}

function emitLiveChannelError(options: LiveMessageChannelOptions | null, error: Error): void {
	if (options != null && typeof options.onError == 'function') {
		options.onError(error)
	}
}

function emitLiveChannelFallback(options: LiveMessageChannelOptions | null): void {
	if (options != null && typeof options.onFallback == 'function') {
		options.onFallback()
	}
}

function normalizeSocketUrl(socketUrl: string): string {
	if (socketUrl.startsWith('ws://') || socketUrl.startsWith('wss://')) {
		return socketUrl
	}
	if (socketUrl.startsWith('http://')) {
		return 'ws://' + socketUrl.substring('http://'.length)
	}
	if (socketUrl.startsWith('https://')) {
		return 'wss://' + socketUrl.substring('https://'.length)
	}
	return socketUrl
}

function getStoredToken(): string {
	const rawValue = uni.getStorageSync(TOKEN_KEY)
	if (typeof rawValue == 'string') {
		return rawValue as string
	}
	return ''
}

function getStoredUserId(): string {
	const rawValue = uni.getStorageSync(USER_ID_KEY)
	if (typeof rawValue == 'number') {
		return rawValue.toString()
	}
	if (typeof rawValue == 'string') {
		return rawValue as string
	}
	return ''
}

function getStoredUserIdNumber(): number {
	const value = getStoredUserId()
	if (value.length == 0) {
		return 0
	}
	const parsed = parseInt(value, 10)
	return isNaN(parsed) ? 0 : parsed
}

function getStoredMaxMessageId(): number {
	const rawValue = uni.getStorageSync(MESSAGE_MAX_ID_KEY)
	if (typeof rawValue == 'number') {
		return rawValue as number
	}
	if (typeof rawValue == 'string') {
		const text = rawValue as string
		if (text.length == 0) {
			return 0
		}
		const parsed = parseInt(text, 10)
		return isNaN(parsed) ? 0 : parsed
	}
	return 0
}

function setStoredMaxMessageId(messageId: number): void {
	if (messageId > 0) {
		uni.setStorageSync(MESSAGE_MAX_ID_KEY, messageId)
	}
}

function isChatDisplayAction(action: string | null): boolean {
	return action == null || action == CHAT_MESSAGE_ACTION
}

function resolveSentMessageId(data: any | null): number {
	if (typeof data == 'number' && !isNaN(data) && data > 0) {
		return data as number
	}
	if (typeof data == 'string') {
		const parsed = parseInt(data as string, 10)
		if (!isNaN(parsed) && parsed > 0) {
			return parsed
		}
	}
	if (data != null && typeof data == 'object') {
		const objectData = data as UTSJSONObject
		const id = readNumberValue(objectData, 'id')
		if (id != null && id > 0) {
			return id
		}
		const nestedId = readNumberValue(objectData, 'data')
		if (nestedId != null && nestedId > 0) {
			return nestedId
		}
	}
	return Date.now()
}

function createSocketRequest(key: string, data: Record<string, string>): string {
	return JSON.stringify({
		type: 3,
		content: JSON.stringify({
			key,
			data,
			timestamp: Date.now(),
		}),
	})
}

function parseSocketPayload(rawData: any): any | null {
	if (rawData == null) {
		return null
	}
	if (typeof rawData == 'string') {
		const text = rawData as string
		if (text.length == 0) {
			return null
		}
		try {
			return JSON.parse(text)
		} catch (_error) {
			return null
		}
	}
	if (typeof ArrayBuffer != 'undefined' && rawData instanceof ArrayBuffer) {
		try {
			const text = String.fromCharCode.apply(null, Array.from(new Uint8Array(rawData)))
			return JSON.parse(text)
		} catch (_error) {
			return null
		}
	}
	return rawData
}

function parseSocketContent(payload: any): any | null {
	if (payload == null) {
		return null
	}
	if (payload.type == 2 || payload.type == 4) {
		const content = payload.content
		if (typeof content == 'string' && content.length > 0) {
			try {
				return JSON.parse(content)
			} catch (_error) {
				return null
			}
		}
	}
	return payload
}

function resolveLiveSocketSenderName(source: UTSJSONObject | null): string {
	const senderName = readStringValue(source, 'senderName')
	if (senderName != null && senderName.length > 0) {
		return senderName
	}
	const nickname = readStringValue(source, 'nickname')
	if (nickname != null && nickname.length > 0) {
		return nickname
	}
	const uid = readNumberValue(source, 'uid')
	if (uid != null && uid > 0) {
		return uid.toString()
	}
	return ''
}

function normalizeLiveSocketMessage(source: UTSJSONObject | null): LiveMessage | null {
	if (source == null) {
		return null
	}
	const directMessageType = readStringValue(source, 'messageType')
	if (directMessageType == 'gift') {
		return null
	}
	const content = readStringValue(source, 'content')
	if (content == null || content.length == 0) {
		return null
	}
	const messageId = readNumberValue(source, 'messageId')
	const fallbackId = readNumberValue(source, 'id')
	const extraText = readStringValue(source, 'extra')
	let extraData: UTSJSONObject | null = null
	if (extraText != null && extraText.length > 0) {
		try {
			extraData = JSON.parse(extraText) as UTSJSONObject
		} catch (_error) {
			extraData = null
		}
	}
	const timestamp = readNumberValue(source, 'timestamp') != null ? (readNumberValue(source, 'timestamp') as number) : readNumberValue(source, 'createTime')
	const uid = readNumberValue(source, 'uid') != null ? readNumberValue(source, 'uid') : readNumberValue(extraData, 'uid')
	const clientMessageId = readStringValue(source, 'clientMessageId') != null ? readStringValue(source, 'clientMessageId') : readStringValue(extraData, 'clientMessageId')
	const messageType = readStringValue(source, 'messageType') != null
		? (readStringValue(source, 'messageType') as string)
		: (readStringValue(extraData, 'messageType') != null ? (readStringValue(extraData, 'messageType') as string) : (readStringValue(source, 'type') != null ? (readStringValue(source, 'type') as string) : 'text'))
	if (messageType == 'gift') {
		return null
	}
	const resolvedId = messageId != null ? messageId : (fallbackId != null ? fallbackId : Date.now())
	return {
		id: resolvedId,
		serverMessageId: resolvedId,
		clientMessageId: clientMessageId != null && clientMessageId.length > 0 ? clientMessageId : undefined,
		senderId: uid != null ? uid : undefined,
		senderName: readStringValue(extraData, 'senderName') != null && (readStringValue(extraData, 'senderName') as string).length > 0 ? (readStringValue(extraData, 'senderName') as string) : resolveLiveSocketSenderName(source),
		content,
		createdAt: formatTimestamp(timestamp),
		timestamp: timestamp != null ? timestamp : undefined,
		messageType,
		status: 'sent',
	}
}

function normalizeLiveGiftEvent(source: UTSJSONObject | null): LiveGiftEvent | null {
	if (source == null) {
		return null
	}
	const extraText = readStringValue(source, 'extra')
	let extraData: UTSJSONObject | null = null
	if (extraText != null && extraText.length > 0) {
		try {
			extraData = JSON.parse(extraText) as UTSJSONObject
		} catch (_error) {
			extraData = null
		}
	}
	const messageType = readStringValue(source, 'messageType') != null
		? (readStringValue(source, 'messageType') as string)
		: (readStringValue(extraData, 'messageType') != null ? (readStringValue(extraData, 'messageType') as string) : '')
	if (messageType != 'gift') {
		return null
	}
	const timestamp = readNumberValue(extraData, 'timestamp') != null ? (readNumberValue(extraData, 'timestamp') as number) : readNumberValue(source, 'timestamp')
	const eventId = readNumberValue(source, 'messageId') != null
		? (readNumberValue(source, 'messageId') as number)
		: (readNumberValue(source, 'id') != null ? (readNumberValue(source, 'id') as number) : (timestamp != null ? timestamp : Date.now()))
	const quantity = readNumberValue(extraData, 'quantity') != null ? (readNumberValue(extraData, 'quantity') as number) : 1
	const comboCount = readNumberValue(extraData, 'comboCount') != null ? (readNumberValue(extraData, 'comboCount') as number) : quantity
	const giftId = readNumberValue(extraData, 'giftId')
	const giftName = readStringValue(extraData, 'giftName')
	const giftIcon = readStringValue(extraData, 'giftIcon')
	const giftType = readStringValue(extraData, 'giftType')
	const resource = readStringValue(extraData, 'resource')
	if (giftId == null || giftName == null || giftName.length == 0) {
		return null
	}
	return {
		id: eventId,
		senderId: readNumberValue(extraData, 'uid') != null ? (readNumberValue(extraData, 'uid') as number) : undefined,
		senderName: readStringValue(extraData, 'senderName') != null && (readStringValue(extraData, 'senderName') as string).length > 0 ? (readStringValue(extraData, 'senderName') as string) : resolveLiveSocketSenderName(source),
		giftId,
		giftName,
		giftIcon: giftIcon != null ? resolveMediaUrl(giftIcon) : '/static/logo.png',
		giftType: normalizeGiftType(giftType),
		resource: resource != null && resource.length > 0 ? resolveMediaUrl(resource) : '',
		quantity,
		comboCount,
		createdAt: formatTimestamp(timestamp),
		timestamp: timestamp != null ? timestamp : undefined,
	}
}

function extractLiveMessagesFromPayload(payload: any): LiveMessage[] {
	const normalizedPayload = payload as UTSJSONObject
	const directList = Array.isArray(payload) ? payload as UTSJSONObject[] : null
	const list = directList != null ? directList : (readObjectArrayValue(normalizedPayload, 'list') != null ? (readObjectArrayValue(normalizedPayload, 'list') as UTSJSONObject[]) : null)
	if (list != null && list.length > 0) {
		const messages: LiveMessage[] = []
		for (let i = 0; i < list.length; i++) {
			const message = normalizeLiveSocketMessage(list[i])
			if (message != null) {
				messages.push(message)
			}
		}
		return messages
	}
	const data = readObjectValue(normalizedPayload, 'data')
	if (data != null) {
		const nestedList = readObjectArrayValue(data, 'list')
		if (nestedList != null && nestedList.length > 0) {
			const messages: LiveMessage[] = []
			for (let i = 0; i < nestedList.length; i++) {
				const message = normalizeLiveSocketMessage(nestedList[i])
				if (message != null) {
					messages.push(message)
				}
			}
			return messages
		}
		const nestedMessage = normalizeLiveSocketMessage(data)
		if (nestedMessage != null) {
			return [nestedMessage]
		}
	}
	const singleMessage = normalizeLiveSocketMessage(normalizedPayload)
	if (singleMessage != null) {
		return [singleMessage]
	}
	return []
}

function extractLiveGiftEventsFromPayload(payload: any): LiveGiftEvent[] {
	const normalizedPayload = payload as UTSJSONObject
	const directList = Array.isArray(payload) ? payload as UTSJSONObject[] : null
	const list = directList != null ? directList : (readObjectArrayValue(normalizedPayload, 'list') != null ? (readObjectArrayValue(normalizedPayload, 'list') as UTSJSONObject[]) : null)
	if (list != null && list.length > 0) {
		const events: LiveGiftEvent[] = []
		for (let i = 0; i < list.length; i++) {
			const event = normalizeLiveGiftEvent(list[i])
			if (event != null) {
				events.push(event)
			}
		}
		return events
	}
	const data = readObjectValue(normalizedPayload, 'data')
	if (data != null) {
		const nestedList = readObjectArrayValue(data, 'list')
		if (nestedList != null && nestedList.length > 0) {
			const events: LiveGiftEvent[] = []
			for (let i = 0; i < nestedList.length; i++) {
				const event = normalizeLiveGiftEvent(nestedList[i])
				if (event != null) {
					events.push(event)
				}
			}
			return events
		}
		const singleEvent = normalizeLiveGiftEvent(data)
		if (singleEvent != null) {
			return [singleEvent]
		}
	}
	const event = normalizeLiveGiftEvent(normalizedPayload)
	if (event != null) {
		return [event]
	}
	return []
}

export function closeLiveMessageChannel(): void {
	liveSocketRuntime.closedManually = true
	const currentTask = liveSocketRuntime.task
	liveSocketRuntime.task = null
	liveSocketRuntime.options = null
	if (currentTask != null && typeof currentTask.close == 'function') {
		currentTask.close({})
	}
}

export function openLiveMessageChannel(options: LiveMessageChannelOptions): boolean {
	closeLiveMessageChannel()
	const socketUrl = options.socketUrl.trim()
	if (socketUrl.length == 0) {
		emitLiveChannelStatus(options, 'polling')
		emitLiveChannelFallback(options)
		return false
	}
	liveSocketRuntime.closedManually = false
	liveSocketRuntime.options = options
	emitLiveChannelStatus(options, 'connecting')
	try {
		const task = uni.connectSocket({
			url: normalizeSocketUrl(socketUrl),
			header: {
				'access-token': getStoredToken(),
			},
			complete: () => {},
		})
		liveSocketRuntime.task = task
		const handleOpen = (): void => {
			if (liveSocketRuntime.options == null) {
				return
			}
			emitLiveChannelStatus(options, 'connected')
			if (typeof task.send == 'function') {
				task.send({
					data: createSocketRequest('client_bind', {
						uid: getStoredUserId(),
						deviceId: 'uni-live-room',
						channel: 'uniapp-live',
						deviceName: 'uni-app',
						appVersion: '1.0.0',
						osVersion: '',
						language: '',
					}),
					success: () => {
						task.send({
							data: createSocketRequest('client_set_tag', {
								tag: 'live-room-' + options.roomId.toString(),
							}),
						})
					},
				})
			}
		}
		const handleMessage = (event: any): void => {
			const payload = parseSocketPayload(event != null && event.data != null ? event.data : event)
			if (payload != null && payload.type == 1 && typeof task.send == 'function') {
				task.send({
					data: JSON.stringify({ type: 0 }),
				})
				return
			}
			const contentPayload = parseSocketContent(payload)
			const giftEvents = extractLiveGiftEventsFromPayload(contentPayload)
			if (giftEvents.length > 0 && typeof options.onGiftEvents == 'function') {
				options.onGiftEvents(giftEvents)
			}
			const messages = extractLiveMessagesFromPayload(contentPayload)
			if (messages.length > 0 && typeof options.onMessages == 'function') {
				options.onMessages(messages)
			}
		}
		const handleClose = (): void => {
			if (liveSocketRuntime.closedManually) {
				emitLiveChannelStatus(options, 'closed')
				return
			}
			emitLiveChannelStatus(options, 'polling')
			emitLiveChannelFallback(options)
		}
		const handleError = (error: any): void => {
			emitLiveChannelStatus(options, 'error')
			emitLiveChannelError(options, new Error(error != null && error.errMsg != null ? error.errMsg : 'socket error'))
			emitLiveChannelFallback(options)
		}
		if (typeof task.onOpen == 'function') {
			task.onOpen(handleOpen)
		}
		if (typeof task.onMessage == 'function') {
			task.onMessage(handleMessage)
		}
		if (typeof task.onClose == 'function') {
			task.onClose(handleClose)
		}
		if (typeof task.onError == 'function') {
			task.onError(handleError)
		}
		return true
	} catch (error) {
		emitLiveChannelStatus(options, 'polling')
		emitLiveChannelError(options, error instanceof Error ? error : new Error('socket error'))
		emitLiveChannelFallback(options)
		return false
	}
}

export type ChatMessageChannelStatus = 'idle' | 'connecting' | 'connected' | 'closed' | 'error'

type ChatMessageChannelListener = (message: ChatMessage, action: string) => void
type ChatMessageChannelStatusListener = (status: ChatMessageChannelStatus) => void

type ChatSocketRuntime = {
	task: any | null
	status: ChatMessageChannelStatus
	closedManually: boolean
	reconnectTimer: ReturnType<typeof setTimeout> | null
	messageListeners: ChatMessageChannelListener[]
	statusListeners: ChatMessageChannelStatusListener[]
}

const chatSocketRuntime: ChatSocketRuntime = {
	task: null,
	status: 'idle',
	closedManually: false,
	reconnectTimer: null,
	messageListeners: [],
	statusListeners: [],
}

function emitChatMessageChannelStatus(status: ChatMessageChannelStatus): void {
	chatSocketRuntime.status = status
	for (let i = 0; i < chatSocketRuntime.statusListeners.length; i++) {
		chatSocketRuntime.statusListeners[i](status)
	}
}

function emitChatMessageChannelMessage(message: ChatMessage, action: string): void {
	for (let i = 0; i < chatSocketRuntime.messageListeners.length; i++) {
		chatSocketRuntime.messageListeners[i](message, action)
	}
}

function clearChatSocketReconnectTimer(): void {
	if (chatSocketRuntime.reconnectTimer == null) {
		return
	}
	clearTimeout(chatSocketRuntime.reconnectTimer)
	chatSocketRuntime.reconnectTimer = null
}

function scheduleChatSocketReconnect(): void {
	if (chatSocketRuntime.closedManually || chatSocketRuntime.reconnectTimer != null) {
		return
	}
	chatSocketRuntime.reconnectTimer = setTimeout(() => {
		chatSocketRuntime.reconnectTimer = null
		startChatMessageChannel()
	}, CHAT_SOCKET_RECONNECT_DELAY)
	if (chatSocketRuntime.status != 'error') {
		emitChatMessageChannelStatus('closed')
	}
}

function closeInternalChatMessageChannel(closedManually: boolean): void {
	chatSocketRuntime.closedManually = closedManually
	clearChatSocketReconnectTimer()
	const currentTask = chatSocketRuntime.task
	chatSocketRuntime.task = null
	if (currentTask != null && typeof currentTask.close == 'function') {
		currentTask.close({})
	}
}

function encodeUtf8(text: string): Uint8Array {
	if (typeof TextEncoder != 'undefined') {
		return new TextEncoder().encode(text)
	}
	const encoded = unescape(encodeURIComponent(text))
	const bytes = new Uint8Array(encoded.length)
	for (let i = 0; i < encoded.length; i++) {
		bytes[i] = encoded.charCodeAt(i)
	}
	return bytes
}

function decodeUtf8(bytes: Uint8Array): string {
	if (typeof TextDecoder != 'undefined') {
		return new TextDecoder('utf-8').decode(bytes)
	}
	let text = ''
	for (let i = 0; i < bytes.length; i++) {
		text += String.fromCharCode(bytes[i])
	}
	return decodeURIComponent(escape(text))
}

function encodeVarint(value: number): number[] {
	const bytes: number[] = []
	let current = Math.max(0, Math.floor(value))
	while (current >= 128) {
		bytes.push((current % 128) + 128)
		current = Math.floor(current / 128)
	}
	bytes.push(current)
	return bytes
}

function appendBytes(target: number[], source: number[] | Uint8Array): void {
	for (let i = 0; i < source.length; i++) {
		target.push(source[i])
	}
}

function encodeFieldTag(fieldNumber: number, wireType: number, target: number[]): void {
	appendBytes(target, encodeVarint(fieldNumber * 8 + wireType))
}

function encodeProtoStringField(fieldNumber: number, value: string, target: number[]): void {
	if (value.length == 0) {
		return
	}
	const bytes = encodeUtf8(value)
	encodeFieldTag(fieldNumber, 2, target)
	appendBytes(target, encodeVarint(bytes.length))
	appendBytes(target, bytes)
}

function encodeProtoInt64Field(fieldNumber: number, value: number, target: number[]): void {
	if (value <= 0) {
		return
	}
	encodeFieldTag(fieldNumber, 0, target)
	appendBytes(target, encodeVarint(value))
}

function encodeProtoStringMapField(fieldNumber: number, value: Record<string, string>, target: number[]): void {
	const keys = Object.keys(value)
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		const entry: number[] = []
		encodeProtoStringField(1, key, entry)
		encodeProtoStringField(2, value[key], entry)
		encodeFieldTag(fieldNumber, 2, target)
		appendBytes(target, encodeVarint(entry.length))
		appendBytes(target, entry)
	}
}

function buildChatSocketRequestBuffer(key: string, data: Record<string, string>): ArrayBuffer {
	const body: number[] = []
	encodeProtoStringField(1, key, body)
	encodeProtoInt64Field(2, Date.now(), body)
	encodeProtoStringMapField(3, data, body)
	const buffer = new Uint8Array(body.length + 1)
	buffer[0] = 3
	buffer.set(body, 1)
	return buffer.buffer
}

function buildChatSocketPongBuffer(): ArrayBuffer {
	const body = encodeUtf8('PONG')
	const buffer = new Uint8Array(body.length + 1)
	buffer[0] = 0
	buffer.set(body, 1)
	return buffer.buffer
}

function readProtoVarint(bytes: Uint8Array, offset: number): { value: number, offset: number } | null {
	let result = 0
	let shift = 0
	let nextOffset = offset
	while (nextOffset < bytes.length) {
		const current = bytes[nextOffset]
		result += (current & 127) * Math.pow(2, shift)
		nextOffset += 1
		if ((current & 128) == 0) {
			return {
				value: result,
				offset: nextOffset,
			}
		}
		shift += 7
	}
	return null
}

function readProtoLengthDelimited(bytes: Uint8Array, offset: number): { value: Uint8Array, offset: number } | null {
	const lengthResult = readProtoVarint(bytes, offset)
	if (lengthResult == null) {
		return null
	}
	const endOffset = lengthResult.offset + lengthResult.value
	if (endOffset > bytes.length) {
		return null
	}
	return {
		value: bytes.slice(lengthResult.offset, endOffset),
		offset: endOffset,
	}
}

function skipProtoField(bytes: Uint8Array, wireType: number, offset: number): number {
	if (wireType == 0) {
		const varintResult = readProtoVarint(bytes, offset)
		return varintResult != null ? varintResult.offset : bytes.length
	}
	if (wireType == 2) {
		const lengthResult = readProtoLengthDelimited(bytes, offset)
		return lengthResult != null ? lengthResult.offset : bytes.length
	}
	return bytes.length
}

function decodeProtoStringMap(bytes: Uint8Array): Record<string, string> {
	const result: Record<string, string> = {}
	let offset = 0
	let key = ''
	let value = ''
	while (offset < bytes.length) {
		const tagResult = readProtoVarint(bytes, offset)
		if (tagResult == null) {
			break
		}
		offset = tagResult.offset
		const fieldNumber = Math.floor(tagResult.value / 8)
		const wireType = tagResult.value % 8
		if (wireType != 2) {
			offset = skipProtoField(bytes, wireType, offset)
			continue
		}
		const fieldValue = readProtoLengthDelimited(bytes, offset)
		if (fieldValue == null) {
			break
		}
		offset = fieldValue.offset
		if (fieldNumber == 1) {
			key = decodeUtf8(fieldValue.value)
		} else if (fieldNumber == 2) {
			value = decodeUtf8(fieldValue.value)
		}
	}
	if (key.length > 0) {
		result[key] = value
	}
	return result
}

function decodeReplyBody(bytes: Uint8Array): { key: string, code: string, message: string, timestamp: number, data: Record<string, string> } | null {
	let offset = 0
	let key = ''
	let code = ''
	let message = ''
	let timestamp = 0
	let data: Record<string, string> = {}
	while (offset < bytes.length) {
		const tagResult = readProtoVarint(bytes, offset)
		if (tagResult == null) {
			break
		}
		offset = tagResult.offset
		const fieldNumber = Math.floor(tagResult.value / 8)
		const wireType = tagResult.value % 8
		if (fieldNumber == 1 && wireType == 2) {
			const fieldValue = readProtoLengthDelimited(bytes, offset)
			if (fieldValue == null) {
				break
			}
			key = decodeUtf8(fieldValue.value)
			offset = fieldValue.offset
			continue
		}
		if (fieldNumber == 2 && wireType == 2) {
			const fieldValue = readProtoLengthDelimited(bytes, offset)
			if (fieldValue == null) {
				break
			}
			code = decodeUtf8(fieldValue.value)
			offset = fieldValue.offset
			continue
		}
		if (fieldNumber == 3 && wireType == 2) {
			const fieldValue = readProtoLengthDelimited(bytes, offset)
			if (fieldValue == null) {
				break
			}
			message = decodeUtf8(fieldValue.value)
			offset = fieldValue.offset
			continue
		}
		if (fieldNumber == 4 && wireType == 0) {
			const fieldValue = readProtoVarint(bytes, offset)
			if (fieldValue == null) {
				break
			}
			timestamp = fieldValue.value
			offset = fieldValue.offset
			continue
		}
		if (fieldNumber == 5 && wireType == 2) {
			const fieldValue = readProtoLengthDelimited(bytes, offset)
			if (fieldValue == null) {
				break
			}
			data = {
				...data,
				...decodeProtoStringMap(fieldValue.value),
			}
			offset = fieldValue.offset
			continue
		}
		offset = skipProtoField(bytes, wireType, offset)
	}
	return {
		key,
		code,
		message,
		timestamp,
		data,
	}
}

function decodeMessageBody(bytes: Uint8Array): UTSJSONObject | null {
	let offset = 0
	const result: UTSJSONObject = {}
	while (offset < bytes.length) {
		const tagResult = readProtoVarint(bytes, offset)
		if (tagResult == null) {
			break
		}
		offset = tagResult.offset
		const fieldNumber = Math.floor(tagResult.value / 8)
		const wireType = tagResult.value % 8
		if (wireType == 2) {
			const fieldValue = readProtoLengthDelimited(bytes, offset)
			if (fieldValue == null) {
				break
			}
			const text = decodeUtf8(fieldValue.value)
			if (fieldNumber == 2) {
				result['action'] = text
			} else if (fieldNumber == 3) {
				result['content'] = text
			} else if (fieldNumber == 4) {
				result['sender'] = text
			} else if (fieldNumber == 5) {
				result['receiver'] = text
			} else if (fieldNumber == 6) {
				result['extra'] = text
			} else if (fieldNumber == 7) {
				result['title'] = text
			} else if (fieldNumber == 8) {
				result['format'] = text
			}
			offset = fieldValue.offset
			continue
		}
		if (wireType == 0) {
			const fieldValue = readProtoVarint(bytes, offset)
			if (fieldValue == null) {
				break
			}
			if (fieldNumber == 1) {
				result['id'] = fieldValue.value
			} else if (fieldNumber == 9) {
				result['timestamp'] = fieldValue.value
			}
			offset = fieldValue.offset
			continue
		}
		offset = skipProtoField(bytes, wireType, offset)
	}
	return result
}

function toBinaryPayload(rawData: any): Uint8Array | null {
	if (rawData == null) {
		return null
	}
	if (typeof ArrayBuffer != 'undefined' && rawData instanceof ArrayBuffer) {
		return new Uint8Array(rawData)
	}
	if (typeof Uint8Array != 'undefined' && rawData instanceof Uint8Array) {
		return rawData
	}
	if (rawData.buffer != null && typeof rawData.byteLength == 'number') {
		return new Uint8Array(rawData.buffer, rawData.byteOffset != null ? rawData.byteOffset : 0, rawData.byteLength)
	}
	return null
}

function normalizeRealtimeChatMessage(source: UTSJSONObject | null): { message: ChatMessage, action: string } | null {
	if (source == null) {
		return null
	}
	const action = readStringValue(source, 'action')
	if (action == null || (action != CHAT_MESSAGE_ACTION && action != CHAT_SYNC_ACTION)) {
		return null
	}
	const selfId = getStoredUserIdNumber()
	const sender = readNumberValue(source, 'sender') != null ? (readNumberValue(source, 'sender') as number) : 0
	const receiver = readNumberValue(source, 'receiver') != null ? (readNumberValue(source, 'receiver') as number) : 0
	const peerId = action == '109'
		? (readNumberValue(source, 'extra') != null ? (readNumberValue(source, 'extra') as number) : 0)
		: (sender == selfId ? receiver : sender)
	if (peerId <= 0) {
		return null
	}
	const format = readNumberValue(source, 'format') != null ? (readNumberValue(source, 'format') as number) : MESSAGE_FORMAT_TEXT
	const content = readStringValue(source, 'content') != null ? (readStringValue(source, 'content') as string) : ''
	const image = format == MESSAGE_FORMAT_IMAGE ? parseChatImagePayload(content) : null
	const id = readNumberValue(source, 'id') != null ? (readNumberValue(source, 'id') as number) : Date.now()
	const timestamp = readNumberValue(source, 'timestamp')
	const isSelfMessage = action == '109' || (selfId > 0 && sender == selfId)
	return {
		action,
		message: {
			id,
			fromId: action == '109' ? selfId : sender,
			toId: action == '109' ? peerId : receiver,
			content: format == MESSAGE_FORMAT_IMAGE ? '[图片]' : content,
			createdAt: formatTimestamp(timestamp),
			isSelf: isSelfMessage,
			unread: !isSelfMessage,
			format,
			messageType: format == MESSAGE_FORMAT_IMAGE ? 'image' : 'text',
			image,
			status: 'sent',
		},
	}
}

function markRealtimeMessageReceived(messageId: number, action: string): Promise<boolean> {
	if (messageId <= 0 || action.length == 0) {
		return Promise.resolve(false)
	}
	return requestApi<UTSJSONObject>({
		url: '/message/receive/' + messageId.toString() + '?action=' + action,
		method: 'POST',
		withAuth: true,
		data: null,
	}).then(() => true)
}

export function addChatMessageChannelListener(listener: ChatMessageChannelListener): () => void {
	const exists = chatSocketRuntime.messageListeners.includes(listener)
	if (!exists) {
		chatSocketRuntime.messageListeners.push(listener)
	}
	return () => {
		removeChatMessageChannelListener(listener)
	}
}

export function removeChatMessageChannelListener(listener: ChatMessageChannelListener): void {
	chatSocketRuntime.messageListeners = chatSocketRuntime.messageListeners.filter((item) => item !== listener)
}

export function addChatMessageChannelStatusListener(listener: ChatMessageChannelStatusListener): () => void {
	const exists = chatSocketRuntime.statusListeners.includes(listener)
	if (!exists) {
		chatSocketRuntime.statusListeners.push(listener)
	}
	listener(chatSocketRuntime.status)
	return () => {
		removeChatMessageChannelStatusListener(listener)
	}
}

export function removeChatMessageChannelStatusListener(listener: ChatMessageChannelStatusListener): void {
	chatSocketRuntime.statusListeners = chatSocketRuntime.statusListeners.filter((item) => item !== listener)
}

export function stopChatMessageChannel(): void {
	closeInternalChatMessageChannel(true)
	emitChatMessageChannelStatus('closed')
}

export function startChatMessageChannel(): boolean {
	const token = getStoredToken()
	const uid = getStoredUserId()
	if (token.length == 0 || uid.length == 0) {
		emitChatMessageChannelStatus('idle')
		return false
	}
	if (chatSocketRuntime.task != null) {
		return true
	}
	chatSocketRuntime.closedManually = false
	clearChatSocketReconnectTimer()
	emitChatMessageChannelStatus('connecting')
	try {
		const task = uni.connectSocket({
			url: normalizeSocketUrl(resolveSocketEndpoint(CHAT_SOCKET_PORT, '/')),
			header: {
				'access-token': token,
			},
			complete: () => {},
		})
		chatSocketRuntime.task = task
		const handleOpen = (): void => {
			if (typeof task.send == 'function') {
				task.send({
					data: buildChatSocketRequestBuffer('client_bind', {
						uid,
						deviceId: 'uniapp-' + uid,
						channel: 'uniapp',
						deviceName: 'uni-app',
						appVersion: '1.0.5',
						osVersion: '',
						language: '',
					}),
				})
			}
		}
		const handleMessage = (event: any): void => {
			const payload = toBinaryPayload(event != null && event.data != null ? event.data : event)
			if (payload == null || payload.length == 0) {
				return
			}
			const type = payload[0]
			const body = payload.slice(1)
			if (type == 1 && typeof task.send == 'function') {
				task.send({
					data: buildChatSocketPongBuffer(),
				})
				return
			}
			if (type == 4) {
				const reply = decodeReplyBody(body)
				if (reply != null && reply.key == 'client_bind' && reply.code == '200') {
					emitChatMessageChannelStatus('connected')
				}
				return
			}
			if (type != 2) {
				return
			}
			const source = decodeMessageBody(body)
			const normalized = normalizeRealtimeChatMessage(source)
			if (normalized == null) {
				return
			}
			setStoredMaxMessageId(normalized.message.id)
			markRealtimeMessageReceived(normalized.message.id, normalized.action).catch(() => false)
			emitChatMessageChannelMessage(normalized.message, normalized.action)
		}
		const handleClose = (): void => {
			chatSocketRuntime.task = null
			if (chatSocketRuntime.closedManually) {
				emitChatMessageChannelStatus('closed')
				return
			}
			scheduleChatSocketReconnect()
		}
		const handleError = (): void => {
			chatSocketRuntime.task = null
			emitChatMessageChannelStatus('error')
			scheduleChatSocketReconnect()
		}
		if (typeof task.onOpen == 'function') {
			task.onOpen(handleOpen)
		}
		if (typeof task.onMessage == 'function') {
			task.onMessage(handleMessage)
		}
		if (typeof task.onClose == 'function') {
			task.onClose(handleClose)
		}
		if (typeof task.onError == 'function') {
			task.onError(handleError)
		}
		return true
	} catch (_error) {
		emitChatMessageChannelStatus('error')
		scheduleChatSocketReconnect()
		return false
	}
}

export async function getSessionList(): Promise<SessionItem[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/session/list',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => {
		const sessionId = readNumberValue(item, 'sessionId')
		const sessionType = readStringValue(item, 'sessionType')
		const targetUid = readNumberValue(item, 'targetUid')
		const targetName = readStringValue(item, 'targetName')
		const targetAvatar = readStringValue(item, 'targetAvatar')
		const lastMessage = readStringValue(item, 'lastMessage')
		const format = readNumberValue(item, 'format')
		const lastMessageTime = readNumberValue(item, 'lastMessageTime')
		const unreadCount = readNumberValue(item, 'unreadCount')
		return {
			id: sessionId != null ? sessionId : Date.now(),
			type: sessionType != null ? sessionType : 'p2p',
			uid: targetUid != null ? targetUid : 0,
			name: targetName != null && targetName.length > 0 ? targetName : (targetUid != null ? targetUid.toString() : '0'),
			avatar: resolveMediaUrl(targetAvatar),
			lastMessage: format == MESSAGE_FORMAT_IMAGE ? '[图片]' : (lastMessage != null ? lastMessage : ''),
			lastTime: formatTimestamp(lastMessageTime),
			lastTimestamp: lastMessageTime != null ? lastMessageTime : 0,
			unreadCount: unreadCount != null ? unreadCount : 0,
			official: readBooleanValue(item, 'official') == true,
			top: readBooleanValue(item, 'top') == true,
		}
	})
}

function parseChatImagePayload(content: string | null): ChatImagePayload | null {
	if (content == null || content.length == 0) {
		return null
	}
	try {
		const payload = JSON.parse(content) as UTSJSONObject
		const image = readStringValue(payload, 'image')
		const thumb = readStringValue(payload, 'thumb')
		const bucket = readStringValue(payload, 'bucket')
		const ow = readNumberValue(payload, 'ow')
		const oh = readNumberValue(payload, 'oh')
		const tw = readNumberValue(payload, 'tw')
		const th = readNumberValue(payload, 'th')
		if (image == null || thumb == null || bucket == null || ow == null || oh == null || tw == null || th == null) {
			return null
		}
		return {
			bucket,
			image,
			thumb,
			ow,
			oh,
			tw,
			th,
		}
	} catch (_error) {
		return null
	}
}

function normalizeChatMessage(item: UTSJSONObject, targetUid: number, selfId: number): ChatMessage | null {
	const action = readStringValue(item, 'action')
	if (!isChatDisplayAction(action)) {
		return null
	}
	const id = readNumberValue(item, 'id')
	const sender = readNumberValue(item, 'sender')
	const receiver = readNumberValue(item, 'receiver')
	const content = readStringValue(item, 'content')
	const createTime = readNumberValue(item, 'createTime')
	const format = readNumberValue(item, 'format') != null ? (readNumberValue(item, 'format') as number) : MESSAGE_FORMAT_TEXT
	const imagePayload = format == MESSAGE_FORMAT_IMAGE ? parseChatImagePayload(content) : null
	return {
		id: id != null ? id : Date.now(),
		fromId: sender != null ? sender : 0,
		toId: receiver != null ? receiver : targetUid,
		content: format == MESSAGE_FORMAT_IMAGE ? '[图片]' : (content != null ? content : ''),
		createdAt: formatTimestamp(createTime),
		isSelf: selfId > 0 && sender != null ? sender == selfId : false,
		unread: readNumberValue(item, 'unread') == 1,
		format,
		messageType: format == MESSAGE_FORMAT_IMAGE ? 'image' : 'text',
		image: imagePayload,
		status: 'sent',
	}
}

function normalizePatchChatMessage(item: UTSJSONObject, selfId: number, unread: boolean): ChatMessage | null {
	const action = readStringValue(item, 'action')
	if (!isChatDisplayAction(action)) {
		return null
	}
	const sender = readNumberValue(item, 'sender')
	const receiver = readNumberValue(item, 'receiver')
	if (sender == null || receiver == null) {
		return null
	}
	const targetUid = sender == selfId ? receiver : sender
	const message = normalizeChatMessage(item, targetUid, selfId)
	if (message == null) {
		return null
	}
	message.unread = unread && !message.isSelf
	return message
}

export function getHistory(uid: number): Promise<ChatMessage[]> {
	const selfId = getStoredUserIdNumber()
	return requestApi<UTSJSONObject>({
		url: '/message/lookup/p2p?id=' + uid.toString(),
		method: 'GET',
		withAuth: true,
		data: null,
	}).then((response) => {
		const list = readObjectArrayValue(response.data, 'data')
		if (list == null || list.length == 0) {
			return []
		}
		const messages: ChatMessage[] = []
		for (let i = 0; i < list.length; i++) {
			const message = normalizeChatMessage(list[i], uid, selfId)
			if (message != null) {
				messages.push(message)
			}
		}
		return messages.reverse()
	})
}

export function sendTextMessage(uid: number, content: string): Promise<ChatMessage> {
	const selfId = getStoredUserIdNumber()
	const payload: UTSJSONObject = {
		uid,
		content,
		format: MESSAGE_FORMAT_TEXT,
	}
	return requestApi<number>({
		url: '/message',
		method: 'POST',
		withAuth: true,
		data: payload,
	}).then((response) => ({
		id: resolveSentMessageId(response.data),
		fromId: selfId,
		toId: uid,
		content,
		createdAt: t('common.now'),
		isSelf: true,
		format: MESSAGE_FORMAT_TEXT,
		messageType: 'text',
		status: 'sent',
	}))
}

export function sendImageMessage(uid: number, image: ChatImagePayload): Promise<ChatMessage> {
	const selfId = getStoredUserIdNumber()
	const content = JSON.stringify(image)
	const payload: UTSJSONObject = {
		uid,
		content,
		format: MESSAGE_FORMAT_IMAGE,
	}
	return requestApi<number>({
		url: '/message',
		method: 'POST',
		withAuth: true,
		data: payload,
	}).then((response) => ({
		id: resolveSentMessageId(response.data),
		fromId: selfId,
		toId: uid,
		content: '[图片]',
		createdAt: t('common.now'),
		isSelf: true,
		format: MESSAGE_FORMAT_IMAGE,
		messageType: 'image',
		image,
		status: 'sent',
	}))
}

export function sendMessage(uid: number, content: string): Promise<ChatMessage> {
	return sendTextMessage(uid, content)
}

export function readChatMessages(uid: number, idList: number[]): Promise<boolean> {
	if (uid <= 0 || idList.length == 0) {
		return Promise.resolve(true)
	}
	const payload: UTSJSONObject = {
		uid,
		idList,
	}
	return requestApi<UTSJSONObject>({
		url: '/message/read',
		method: 'POST',
		withAuth: true,
		data: payload,
	}).then(() => true)
}

export function receiveAllChatMessages(): Promise<boolean> {
	return requestApi<UTSJSONObject>({
		url: '/message/receive/all',
		method: 'POST',
		withAuth: true,
		data: null,
	}).then(() => true)
}

export function getMessagePatch(): Promise<ChatMessage[]> {
	const selfId = getStoredUserIdNumber()
	const maxMessageId = getStoredMaxMessageId()
	return requestApi<UTSJSONObject>({
		url: '/message/lookup/patch?maxMessageId=' + maxMessageId.toString(),
		method: 'GET',
		withAuth: true,
		data: null,
	}).then(async (response) => {
		const data = response.data
		const offlineList = readObjectArrayValue(data, 'offline')
		const patchList = readObjectArrayValue(data, 'patch')
		const nextMaxMessageId = readNumberValue(data, 'maxMessageId')
		if (nextMaxMessageId != null && nextMaxMessageId > 0) {
			setStoredMaxMessageId(nextMaxMessageId)
		}
		const messages: ChatMessage[] = []
		if (offlineList != null) {
			for (let i = 0; i < offlineList.length; i++) {
				const item = normalizePatchChatMessage(offlineList[i], selfId, true)
				if (item != null) {
					messages.push(item)
				}
			}
		}
		if (patchList != null) {
			for (let i = 0; i < patchList.length; i++) {
				const item = normalizePatchChatMessage(patchList[i], selfId, false)
				if (item != null) {
					messages.push(item)
				}
			}
		}
		if (messages.length > 0) {
			await receiveAllChatMessages().catch(() => false)
		}
		messages.sort((left, right) => left.id - right.id)
		return messages
	})
}
