import type { ChatMessage, SessionItem } from '../types/message'

const SESSION_LIST_CACHE_KEY = 'zanlive_session_list_cache'
const CHAT_HISTORY_CACHE_PREFIX = 'zanlive_chat_history_'
const CHAT_HISTORY_LIMIT = 300

function readJsonArray<T>(rawValue: unknown): T[] {
	if (typeof rawValue != 'string' || rawValue.length == 0) {
		return []
	}
	try {
		const parsed = JSON.parse(rawValue)
		return Array.isArray(parsed) ? parsed as T[] : []
	} catch (_error) {
		return []
	}
}

export function getCachedSessionList(): SessionItem[] {
	return readJsonArray<SessionItem>(uni.getStorageSync(SESSION_LIST_CACHE_KEY))
}

export function saveCachedSessionList(list: SessionItem[]): void {
	if (list.length == 0) {
		return
	}
	uni.setStorageSync(SESSION_LIST_CACHE_KEY, JSON.stringify(list))
}

export function mergeSessionList(cached: SessionItem[], incoming: SessionItem[]): SessionItem[] {
	if (incoming.length == 0) {
		return [...cached]
	}
	const incomingUids = new Set<number>()
	for (let i = 0; i < incoming.length; i++) {
		incomingUids.add(incoming[i].uid)
	}
	const preserved = cached.filter((item) => !incomingUids.has(item.uid))
	return [...incoming, ...preserved]
}

export function getCachedChatHistory(uid: number): ChatMessage[] {
	if (uid <= 0) {
		return []
	}
	return readJsonArray<ChatMessage>(uni.getStorageSync(CHAT_HISTORY_CACHE_PREFIX + uid.toString()))
}

export function saveCachedChatHistory(uid: number, list: ChatMessage[]): void {
	if (uid <= 0 || list.length == 0) {
		return
	}
	const trimmed = list.length > CHAT_HISTORY_LIMIT
		? list.slice(list.length - CHAT_HISTORY_LIMIT)
		: list
	uni.setStorageSync(CHAT_HISTORY_CACHE_PREFIX + uid.toString(), JSON.stringify(trimmed))
}

function isSameChatMessage(left: ChatMessage, right: ChatMessage): boolean {
	if (left.id > 0 && left.id == right.id) {
		return true
	}
	if (!left.isSelf || !right.isSelf) {
		return false
	}
	if (left.content != right.content) {
		return false
	}
	const leftType = left.messageType != null ? left.messageType : 'text'
	const rightType = right.messageType != null ? right.messageType : 'text'
	return leftType == rightType
}

function resolveMergedMessageId(existing: ChatMessage, incoming: ChatMessage): number {
	const incomingId = incoming.id > 0 ? incoming.id : 0
	const existingId = existing.id > 0 ? existing.id : 0
	// 本地临时 id（Date.now）远大于服务端消息 id
	if (incomingId > 0 && (existingId == 0 || existingId > 1000000000000)) {
		return incomingId
	}
	if (existingId > 0) {
		return existingId
	}
	return incomingId
}

export function mergeChatMessages(baseList: ChatMessage[], incomingList: ChatMessage[]): ChatMessage[] {
	const merged = [...baseList]
	for (let i = 0; i < incomingList.length; i++) {
		const nextItem = incomingList[i]
		const index = merged.findIndex((item) => isSameChatMessage(item, nextItem))
		if (index >= 0) {
			const existing = merged[index]
			merged[index] = {
				...existing,
				...nextItem,
				id: resolveMergedMessageId(existing, nextItem),
			}
		} else {
			merged.push(nextItem)
		}
	}
	merged.sort((left, right) => left.id - right.id)
	return merged
}
