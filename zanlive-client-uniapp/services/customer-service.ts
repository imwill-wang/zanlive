import { readBooleanValue, readNumberValue, readStringValue, requestApi, resolveMediaUrl, resolveUnknownErrorMessage } from './http'
import type { ChatImagePayload } from '../types/message'
import type { UserProfile } from '../types/user'

const CUSTOMER_SERVICE_NOT_FOUND = 'customer_service.not_found'
const BASE_URL = 'http://localhost:8080'
const TOKEN_KEY = 'zanlive_mock_token'
const CHAT_IMAGE_BUCKET = 'chat-space'

export type CustomerServiceSession = {
	uid: number
	name: string
	avatar: string
	official: boolean
	welcomeMessage: string
	sessionType: string
}

export type RechargeOfflineInfo = {
	tips: string
	customerServiceUid: number
	customerServiceName: string
	defaultMessage: string
}

function resolveCustomerServiceError(error: any): boolean {
	return resolveUnknownErrorMessage(error, '') == CUSTOMER_SERVICE_NOT_FOUND
}

function resolveStoredToken(): string {
	const value = uni.getStorageSync(TOKEN_KEY)
	if (typeof value == 'string') {
		return value as string
	}
	return ''
}

function resolveUploadHeaders(): UTSJSONObject {
	const headers: UTSJSONObject = {}
	const token = resolveStoredToken()
	if (token.length > 0) {
		headers['access-token'] = token
	}
	return headers
}

function resolveUploadKey(filePath: string): string {
	const extensionIndex = filePath.lastIndexOf('.')
	const suffix = extensionIndex >= 0 ? filePath.substring(extensionIndex) : '.jpg'
	return 'customer-service-' + Date.now().toString() + '-' + Math.floor(Math.random() * 100000).toString() + suffix
}

function uploadImageFile(filePath: string, key: string): Promise<void> {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/file/' + CHAT_IMAGE_BUCKET + '/' + key,
			filePath,
			name: 'file',
			header: resolveUploadHeaders(),
			success: (result) => {
				if (result.statusCode == 200) {
					resolve()
					return
				}
				reject(new Error(result.errMsg != null && result.errMsg.length > 0 ? result.errMsg : 'Upload failed'))
			},
			fail: (error) => {
				reject(new Error(error.errMsg))
			},
		})
	})
}

function getLocalImageInfo(filePath: string): Promise<{ width: number, height: number }> {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: filePath,
			success: (result) => {
				resolve({
					width: result.width,
					height: result.height,
				})
			},
			fail: (error) => {
				reject(new Error(error.errMsg))
			},
		})
	})
}

export async function getCustomerServiceAccount(): Promise<UserProfile | null> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/customer-service/account',
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const data = response.data
		if (data == null) {
			return null
		}
		const uid = readNumberValue(data, 'uid')
		const name = readStringValue(data, 'name')
		const avatar = readStringValue(data, 'avatar')
		return {
			id: uid != null ? uid : 0,
			name: name != null && name.length > 0 ? name : 'Support',
			account: 'customer-service',
			avatar: resolveMediaUrl(avatar),
			motto: '',
			coinBalance: 0,
			memberType: 'official',
			official: readBooleanValue(data, 'official') == true,
		}
	} catch (error) {
		if (resolveCustomerServiceError(error)) {
			return null
		}
		throw error
	}
}

export async function getCustomerServiceSession(): Promise<CustomerServiceSession | null> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/customer-service/session',
			method: 'POST',
			withAuth: true,
			data: null,
		})
		const data = response.data
		if (data == null) {
			return null
		}
		return {
			uid: readNumberValue(data, 'uid') != null ? (readNumberValue(data, 'uid') as number) : 0,
			name: readStringValue(data, 'name') != null && (readStringValue(data, 'name') as string).length > 0 ? (readStringValue(data, 'name') as string) : 'Support',
			avatar: resolveMediaUrl(readStringValue(data, 'avatar')),
			official: readBooleanValue(data, 'official') == true,
			welcomeMessage: readStringValue(data, 'welcomeMessage') != null ? (readStringValue(data, 'welcomeMessage') as string) : '',
			sessionType: readStringValue(data, 'sessionType') != null ? (readStringValue(data, 'sessionType') as string) : 'customer_service',
		}
	} catch (error) {
		if (resolveCustomerServiceError(error)) {
			return null
		}
		throw error
	}
}

export async function getRechargeOfflineInfo(): Promise<RechargeOfflineInfo | null> {
	try {
		const response = await requestApi<UTSJSONObject>({
			url: '/recharge/offline/info',
			method: 'GET',
			withAuth: true,
			data: null,
		})
		const data = response.data
		if (data == null) {
			return null
		}
		return {
			tips: readStringValue(data, 'tips') != null ? (readStringValue(data, 'tips') as string) : '',
			customerServiceUid: readNumberValue(data, 'customerServiceUid') != null ? (readNumberValue(data, 'customerServiceUid') as number) : 0,
			customerServiceName: readStringValue(data, 'customerServiceName') != null ? (readStringValue(data, 'customerServiceName') as string) : '',
			defaultMessage: readStringValue(data, 'defaultMessage') != null ? (readStringValue(data, 'defaultMessage') as string) : '',
		}
	} catch (error) {
		if (resolveCustomerServiceError(error)) {
			return null
		}
		throw error
	}
}

export async function getRechargeGuide(): Promise<string> {
	const info = await getRechargeOfflineInfo()
	return info != null ? info.tips : ''
}

export async function uploadCustomerServiceImage(filePath: string): Promise<ChatImagePayload> {
	const imageInfo = await getLocalImageInfo(filePath)
	const key = resolveUploadKey(filePath)
	await uploadImageFile(filePath, key)
	return {
		bucket: CHAT_IMAGE_BUCKET,
		image: key,
		thumb: key,
		ow: imageInfo.width,
		oh: imageInfo.height,
		tw: imageInfo.width,
		th: imageInfo.height,
	}
}
