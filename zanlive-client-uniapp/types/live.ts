export type LiveCategory = {
	code: string
	name: string
	sort: number
}

export type AnchorCard = {
	anchorId: number
	anchorName: string
	anchorAvatar: string
	mainImage: string
	gallery: string[]
	intro: string
	tags: string[]
	categoryCodes?: string[]
	isLiving: boolean
	roomId: number
	liveTitle: string
	onlineCount: number
	heat: number
}

export type LiveRoomDetail = {
	roomId: number
	anchorId: number
	anchorName: string
	anchorAvatar: string
	liveTitle: string
	streamUrl: string
	joinToken?: string
	socketUrl?: string
	onlineCount: number
	heat: number
	roomNotice: string
	allowMessage?: boolean
	allowGift: boolean
	allowReward: boolean
}

export type LiveMessage = {
	id: number
	serverMessageId?: number
	clientMessageId?: string
	senderId?: number
	senderName: string
	content: string
	createdAt: string
	timestamp?: number
	messageType?: string
	isSelf?: boolean
	status?: 'sending' | 'sent' | 'failed'
}

export type LiveGiftEvent = {
	id: number
	senderId?: number
	senderName: string
	giftId: number
	giftName: string
	giftIcon: string
	giftType?: string
	resource?: string
	quantity: number
	comboCount: number
	createdAt: string
	timestamp?: number
}

export type LiveRoomActivity = {
	messages: LiveMessage[]
	gifts: LiveGiftEvent[]
}

export type LiveMessageSendResult = {
	messageId: number
	timestamp: number
	clientMessageId: string
}

export type LiveRoomRankingItem = {
	rankNo: number
	roomId: number
	anchorId: number
	anchorName: string
	anchorAvatar: string
	liveTitle: string
	onlineCount: number
	heat: number
	giftTotalAmount: number
	rewardTotalAmount: number
	totalAmount: number
}
