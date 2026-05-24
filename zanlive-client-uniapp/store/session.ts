import { reactive } from 'vue'

export type SessionStoreState = {
	activeUid: number
	officialUid: number
	unreadCount: number
}

export const sessionStore = reactive<SessionStoreState>({
	activeUid: 0,
	officialUid: 10000,
	unreadCount: 4,
})

export function setActiveSession(uid: number): void {
	sessionStore.activeUid = uid
}

export function clearActiveSession(): void {
	sessionStore.activeUid = 0
}

export function setOfficialSession(uid: number): void {
	if (uid > 0) {
		sessionStore.officialUid = uid
	}
}
