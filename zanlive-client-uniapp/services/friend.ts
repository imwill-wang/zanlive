import { formatTimestamp, readBooleanValue, readNumberValue, readObjectValue, readStringArrayValue, readStringValue, requestApi, resolveMediaUrl } from './http'
import type { AnchorFollowState, FriendApplyItem, FriendProfile, FriendSearchResult } from '../types/user'
import type { AnchorCard } from '../types/live'
import { t } from '../store/i18n'

const anchorFollowStateCache: Record<number, boolean> = {}

export function readCachedAnchorFollowState(anchorId: number): boolean | null {
	if (anchorId <= 0) {
		return null
	}
	const value = anchorFollowStateCache[anchorId]
	if (typeof value == 'boolean') {
		return value
	}
	return null
}

export function writeCachedAnchorFollowState(anchorId: number, isFollowing: boolean): void {
	if (anchorId <= 0) {
		return
	}
	anchorFollowStateCache[anchorId] = isFollowing
}

export async function getFriendList(): Promise<FriendProfile[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/friend/list',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => normalizeFriendProfile(item))
}

export async function getFriendApplyList(): Promise<FriendApplyItem[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/friend/apply/list',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => {
		const user = readObjectValue(item, 'user')
		const userId = readNumberValue(user, 'id') != null ? (readNumberValue(user, 'id') as number) : 0
		return {
			id: readNumberValue(item, 'id') != null ? (readNumberValue(item, 'id') as number) : Date.now(),
			userId,
			name: readStringValue(user, 'alias') != null && (readStringValue(user, 'alias') as string).length > 0
				? (readStringValue(user, 'alias') as string)
				: (readStringValue(user, 'name') != null ? (readStringValue(user, 'name') as string) : ''),
			avatar: resolveMediaUrl(readStringValue(user, 'avatar')),
			message: readStringValue(item, 'message') != null ? (readStringValue(item, 'message') as string) : '',
			createdAt: formatTimestamp(readNumberValue(item, 'createTime')),
			handleAt: formatTimestamp(readNumberValue(item, 'handleTime')),
			direction: readStringValue(item, 'direction') == 'IN' ? 'IN' : 'OUT',
			status: readStringValue(item, 'status') == 'ACCEPTED' ? 'ACCEPTED' : (readStringValue(item, 'status') == 'REJECTED' ? 'REJECTED' : 'PENDING'),
		}
	})
}

export async function searchFriend(keyword: string): Promise<FriendSearchResult | null> {
	const response = await requestApi<UTSJSONObject>({
		url: '/friend/search?keyword=' + encodeURIComponent(keyword),
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const data = response.data
	if (data == null) {
		return null
	}
	const user = readObjectValue(data, 'user')
	const relationStatusValue = readStringValue(data, 'relationStatus')
	const relationStatus = relationStatusValue != null && relationStatusValue.length > 0 ? relationStatusValue : 'NONE'
	return {
		applyId: readNumberValue(data, 'applyId') != null ? (readNumberValue(data, 'applyId') as number) : 0,
		userId: readNumberValue(user, 'id') != null ? (readNumberValue(user, 'id') as number) : 0,
		name: readStringValue(user, 'alias') != null && (readStringValue(user, 'alias') as string).length > 0
			? (readStringValue(user, 'alias') as string)
			: (readStringValue(user, 'name') != null ? (readStringValue(user, 'name') as string) : ''),
		avatar: resolveMediaUrl(readStringValue(user, 'avatar')),
		statusText: readStringValue(user, 'motto') != null ? (readStringValue(user, 'motto') as string) : '',
		relationStatus: relationStatus as FriendSearchResult['relationStatus'],
		canApply: readBooleanValue(data, 'canApply') == true,
		canChat: readBooleanValue(data, 'canChat') == true,
		canHandle: readBooleanValue(data, 'canHandle') == true,
		telephone: readStringValue(user, 'telephone') != null ? (readStringValue(user, 'telephone') as string) : '',
		account: readStringValue(user, 'account') != null ? (readStringValue(user, 'account') as string) : '',
	}
}

export async function applyFriend(fid: number, message: string): Promise<void> {
	await requestApi<UTSJSONObject>({
		url: '/friend/apply/' + fid.toString() + '?message=' + encodeURIComponent(message),
		method: 'POST',
		withAuth: true,
		data: null,
	})
}

export async function acceptFriendApply(applyId: number, uid: number, alias: string): Promise<void> {
	await requestApi<UTSJSONObject>({
		url: '/friend/accept',
		method: 'POST',
		withAuth: true,
		data: {
			applyId,
			uid,
			alias,
		} as UTSJSONObject,
	})
}

export async function rejectFriendApply(applyId: number): Promise<void> {
	await requestApi<UTSJSONObject>({
		url: '/friend/reject',
		method: 'POST',
		withAuth: true,
		data: {
			applyId,
		} as UTSJSONObject,
	})
}

function normalizeFriendProfile(item: UTSJSONObject): FriendProfile {
	const alias = readStringValue(item, 'alias')
	const name = alias != null && alias.length > 0
		? alias
		: (readStringValue(item, 'name') != null ? (readStringValue(item, 'name') as string) : '')
	return {
		id: readNumberValue(item, 'uid') != null ? (readNumberValue(item, 'uid') as number) : (readNumberValue(item, 'id') != null ? (readNumberValue(item, 'id') as number) : 0),
		name,
		alias: alias != null ? alias : '',
		avatar: resolveMediaUrl(readStringValue(item, 'avatar')),
		statusText: readStringValue(item, 'motto') != null && (readStringValue(item, 'motto') as string).length > 0
			? (readStringValue(item, 'motto') as string)
			: (readStringValue(item, 'account') != null ? (readStringValue(item, 'account') as string) : ''),
	}
}

export async function getFollowedAnchorList(): Promise<AnchorCard[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/anchor/follow/list',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => {
		const avatarValue = readStringValue(item, 'anchorAvatar')
		const mainImageValue = readStringValue(item, 'mainImage')
		const galleryValues = readStringArrayValue(item, 'gallery')
		const tagValues = readStringArrayValue(item, 'tags')
		const avatar = resolveMediaUrl(avatarValue)
		const mainImage = mainImageValue != null && (mainImageValue as string).length > 0 ? resolveMediaUrl(mainImageValue) : avatar
		const anchorItem: AnchorCard = {
			anchorId: readNumberValue(item, 'anchorId') != null ? (readNumberValue(item, 'anchorId') as number) : 0,
			anchorName: readStringValue(item, 'anchorName') != null ? (readStringValue(item, 'anchorName') as string) : t('common.anchor'),
			anchorAvatar: avatar,
			mainImage,
			gallery: galleryValues != null && galleryValues.length > 0 ? galleryValues.map((image) => resolveMediaUrl(image)) : [avatar],
			intro: readStringValue(item, 'intro') != null ? (readStringValue(item, 'intro') as string) : '',
			tags: tagValues != null ? tagValues : [],
			categoryCodes: [],
			isLiving: readBooleanValue(item, 'isLiving') == true,
			roomId: readNumberValue(item, 'roomId') != null ? (readNumberValue(item, 'roomId') as number) : 0,
			liveTitle: readStringValue(item, 'liveTitle') != null ? (readStringValue(item, 'liveTitle') as string) : '',
			onlineCount: readNumberValue(item, 'onlineCount') != null ? (readNumberValue(item, 'onlineCount') as number) : 0,
			heat: readNumberValue(item, 'heat') != null ? (readNumberValue(item, 'heat') as number) : 0,
		}
		writeCachedAnchorFollowState(anchorItem.anchorId, true)
		return anchorItem
	})
}

export async function getAnchorFollowState(anchorId: number): Promise<AnchorFollowState> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/anchor/follow/status?anchorId=' + anchorId.toString(),
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const data = response.data
		const relation = readObjectValue(data, 'relation')
		const isFollowing = readBooleanValue(data, 'isFollowing') == true || readBooleanValue(relation, 'isFollowing') == true || readBooleanValue(relation, 'followed') == true
		writeCachedAnchorFollowState(anchorId, isFollowing)
		return {
			anchorId,
			isFollowing,
		}
	} catch (_error) {
		return {
			anchorId,
			isFollowing: false,
		}
	}
}

export async function followAnchor(anchorId: number): Promise<AnchorFollowState> {
	try {
		await requestApi<UTSJSONObject>({
			url: '/anchor/follow',
			method: 'POST',
			withAuth: true,
			data: {
				anchorId,
			} as UTSJSONObject,
		})
		writeCachedAnchorFollowState(anchorId, true)
		return {
			anchorId,
			isFollowing: true,
		}
	} catch (error) {
		throw error
	}
}

export async function unfollowAnchor(anchorId: number): Promise<AnchorFollowState> {
	try {
		await requestApi<UTSJSONObject>({
			url: '/anchor/unfollow',
			method: 'POST',
			withAuth: true,
			data: {
				anchorId,
			} as UTSJSONObject,
		})
		writeCachedAnchorFollowState(anchorId, false)
		return {
			anchorId,
			isFollowing: false,
		}
	} catch (error) {
		throw error
	}
}
