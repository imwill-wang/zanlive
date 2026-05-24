import { getCurrentLocale, t } from '../store/i18n'

const BASE_URL = 'http://localhost:8080'
// const BASE_URL = 'http://192.168.0.2:8080'
const TOKEN_KEY = 'zanlive_mock_token'
const USER_ID_KEY = 'zanlive_mock_user_id'
const REQUEST_TIMEOUT = 10000
const TYPE_UNI_ANDROID = 5
const TYPE_UNI_IOS = 6
const TYPE_UNI_H5 = 7
const LOGIN_PAGE_URL = '/pages/auth/login'
const UNAUTHORIZED_NAVIGATION_DELAY = 1200
let handlingUnauthorized = false

export function mockResolve<T>(data: T): Promise<T> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(data)
		}, 120)
	})
}

export function mockReject<T>(message: string): Promise<T> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(new Error(message))
		}, 120)
	})
}



export type ApiRequestOptions = {
	url: string
	method: RequestMethod
	data: UTSJSONObject | null
	withAuth: boolean
}

export type ApiResponse<T> = {
	code: number
	message: string | null
	data: T | null
	token: string | null
	timestamp: number | null
}

export type ApiPageInfo = {
	count: number | null
	countPage: number | null
	size: number | null
	currentPage: number | null
}

export type ApiPageResponse<T> = {
	code: number
	message: string | null
	data: T[] | null
	token: string | null
	timestamp: number | null
	page: ApiPageInfo | null
	minId: number | null
	maxId: number | null
}

function getRequestLanguage(): string {
	const locale = getCurrentLocale()
	if (locale == 'zh-Hans' || locale == 'zh-Hant') {
		return 'zh'
	}
	return 'en'
}

function getStoredToken(): string {
	const value = uni.getStorageSync(TOKEN_KEY)
	if (typeof value == 'string') {
		return value as string
	}
	return ''
}

function getAppType(): number {
	let appType = TYPE_UNI_H5
	// #ifdef APP-ANDROID
	appType = TYPE_UNI_ANDROID
	// #endif
	// #ifdef APP-IOS
	appType = TYPE_UNI_IOS
	// #endif
	return appType
}

function resolveRequestMessage(message: string | null, statusCode: number): string {
	if (message != null && message.length > 0) {
		const translated = t(message)
		if (translated != message) {
			return translated
		}
		return message
	}
	if (statusCode >= 500) {
		return 'Server error'
	}
	if (statusCode == 0) {
		return 'Network error'
	}
	return 'Request failed'
}

function getUnauthorizedMessage(): string {
	const locale = getCurrentLocale()
	if (locale == 'zh-Hans') {
		return '登录失效'
	}
	if (locale == 'zh-Hant') {
		return '登入失效'
	}
	return 'Session expired'
}

function handleUnauthorized(): void {
	if (handlingUnauthorized) {
		return
	}
	handlingUnauthorized = true
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_ID_KEY)
	uni.showToast({
		title: getUnauthorizedMessage(),
		icon: 'none',
	})
	setTimeout(() => {
		uni.reLaunch({
			url: LOGIN_PAGE_URL,
			complete: () => {
				handlingUnauthorized = false
			},
		})
	}, UNAUTHORIZED_NAVIGATION_DELAY)
}

export function resolveMediaUrl(url: string | null): string {
	if (url == null || url.length == 0) {
		return '/static/logo.png'
	}
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}
	if (url.startsWith('/')) {
		return BASE_URL + url
	}
	return BASE_URL + '/' + url
}

export function resolveSocketEndpoint(port: number, path: string = '/'): string {
	const protocol = BASE_URL.startsWith('https://') ? 'wss://' : 'ws://'
	let host = BASE_URL.replace('https://', '').replace('http://', '')
	const slashIndex = host.indexOf('/')
	if (slashIndex >= 0) {
		host = host.substring(0, slashIndex)
	}
	const colonIndex = host.lastIndexOf(':')
	if (colonIndex >= 0) {
		host = host.substring(0, colonIndex)
	}
	const normalizedPath = path.length == 0 ? '/' : (path.startsWith('/') ? path : '/' + path)
	return protocol + host + ':' + port.toString() + normalizedPath
}

function padTime(value: number): string {
	return value < 10 ? '0' + value.toString() : value.toString()
}

export function formatTimestamp(timestamp: number | null): string {
	if (timestamp == null || timestamp <= 0) {
		return ''
	}
	const date = new Date(timestamp)
	return padTime(date.getHours()) + ':' + padTime(date.getMinutes())
}

export function readStringValue(source: UTSJSONObject | null, key: string): string | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (typeof value == 'string') {
		return value as string
	}
	return null
}

export function readNumberValue(source: UTSJSONObject | null, key: string): number | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (typeof value == 'number') {
		return value as number
	}
	if (typeof value == 'string') {
		const text = value as string
		if (text.length > 0) {
			return parseInt(text, 10)
		}
	}
	return null
}

export function readBooleanValue(source: UTSJSONObject | null, key: string): boolean | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (typeof value == 'boolean') {
		return value as boolean
	}
	return null
}

export function readObjectValue(source: UTSJSONObject | null, key: string): UTSJSONObject | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (value == null) {
		return null
	}
	return value as UTSJSONObject
}

export function readObjectArrayValue(source: UTSJSONObject | null, key: string): UTSJSONObject[] | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (value == null || !Array.isArray(value)) {
		return null
	}
	return value as UTSJSONObject[]
}

export function readStringArrayValue(source: UTSJSONObject | null, key: string): string[] | null {
	if (source == null) {
		return null
	}
	const value = source[key]
	if (value == null || !Array.isArray(value)) {
		return null
	}
	return value as string[]
}

export function resolveUnknownErrorMessage(error: any | null, fallback: string): string {
	if (error == null) {
		return fallback
	}
	if (error instanceof Error) {
		const runtimeError = error as Error
		if (runtimeError.message.length > 0) {
			return runtimeError.message
		}
	}
	const rawText = JSON.stringify(error)
	if (rawText != null && rawText.length > 0 && rawText != 'null') {
		return rawText
	}
	return fallback
}

export function requestApi<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
	return new Promise((resolve, reject) => {
		const requestUrl = BASE_URL + options.url
		const headers: UTSJSONObject = {
			'Content-Type': 'application/json',
			'Req-Language': getRequestLanguage(),
			'x-app-type': getAppType(),
			'x-app-version': 100,
		}
		if (options.withAuth) {
			const token = getStoredToken()
			if (token.length > 0) {
				headers['access-token'] = token
			}
		}
		uni.request<UTSJSONObject>({
			url: requestUrl,
			method: options.method,
			header: headers,
			data: options.data,
			dataType: 'json',
			responseType: 'text',
			timeout: REQUEST_TIMEOUT,
			success: (result) => {
				const body = result.data
				if (result.statusCode == 401) {
					handleUnauthorized()
					reject(new Error(getUnauthorizedMessage()))
					return
				}
				if (body == null) {
					reject(new Error(resolveRequestMessage(null, result.statusCode)))
					return
				}
				const code = readNumberValue(body, 'code')
				const message = readStringValue(body, 'message')
				if (code == 401) {
					handleUnauthorized()
					reject(new Error(getUnauthorizedMessage()))
					return
				}
				if (code != 200) {
					reject(new Error(resolveRequestMessage(message, result.statusCode)))
					return
				}
				const response: ApiResponse<T> = {
					code: code != null ? code : 200,
					message,
					data: body['data'] != null ? (body['data'] as T) : null,
					token: readStringValue(body, 'token'),
					timestamp: readNumberValue(body, 'timestamp'),
				}
				resolve(response)
			},
			fail: (error) => {
				reject(new Error(resolveRequestMessage(error.errMsg, 0)))
			},
		})
	})
}
