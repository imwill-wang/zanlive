export type WalletBalance = {
	balance: number
	currencyName: string
	freezeBalance: number
}

export type RechargeAmountOption = {
	id: number
	amount: number
	bonusText: string
}

export type RechargePaymentMethod = {
	code: string
	name: string
	description: string
}

export type WalletRecord = {
	id: number
	title: string
	amount: number
	time: string
	type: string
}

export type GiftItem = {
	giftId: number
	name: string
	icon: string
	price: number
	type?: string
	resource?: string
}
