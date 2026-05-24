import { reactive } from 'vue'
import { getCurrentUser, login, logout, register } from '../services/auth'
import type { LoginPayload, RegisterPayload } from '../types/auth'
import type { UserProfile } from '../types/user'

const TOKEN_KEY = 'zanlive_mock_token'
const USER_ID_KEY = 'zanlive_mock_user_id'
const HOME_TAB_URL = '/pages/live/index'
const HOME_NAVIGATION_FALLBACK_DELAY = 320

export type AuthStoreState = {
	token: string
	userId: number
	ready: boolean
	isLoggedIn: boolean
	user: UserProfile | null
}

export const authStore = reactive<AuthStoreState>({
	token: '',
	userId: 0,
	ready: false,
	isLoggedIn: false,
	user: null,
})

function applySession(token: string, userId: number): void {
	authStore.token = token
	authStore.userId = userId
	authStore.isLoggedIn = token.length > 0 && userId > 0
	uni.setStorageSync(TOKEN_KEY, token)
	uni.setStorageSync(USER_ID_KEY, userId.toString())
}

async function loadCurrentUserSafely(userId: number): Promise<UserProfile | null> {
	try {
		const user = await getCurrentUser(userId)
		authStore.user = user
		return user
	} catch (error) {
		authStore.user = null
		return null
	}
}

function readStoredToken(): string {
	const value = uni.getStorageSync(TOKEN_KEY)
	if (typeof value == 'string') {
		return value as string
	}
	return ''
}

function readStoredUserId(): number {
	const value = uni.getStorageSync(USER_ID_KEY)
	if (typeof value == 'string') {
		const text = value as string
		if (text.length == 0) {
			return 0
		}
		return parseInt(text, 10)
	}
	if (typeof value == 'number') {
		return value as number
	}
	return 0
}

export async function restoreAuthState(): Promise<boolean> {
	authStore.token = readStoredToken()
	authStore.userId = readStoredUserId()
	authStore.isLoggedIn = authStore.token.length > 0 && authStore.userId > 0
	if (!authStore.isLoggedIn) {
		authStore.ready = true
		authStore.user = null
		return false
	}
	try {
		const user = await getCurrentUser(authStore.userId)
		authStore.user = user
		authStore.ready = true
		return true
	} catch (error) {
		authStore.user = null
		authStore.ready = true
		return true
	}
}

export async function loginWithPayload(payload: LoginPayload): Promise<boolean> {
	const session = await login(payload)
	applySession(session.token, session.userId)
	await loadCurrentUserSafely(session.userId)
	return true
}

export async function registerWithPayload(payload: RegisterPayload): Promise<boolean> {
	try {
		const session = await register(payload)
		applySession(session.token, session.userId)
		await loadCurrentUserSafely(session.userId)
		return true
	} catch (error) {
		clearAuthState()
		throw error
	}
}

export function clearAuthState(): void {
	authStore.token = ''
	authStore.userId = 0
	authStore.isLoggedIn = false
	authStore.user = null
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_ID_KEY)
}

export async function logoutCurrentUser(): Promise<boolean> {
	await logout()
	clearAuthState()
	return true
}

export function navigateToHomeAfterAuth(): Promise<boolean> {
	return new Promise((resolve, reject) => {
		let completed = false

		function resolveOnce(): void {
			if (completed) {
				return
			}
			completed = true
			resolve(true)
		}

		function fallbackToReLaunch(): void {
			if (completed) {
				return
			}
			completed = true
			uni.reLaunch({
				url: HOME_TAB_URL,
				success: () => {
					resolve(true)
				},
				fail: (error) => {
					reject(error)
				},
			})
		}

		uni.switchTab({
			url: HOME_TAB_URL,
			success: () => {
				resolveOnce()
			},
			fail: () => {
				fallbackToReLaunch()
			},
		})

		setTimeout(() => {
			fallbackToReLaunch()
		}, HOME_NAVIGATION_FALLBACK_DELAY)
	})
}
