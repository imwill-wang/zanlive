import { formatTimestamp, readNumberValue, readStringValue, requestApi, resolveMediaUrl } from './http'
import type { GiftItem, WalletBalance, WalletRecord } from '../types/wallet'

function normalizeGiftType(type: string | null): string {
	if (type == null) {
		return ''
	}
	return type.trim().toUpperCase()
}

export async function getBalance(): Promise<WalletBalance> {
	const response = await requestApi<UTSJSONObject>({
		url: '/wallet/balance',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const data = response.data
	const balance = readNumberValue(data, 'balance')
	const currencyName = readStringValue(data, 'currencyName')
	return {
		balance: balance != null ? balance : 0,
		currencyName: currencyName != null && currencyName.length > 0 ? currencyName : 'Coins',
		freezeBalance: 0,
	}
}

export async function getGiftList(): Promise<GiftItem[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/gift/list',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		const emptyList: GiftItem[] = []
		return emptyList
	}
	return list.map((item) => {
		const giftId = readNumberValue(item, 'id')
		const name = readStringValue(item, 'name')
		const icon = readStringValue(item, 'icon')
		const price = readNumberValue(item, 'price')
		return {
			giftId: giftId != null ? giftId : 0,
			name: name != null ? name : '',
			icon: resolveMediaUrl(icon),
			price: price != null ? price : 0,
			type: normalizeGiftType(readStringValue(item, 'type')),
			resource: readStringValue(item, 'resource') != null ? resolveMediaUrl(readStringValue(item, 'resource')) : '',
		}
	})
}

export async function getGiftRecords(): Promise<WalletRecord[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/gift/records?pageNum=1&pageSize=20',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => {
		const count = readNumberValue(item, 'count')
		const totalAmount = readNumberValue(item, 'totalAmount')
		const createTime = readNumberValue(item, 'createTime')
		const id = readNumberValue(item, 'id')
		return {
			id: id != null ? id : Date.now(),
			title: 'Gift x' + (count != null ? count : 0).toString(),
			amount: 0 - (totalAmount != null ? totalAmount : 0),
			time: formatTimestamp(createTime),
			type: 'gift',
		}
	})
}

export async function getRewardRecords(): Promise<WalletRecord[]> {
	const response = await requestApi<UTSJSONObject[]>({
		url: '/reward/records?pageNum=1&pageSize=20',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const list = response.data
	if (list == null || list.length == 0) {
		return []
	}
	return list.map((item) => {
		const id = readNumberValue(item, 'id')
		const amount = readNumberValue(item, 'amount')
		const createTime = readNumberValue(item, 'createTime')
		return {
			id: id != null ? id : Date.now(),
			title: 'Reward',
			amount: 0 - (amount != null ? amount : 0),
			time: formatTimestamp(createTime),
			type: 'reward',
		}
	})
}
