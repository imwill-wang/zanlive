export type SessionItem = {
	id: number
	type: string
	uid: number
	name: string
	avatar: string
	lastMessage: string
	lastTime: string
	lastTimestamp?: number
	unreadCount: number
	official: boolean
	top?: boolean
}

export type ChatImagePayload = {
	bucket: string
	image: string
	thumb: string
	ow: number
	oh: number
	tw: number
	th: number
}

export type ChatMessage = {
	id: number
	fromId: number
	toId: number
	content: string
	createdAt: string
	isSelf: boolean
	unread?: boolean
	format?: number
	messageType?: string
	image?: ChatImagePayload | null
	status?: 'sending' | 'sent' | 'failed'
}
