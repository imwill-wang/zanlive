import type { AuthSession } from '../types/auth'
import type { AnchorCard, LiveCategory, LiveMessage, LiveRoomDetail } from '../types/live'
import type { ChatMessage, SessionItem } from '../types/message'
import type { FriendApplyItem, FriendProfile, UserProfile } from '../types/user'
import type { GiftItem, RechargeAmountOption, RechargePaymentMethod, WalletBalance, WalletRecord } from '../types/wallet'

export const demoSession: AuthSession = {
	token: 'mock-token-demo-001',
	userId: 1,
}

export const mockUsers: UserProfile[] = [
	{
		id: 1,
		name: '小赞',
		account: 'demo001',
		avatar: '/static/logo.png',
		motto: '今晚想看一场热闹又轻松的直播。',
		coinBalance: 1280,
		memberType: '普通用户',
		official: false,
	},
	{
		id: 2,
		name: '官方客服',
		account: 'service001',
		avatar: '/static/logo.png',
		motto: '充值、到账、问题反馈都可以来找我。',
		coinBalance: 0,
		memberType: '客服',
		official: true,
	},
	{
		id: 3,
		name: '阿宁',
		account: 'anchor003',
		avatar: '/static/logo.png',
		motto: '今天也想把舞台点亮。',
		coinBalance: 860,
		memberType: '主播',
		official: false,
	},
	{
		id: 4,
		name: '木子',
		account: 'friend004',
		avatar: '/static/logo.png',
		motto: '陪你聊天，也陪你熬夜。',
		coinBalance: 240,
		memberType: '普通用户',
		official: false,
	},
]

export const mockLiveCategories: LiveCategory[] = [
	{ code: 'nearby', name: '附近', sort: 1 },
	{ code: 'hot', name: '热门', sort: 2 },
	{ code: 'rookie', name: '新秀', sort: 3 },
	{ code: 'goddess', name: '女神', sort: 4 },
	{ code: 'male', name: '男神', sort: 5 },
	{ code: 'talent', name: '才艺', sort: 6 },
]

export const mockAnchors: AnchorCard[] = [
	{
		anchorId: 101,
		anchorName: '阿宁',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png', '/static/logo.png'],
		intro: '清亮歌声配上慢热聊天，适合夜间陪伴。',
		tags: ['治愈系', '聊天', '唱歌'],
		categoryCodes: ['nearby', 'hot', 'talent'],
		isLiving: true,
		roomId: 9001,
		liveTitle: '夜色慢慢唱',
		onlineCount: 1420,
		heat: 8760,
	},
	{
		anchorId: 102,
		anchorName: '莓莓',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png', '/static/logo.png', '/static/logo.png'],
		intro: '轻松闲聊和小游戏连麦，今天心情很好。',
		tags: ['轻互动', '小游戏'],
		categoryCodes: ['hot', 'goddess', 'nearby'],
		isLiving: true,
		roomId: 9002,
		liveTitle: '换一首心情歌',
		onlineCount: 960,
		heat: 6030,
	},
	{
		anchorId: 103,
		anchorName: '星柚',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png'],
		intro: '白天拍照，夜里直播，分享最近的城市角落。',
		tags: ['城市', '分享'],
		categoryCodes: ['nearby', 'rookie'],
		isLiving: false,
		roomId: 0,
		liveTitle: '',
		onlineCount: 0,
		heat: 0,
	},
	{
		anchorId: 104,
		anchorName: 'Yoyo',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png', '/static/logo.png'],
		intro: '分享日常穿搭，也会偶尔带一点舞蹈练习。',
		tags: ['穿搭', '舞蹈'],
		categoryCodes: ['goddess', 'talent', 'hot'],
		isLiving: true,
		roomId: 9004,
		liveTitle: '今晚一起选战袍',
		onlineCount: 521,
		heat: 3500,
	},
	{
		anchorId: 105,
		anchorName: '阿泽',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png', '/static/logo.png'],
		intro: '会聊球赛也会唱一点老歌，夜里经常开麦互动。',
		tags: ['聊天', '音乐', '互动'],
		categoryCodes: ['male', 'hot', 'talent'],
		isLiving: true,
		roomId: 9005,
		liveTitle: '深夜聊点有趣的',
		onlineCount: 688,
		heat: 4180,
	},
	{
		anchorId: 106,
		anchorName: 'Luna',
		anchorAvatar: '/static/logo.png',
		mainImage: '/static/logo.png',
		gallery: ['/static/logo.png'],
		intro: '刚开播不久，正在慢慢建立自己的直播节奏。',
		tags: ['新秀', '聊天'],
		categoryCodes: ['rookie', 'goddess'],
		isLiving: true,
		roomId: 9006,
		liveTitle: '第一次夜聊见面会',
		onlineCount: 233,
		heat: 1260,
	},
]

export const mockFriends: FriendProfile[] = [
	{ id: 3, name: '阿宁', avatar: '/static/logo.png', statusText: '刚刚在线' },
	{ id: 4, name: '木子', avatar: '/static/logo.png', statusText: '2 分钟前发来消息' },
	{ id: 5, name: '橙橙', avatar: '/static/logo.png', statusText: '今晚想看你推荐的直播' },
]

export const mockFriendApplies: FriendApplyItem[] = [
	{ id: 10, name: '小夏', avatar: '/static/logo.png', message: '看到你也在阿宁直播间，想加你聊聊。', createdAt: '今天 10:24' },
	{ id: 11, name: '阿泽', avatar: '/static/logo.png', message: '一起拼个打赏局吗？', createdAt: '昨天 21:03' },
]

export const mockSessions: SessionItem[] = [
	{ id: 1, type: 'customer_service', uid: 10000, name: '官方客服', avatar: '/static/logo.png', lastMessage: '充值到账后会第一时间通知你。', lastTime: '09:20', unreadCount: 1, official: true },
	{ id: 2, type: 'friend', uid: 3, name: '阿宁', avatar: '/static/logo.png', lastMessage: '直播快开始啦，来前排坐。', lastTime: '昨天', unreadCount: 0, official: false },
	{ id: 3, type: 'friend', uid: 4, name: '木子', avatar: '/static/logo.png', lastMessage: '你要不要也试试送个小礼物？', lastTime: '周二', unreadCount: 3, official: false },
]

type ChatThread = {
	uid: number
	messages: ChatMessage[]
}

export const mockChatThreads: ChatThread[] = [
	{
		uid: 10000,
		messages: [
			{ id: 1, fromId: 10000, toId: 1, content: '你好，我是官方客服。', createdAt: '09:00', isSelf: false },
			{ id: 2, fromId: 1, toId: 10000, content: '我要充值', createdAt: '09:02', isSelf: true },
			{ id: 3, fromId: 10000, toId: 1, content: '收到，请把付款截图发我，到账后我帮你补币。', createdAt: '09:03', isSelf: false },
		],
	},
	{
		uid: 3,
		messages: [
			{ id: 4, fromId: 3, toId: 1, content: '今晚我 8 点准时开播。', createdAt: '昨天 19:50', isSelf: false },
			{ id: 5, fromId: 1, toId: 3, content: '收到，我去前排支持你。', createdAt: '昨天 19:55', isSelf: true },
		],
	},
	{
		uid: 4,
		messages: [
			{ id: 6, fromId: 4, toId: 1, content: '上次那个主播真的很会聊。', createdAt: '周二 20:11', isSelf: false },
			{ id: 7, fromId: 1, toId: 4, content: '是啊，而且礼物反馈也很快。', createdAt: '周二 20:12', isSelf: true },
		],
	},
]

export const mockLiveRooms: LiveRoomDetail[] = [
	{
		roomId: 9001,
		anchorId: 101,
		anchorName: '阿宁',
		anchorAvatar: '/static/logo.png',
		liveTitle: '夜色慢慢唱',
		streamUrl: 'http://localhost:18080/live/dev.flv',
		onlineCount: 1420,
		roomNotice: '欢迎来到阿宁直播间，文明聊天，禁止引战。',
		allowGift: true,
		allowReward: true,
	},
	{
		roomId: 9002,
		anchorId: 102,
		anchorName: '莓莓',
		anchorAvatar: '/static/logo.png',
		liveTitle: '换一首心情歌',
		streamUrl: 'http://localhost:18080/live/dev.flv',
		onlineCount: 960,
		roomNotice: '今天有点小互动，记得先问好。',
		allowGift: true,
		allowReward: false,
	},
	{
		roomId: 9004,
		anchorId: 104,
		anchorName: 'Yoyo',
		anchorAvatar: '/static/logo.png',
		liveTitle: '今晚一起选战袍',
		streamUrl: 'http://localhost:18080/live/dev.flv',
		onlineCount: 521,
		roomNotice: '今晚以轻松聊天为主，欢迎来聊穿搭。',
		allowGift: true,
		allowReward: true,
	},
	{
		roomId: 9005,
		anchorId: 105,
		anchorName: '阿泽',
		anchorAvatar: '/static/logo.png',
		liveTitle: '深夜聊点有趣的',
		streamUrl: 'http://localhost:18080/live/dev.flv',
		onlineCount: 688,
		roomNotice: '轻松连麦，理性聊天，欢迎点歌。',
		allowGift: true,
		allowReward: true,
	},
	{
		roomId: 9006,
		anchorId: 106,
		anchorName: 'Luna',
		anchorAvatar: '/static/logo.png',
		liveTitle: '第一次夜聊见面会',
		streamUrl: 'http://localhost:18080/live/dev.flv',
		onlineCount: 233,
		roomNotice: '欢迎来认识一下，今天主打轻松陪伴。',
		allowGift: true,
		allowReward: false,
	},
]

export const mockLiveMessages: LiveMessage[] = [
	{ id: 1, senderName: '小赞', content: '主播晚上好。', createdAt: '19:21' },
	{ id: 2, senderName: '路人甲', content: '今天的歌单太舒服了。', createdAt: '19:22' },
	{ id: 3, senderName: '阿泽', content: '求下一首慢歌。', createdAt: '19:24' },
]

export const mockBalance: WalletBalance = {
	balance: 1280,
	currencyName: '金币',
	freezeBalance: 0,
}

export const mockRechargeAmountOptions: RechargeAmountOption[] = [
	{ id: 1, amount: 50, bonusText: '+5' },
	{ id: 2, amount: 100, bonusText: '+12' },
	{ id: 3, amount: 200, bonusText: '+30' },
	{ id: 4, amount: 500, bonusText: '+90' },
	{ id: 5, amount: 1000, bonusText: '+220' },
	{ id: 6, amount: 2000, bonusText: '+520' },
	{ id: 7, amount: 10000, bonusText: '+1314' },
]

export const mockRechargePaymentMethods: RechargePaymentMethod[] = [
	{ code: 'visa', name: 'Visa', description: 'International card payment' },
	{ code: 'mastercard', name: 'Mastercard', description: 'Global card payment' },
	{ code: 'grabpay', name: 'GrabPay', description: 'Wallet payment for Southeast Asia' },
	{ code: 'dana', name: 'Dana', description: 'Indonesia e-wallet payment' },
	{ code: 'gopay', name: 'GoPay', description: 'GoTo wallet payment' },
	{ code: 'tt', name: 'TT', description: 'Telegraphic transfer remittance' },
	{ code: 'usdt', name: 'USDT', description: 'Stablecoin wallet transfer' },
]

let mockWalletBalanceValue = mockBalance.balance

function createMockWalletBalanceSnapshot(): WalletBalance {
	return {
		balance: mockWalletBalanceValue,
		currencyName: mockBalance.currencyName,
		freezeBalance: mockBalance.freezeBalance,
	}
}

export function getMockWalletBalance(): WalletBalance {
	return createMockWalletBalanceSnapshot()
}

export function consumeMockWalletBalance(amount: number): WalletBalance | null {
	if (amount < 0) {
		return createMockWalletBalanceSnapshot()
	}
	if (mockWalletBalanceValue < amount) {
		return null
	}
	mockWalletBalanceValue = mockWalletBalanceValue - amount
	return createMockWalletBalanceSnapshot()
}

export const mockGiftList: GiftItem[] = [
	{ giftId: 1, name: '星光', icon: '/static/logo.png', price: 1 },
	{ giftId: 2, name: 'angel', icon: '/static/logo.png', price: 2 },
	{ giftId: 3, name: '烟火', icon: '/static/logo.png', price: 3 },
]

export function getMockGiftList(): GiftItem[] {
	const list: GiftItem[] = []
	for (let i = 0; i < mockGiftList.length; i++) {
		const item = mockGiftList[i]
		list.push({
			giftId: item.giftId,
			name: item.name,
			icon: item.icon,
			price: item.price,
		})
	}
	return list
}

export function getMockGiftById(giftId: number): GiftItem | null {
	for (let i = 0; i < mockGiftList.length; i++) {
		const item = mockGiftList[i]
		if (item.giftId == giftId) {
			return {
				giftId: item.giftId,
				name: item.name,
				icon: item.icon,
				price: item.price,
			}
		}
	}
	return null
}

export type GiftEffectMockPreset = {
	giftId: number
	effectMode: string
	themeKey: string
	badgeText: string
	headlineText: string
	subtitleText: string
	durationMs: number
	svgaSource: string
}

export const mockGiftEffectPresets: GiftEffectMockPreset[] = [
	{
		giftId: 1,
		effectMode: 'banner',
		themeKey: 'sky',
		badgeText: 'LIGHT GIFT',
		headlineText: '小礼物点亮直播间',
		subtitleText: '适合热场和轻互动，先把气氛拉起来。',
		durationMs: 1800,
		svgaSource: '',
	},
	{
		giftId: 2,
		effectMode: 'svga',
		themeKey: 'rose',
		badgeText: 'SPOTLIGHT',
		headlineText: '全屏礼物降临',
		subtitleText: '玫瑰雨已经接管舞台，主播和观众都会第一时间看到。',
		durationMs: 2600,
		svgaSource: 'https://localhost:13729/down/LhEP70qS10ia.svga',
	},
	{
		giftId: 3,
		effectMode: 'svga',
		themeKey: 'gold',
		badgeText: 'HEADLINE MOMENT',
		headlineText: '高能大礼物爆发',
		subtitleText: '整屏高亮展示，适合作为大礼物的第一版 mock 特效。',
		durationMs: 3000,
		svgaSource: '/static/svga/angel.svga',
	},
]

export const mockGiftRecords: WalletRecord[] = [
	{ id: 1, title: '送给 阿宁 · 玫瑰', amount: -66, time: '今天 20:10', type: 'gift' },
	{ id: 2, title: '送给 莓莓 · 星光 x2', amount: -20, time: '昨天 22:17', type: 'gift' },
]

export const mockRewardRecords: WalletRecord[] = [
	{ id: 11, title: '打赏 阿宁', amount: -88, time: '今天 20:32', type: 'reward' },
	{ id: 12, title: '打赏 Yoyo', amount: -120, time: '周二 21:48', type: 'reward' },
]

export function getUserById(id: number): UserProfile | null {
	for (let i = 0; i < mockUsers.length; i++) {
		const user = mockUsers[i]
		if (user.id == id) {
			return user
		}
	}
	return null
}

export function getChatMessages(uid: number): ChatMessage[] {
	for (let i = 0; i < mockChatThreads.length; i++) {
		const thread = mockChatThreads[i]
		if (thread.uid == uid) {
			return thread.messages
		}
	}
	return []
}

export function getLiveRoomById(roomId: number): LiveRoomDetail | null {
	for (let i = 0; i < mockLiveRooms.length; i++) {
		const room = mockLiveRooms[i]
		if (room.roomId == roomId) {
			return room
		}
	}
	return null
}
