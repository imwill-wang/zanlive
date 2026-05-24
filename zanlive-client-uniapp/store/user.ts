import { reactive } from 'vue'
import { getBalance } from '../services/wallet'
import type { WalletBalance } from '../types/wallet'

export type UserStoreState = {
	balance: WalletBalance | null
}

export const userStore = reactive<UserStoreState>({
	balance: null,
})

export async function refreshBalance(): Promise<boolean> {
	const result = await getBalance()
	userStore.balance = result
	return true
}
