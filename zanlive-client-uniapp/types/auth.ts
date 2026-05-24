export type LoginPayload = {
	account: string
	password: string
}

export type RegisterPayload = {
	name: string
	account: string
	password: string
}

export type AuthSession = {
	token: string
	userId: number
}
