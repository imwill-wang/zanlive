import { t } from '../store/i18n'
import { md5 } from './md5'
import { readNumberValue, readObjectValue, readStringValue, requestApi, resolveMediaUrl } from './http'
import type { AuthSession, LoginPayload, RegisterPayload } from '../types/auth'
import type { UserProfile } from '../types/user'

function resolveAvatar(avatar: string | null): string {
	if (avatar == null || avatar.length == 0) {
		return '/static/logo.png'
	}
	return resolveMediaUrl(avatar)
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
	const passwordHash = md5(payload.password)
	const response = await requestApi<UTSJSONObject>({
		url: '/auth/login',
		method: 'POST',
		withAuth: false,
		data: {
			account: payload.account,
			password: passwordHash,
		} as UTSJSONObject,
	})
	const data = response.data
	const user = readObjectValue(data, 'user')
	if (data == null || user == null) {
		throw new Error(t('auth.invalidCredentials'))
	}
	const tokenValue = readStringValue(data, 'token')
	const uid = readNumberValue(user, 'uid')
	const token = tokenValue != null && tokenValue.length > 0 ? tokenValue : response.token
	if (token == null || token.length == 0) {
		throw new Error(t('login.errorDefault'))
	}
	if (uid == null || uid <= 0) {
		throw new Error(t('auth.invalidCredentials'))
	}
	const session: AuthSession = {
		token,
		userId: uid,
	}
	return session
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
	const passwordHash = md5(payload.password)
	const response = await requestApi<UTSJSONObject>({
		url: '/auth/register',
		method: 'POST',
		withAuth: false,
		data: {
			name: payload.name,
			account: payload.account,
			password: passwordHash,
		} as UTSJSONObject,
	})
	const data = response.data
	const user = readObjectValue(data, 'user')
	if (data == null || user == null) {
		throw new Error(t('register.errorDefault'))
	}
	const tokenValue = readStringValue(data, 'token')
	const uid = readNumberValue(user, 'uid')
	const token = tokenValue != null && tokenValue.length > 0 ? tokenValue : response.token
	if (token == null || token.length == 0) {
		throw new Error(t('register.errorDefault'))
	}
	if (uid == null || uid <= 0) {
		throw new Error(t('register.errorDefault'))
	}
	const session: AuthSession = {
		token,
		userId: uid,
	}
	return session
}

export async function getCurrentUser(userId: number): Promise<UserProfile | null> {
	const response = await requestApi<UTSJSONObject>({
		url: '/user',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	const data = response.data
	if (data == null) {
		return null
	}
	const id = readNumberValue(data, 'id')
	const name = readStringValue(data, 'name')
	const account = readStringValue(data, 'account')
	const avatar = readStringValue(data, 'avatar')
	const motto = readStringValue(data, 'motto')
	const user: UserProfile = {
		id: id != null && id > 0 ? id : userId,
		name: name != null ? name : '',
		account: account != null ? account : '',
		avatar: resolveAvatar(avatar),
		motto: motto != null ? motto : '',
		coinBalance: 0,
		memberType: 'member',
		official: false,
	}
	return user
}

export async function logout(): Promise<boolean> {
	await requestApi<UTSJSONObject>({
		url: '/user/logout',
		method: 'GET',
		withAuth: true,
		data: null,
	})
	return true
}
