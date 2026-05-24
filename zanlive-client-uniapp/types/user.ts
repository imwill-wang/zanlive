export type UserProfile = {
	id: number
	name: string
	account: string
	avatar: string
	motto: string
	coinBalance: number
	memberType: string
	official: boolean
}

export type FriendProfile = {
	id: number
	name: string
	alias?: string
	avatar: string
	statusText: string
}

export type FriendRelationStatus = 'SELF' | 'FRIEND' | 'APPLY_SENT' | 'APPLY_RECEIVED' | 'REJECTED' | 'NONE'

export type FriendApplyStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type FriendApplyDirection = 'IN' | 'OUT'

export type FriendApplyItem = {
	id: number
	userId: number
	name: string
	avatar: string
	message: string
	createdAt: string
	handleAt: string
	direction: FriendApplyDirection
	status: FriendApplyStatus
}

export type FriendSearchResult = {
	applyId: number
	userId: number
	name: string
	avatar: string
	statusText: string
	relationStatus: FriendRelationStatus
	canApply: boolean
	canChat: boolean
	canHandle: boolean
	telephone: string
	account: string
}

export type AnchorFollowState = {
	anchorId: number
	isFollowing: boolean
}
