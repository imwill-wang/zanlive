<template>
	<view class="room-page" :key="localeVersion">
		<view class="room-live-stage">
			<WebVideoPlayer
				v-if="showNativePlayer"
				class="room-live-player"
				:reload-key="playerReloadKey"
				:src="roomStreamText"
				:autoplay="true"
				:muted="false"
				:standby-mode="shouldHidePlayerFrame()"
				:controls="false"
				object-fit="cover"
				@play="handleVideoPlay"
				@waiting="handleVideoWaiting"
				@stalled="handleVideoStalled"
				@stats="handleVideoStats"
				@error="handleVideoError"
			/>
			<view v-if="!showNativePlayer" class="room-player-offline-base"></view>

			<view v-if="shouldShowPlayerOverlay()" :class="resolvePlayerBackdropClass()"></view>
			<view v-if="shouldShowPlayerOverlay()" class="room-player-status-overlay" :style="resolvePlayerStatusOverlayStyle()">
				<view class="room-player-status-card">
					<text class="room-player-status-badge">{{ playerStatusText }}</text>
					<text class="room-player-status-title">{{ playerHeadlineText }}</text>
					<text class="room-player-status-desc">{{ playerHintText }}</text>
					<view v-if="shouldShowPlayerReconnect()" class="room-player-refresh-button" @tap="refreshStreamPlayback">
						<text class="room-player-refresh-text">{{ streamRefreshText }}</text>
					</view>
				</view>
			</view>

			<RoomTopBar
				:top-safe-offset="topSafeOffset"
				:anchor-avatar="anchorAvatar"
				:anchor-name="anchorName"
				:room-title="roomTitle"
				:is-following="isFollowing"
				:follow-button-text="currentFollowButtonText"
				:follow-loading="followLoading"
				:top-audience-avatars="topAudienceAvatars"
				:room-online-count="roomOnlineCount"
				@toggle-follow="toggleFollow"
				@tap-ranking="openRankingPanel"
				@open-anchor-detail="openAnchorDetail"
				@close="goBack"
			/>

			<RoomPublicMessagePanel
				:title="publicMessagesTitle"
				:combo-text="comboText"
				:message-list="messageList"
				:scroll-into-view="messageScrollIntoView"
				:bottom-anchor-id="messageBottomAnchorId"
				:bottom-spacer-height="messageBottomSpacerHeight"
				:bottom="messageLayerBottom"
				:empty-text="activityEmptyText"
			/>

			<view v-if="actionMessage.length > 0" class="room-action-feedback" :style="'bottom:' + actionFeedbackBottom + 'px;'">
				<text class="room-action-feedback-text">{{ actionMessage }}</text>
			</view>

			<RoomBottomActionBar
				:model-value="draftMessage"
				:placeholder="messagePlaceholder"
				:send-text="sendText"
				:sending-text="sendingText"
				:gift-panel-text="giftPanelText"
				:bottom="bottomBarBottom"
				:render-key="bottomBarRenderKey"
				:submit-enabled="canSubmitMessage()"
				:submitting="messageSending"
				@update:model-value="updateDraftMessage"
				@submit-message="submitMessage"
				@open-gift-panel="openGiftPanel"
			/>

			<view v-if="showGiftEffect" class="room-effect-layer">
				<view class="room-effect-card">
					<image class="room-effect-icon" :src="effectGiftIcon" mode="aspectFill"></image>
					<view class="room-effect-copy">
						<text class="room-effect-kicker">{{ effectTitle }}</text>
						<text class="room-effect-title">{{ effectGiftName }}</text>
						<text class="room-effect-meta">{{ effectGiftQuantityText }} · {{ effectGiftComboText }}</text>
					</view>
				</view>
			</view>

			<view v-if="showFullscreenGiftEffect" class="room-fullscreen-effect-layer">
				<view :class="'room-fullscreen-effect-shell ' + fullscreenGiftStageClass">
					<view v-if="!fullscreenGiftUsesSvga" :class="fullscreenGiftBackdropThemeClass"></view>
					<view v-if="!fullscreenGiftUsesSvga" :class="fullscreenGiftGlowThemeClass"></view>
					<view v-if="showSvgaGiftEffect" class="room-svga-effect-player-shell">
						<c-svga
							class="room-svga-effect-player"
							width="100%"
							height="100%"
							:src="svgaGiftSource"
							:loops="1"
							:auto-play="true"
							@finished="handleSvgaGiftFinished"
						></c-svga>
					</view>
				<view v-if="!fullscreenGiftUsesSvga" :class="fullscreenGiftCardThemeClass">
					<text class="room-fullscreen-effect-headline">{{ fullscreenGiftHeadlineText }}</text>
					<image class="room-fullscreen-effect-icon" :src="fullscreenGiftIcon" mode="aspectFill"></image>
						<text class="room-fullscreen-effect-name">{{ fullscreenGiftNameText }}</text>
						<text class="room-fullscreen-effect-meta">{{ fullscreenGiftQuantityText }} · {{ fullscreenGiftComboText }}</text>
						<text class="room-fullscreen-effect-subtitle">{{ fullscreenGiftSubtitleText }}</text>
						<text class="room-fullscreen-effect-sender">{{ fullscreenGiftSenderText }}</text>
					</view>
				</view>
			</view>

			<view v-if="showGiftPanel" class="room-modal-mask" @tap="closeGiftPanel"></view>
			<view v-if="showGiftPanel" :key="giftPanelRenderKey" class="room-gift-panel">
				<view class="room-gift-balance-row">
					<view class="room-gift-balance-copy">
						<text class="room-gift-balance-label">{{ balanceLabelText }}</text>
						<text class="room-gift-balance-value">{{ balanceText }}</text>
					</view>
					<view class="room-recharge-button" @tap="openRecharge">
						<text class="room-recharge-button-text">{{ rechargeText }}</text>
					</view>
				</view>
				<scroll-view class="room-gift-panel-scroll" :scroll-y="true">
					<view class="room-gift-grid">
						<view v-for="gift in giftList" :key="gift.giftId" :class="gift.giftId == selectedGiftId ? 'room-gift-item-active' : 'room-gift-item'" @tap="selectGift(gift.giftId)">
							<image class="room-gift-icon" :src="gift.icon" mode="aspectFill"></image>
							<text v-if="gift.giftId != selectedGiftId" class="room-gift-name">{{ gift.name }}</text>
							<text class="room-gift-price">{{ gift.price }} {{ currencyName }}</text>
							<view v-if="gift.giftId == selectedGiftId" class="room-gift-item-action" @tap.stop="sendSelectedGift">
								<text class="room-gift-item-action-text">{{ sendText }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<RoomRankingPanel
				:visible="showRankingPanel"
				:loading="rankingLoading"
				:title="rankingTitle"
				:loading-text="rankingLoadingText"
				:empty-text="rankingEmptyText"
				:score-label="rankingScoreLabel"
				:items="rankingList"
				@close="closeRankingPanel"
			/>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
	import { nextTick, ref } from 'vue'
	import RoomBottomActionBar from '../../components/live/RoomBottomActionBar.vue'
	import RoomPublicMessagePanel from '../../components/live/RoomPublicMessagePanel.vue'
	import RoomRankingPanel from '../../components/live/RoomRankingPanel.vue'
	import RoomTopBar from '../../components/live/RoomTopBar.vue'
	import WebVideoPlayer from '../../components/live/WebVideoPlayer.vue'
	import { getCurrencyName, getRechargeRoute, i18nStore, t } from '../../store/i18n'
	import { followAnchor, getAnchorFollowState, readCachedAnchorFollowState, unfollowAnchor } from '../../services/friend'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import { closeLiveMessageChannel, openLiveMessageChannel, type LiveMessageChannelStatus } from '../../services/message'
	import { enterRoom, getLiveMessages, getLiveRoomRanking, leaveRoom, sendLiveMessage, sendRoomGift } from '../../services/live'
	import { getBalance, getGiftList } from '../../services/wallet'
	import type { LiveGiftEvent, LiveMessage, LiveRoomDetail, LiveRoomRankingItem } from '../../types/live'
	import type { GiftItem } from '../../types/wallet'

	type LargeGiftEffectItem = {
		id: number
		giftName: string
		giftIcon: string
		quantity: number
		comboCount: number
		headlineText: string
		subtitleText: string
		senderText: string
		themeKey: string
		durationMs: number
		effectMode: string
		svgaSource: string
	}

	type GiftEffectPreset = {
		giftId: number
		headlineText: string
		subtitleText: string
		themeKey: string
		durationMs: number
		effectMode: string
		svgaSource: string
	}

	function normalizeGiftType(type: string | undefined): string {
		if (type == null) {
			return ''
		}
		return type.trim().toUpperCase()
	}

	function isSvgaResource(resource: string | undefined): boolean {
		if (resource == null || resource.length == 0) {
			return false
		}
		const normalized = resource.split('?')[0].toLowerCase()
		return normalized.endsWith('.svga')
	}

	function resolveGiftThemeKey(gift: GiftItem): string {
		if (gift.price >= 100) {
			return 'gold'
		}
		if (gift.price >= 20) {
			return 'sky'
		}
		return 'rose'
	}

	function resolveGiftEffectMode(gift: GiftItem): string {
		const normalizedType = normalizeGiftType(gift.type)
		if ((normalizedType == 'SVGA' || isSvgaResource(gift.resource)) && gift.resource != null && gift.resource.length > 0) {
			return 'svga'
		}
		if (gift.price >= 20) {
			return 'fullscreen'
		}
		return 'banner'
	}

	function buildGiftEffectPreset(gift: GiftItem): GiftEffectPreset {
		const effectMode = resolveGiftEffectMode(gift)
		const isSvga = effectMode == 'svga'
		const isFullscreen = effectMode == 'fullscreen' || isSvga
		return {
			giftId: gift.giftId,
			headlineText: isFullscreen ? localizedText('全屏礼物登场', 'Featured gift is here') : localizedText('礼物特效', 'Gift effect'),
			subtitleText: isFullscreen ? localizedText('直播间一起收到礼物反馈', 'The whole room receives this gift effect') : localizedText('礼物已送达直播间', 'Gift has been delivered to the room'),
			themeKey: resolveGiftThemeKey(gift),
			durationMs: isFullscreen ? 2600 : 1600,
			effectMode,
			svgaSource: isSvga && gift.resource != null ? gift.resource : '',
		}
	}

	type PlayerUiState = 'loading' | 'ready' | 'connecting' | 'poor_network' | 'no_stream' | 'failed' | 'unsupported' | 'playing'

	const localeVersion = ref(0)
	const liveText = ref('')
	const onlineText = ref('')
	const followText = ref('')
	const followingText = ref('')
	const currentFollowButtonText = ref('')
	const publicMessagesTitle = ref('')
	const rankingTitle = ref('')
	const rankingLoadingText = ref('')
	const rankingEmptyText = ref('')
	const rankingScoreLabel = ref('')
	const messagePlaceholder = ref('')
	const effectTitle = ref('')
	const panelTitle = ref('')
	const panelSubtitle = ref('')
	const closeText = ref('')
	const streamRefreshText = ref('')
	const giftPanelText = ref('')
	const sendText = ref('')
	const sendingText = ref('')
	const activityEmptyText = ref('')
	const balanceLabelText = ref('')
	const rechargeText = ref('')
	const playerStatusText = ref('')
	const playerHeadlineText = ref('')
	const playerHintText = ref('')
	const messageBottomAnchorId = 'room-message-bottom-anchor'
	const messageBottomSpacerHeight = ref(12)
	const topSafeOffset = ref(14)
	const messageLayerBottom = ref(76)
	const actionFeedbackBottom = ref(172)
	const bottomBarBottom = ref(20)

	const roomId = ref(0)
	const roomInviteCode = ref('')
	const anchorId = ref(0)
	const anchorName = ref('Host')
	const anchorAvatar = ref('/static/logo.png')
	const roomTitle = ref('Live Room')
	const roomOnlineCount = ref(0)
	const roomStreamText = ref('mock://stream')
	const balanceText = ref('0 Coins')
	const currencyName = ref('Coins')
	const bottomBarRenderKey = ref(0)
	const giftPanelRenderKey = ref(0)
	const selectedGiftId = ref(0)
	const selectedGiftName = ref('No gift selected')
	const selectedGiftIcon = ref('/static/logo.png')
	const selectedGiftPrice = ref(0)
	const selectedGiftTotalText = ref('0 Coins')
	const giftList = ref<GiftItem[]>([])
	const giftQuantity = ref(1)
	const messageList = ref<LiveMessage[]>([])
	const messageScrollIntoView = ref('')
	const showGiftPanel = ref(false)
	const actionMessage = ref('')
	const comboText = ref('')
	const comboGiftId = ref(0)
	const comboCount = ref(0)
	const comboDeadline = ref(0)
	const messageSending = ref(false)
	const showGiftEffect = ref(false)
	const effectGiftName = ref('')
	const effectGiftIcon = ref('/static/logo.png')
	const effectGiftQuantityText = ref('')
	const effectGiftComboText = ref('')
	const showSvgaGiftEffect = ref(false)
	const fullscreenGiftUsesSvga = ref(false)
	const svgaGiftSource = ref('')
	const showFullscreenGiftEffect = ref(false)
	const fullscreenGiftStageClass = ref('room-fullscreen-effect-shell-enter')
	const fullscreenGiftCardThemeClass = ref('room-fullscreen-effect-card room-fullscreen-effect-card-rose')
	const fullscreenGiftGlowThemeClass = ref('room-fullscreen-effect-glow room-fullscreen-effect-glow-rose')
	const fullscreenGiftBackdropThemeClass = ref('room-fullscreen-effect-backdrop room-fullscreen-effect-backdrop-rose')
	const fullscreenGiftHeadlineText = ref('')
	const fullscreenGiftNameText = ref('')
	const fullscreenGiftIcon = ref('/static/logo.png')
	const fullscreenGiftQuantityText = ref('')
	const fullscreenGiftComboText = ref('')
	const fullscreenGiftSubtitleText = ref('')
	const fullscreenGiftSenderText = ref('')
	const largeGiftQueue = ref<LargeGiftEffectItem[]>([])
	const draftMessage = ref('')
	const allowGift = ref(true)
	const allowMessage = ref(true)
	const roomLoading = ref(true)
	const roomErrorMessage = ref('')
	const playerPlatformSupported = ref(false)
	const showNativePlayer = ref(false)
	const playerUiState = ref<PlayerUiState>('loading')
	const playerReloadKey = ref(0)
	const playerStateCode = ref(0)
	const playerErrorMessage = ref('')
	const playerHasStarted = ref(false)
	const playerBufferingActive = ref(false)
	const playerLowSpeedSamples = ref(0)
	const playerMeasuredSpeedKbps = ref(0)
	const streamUrlOverride = ref('')
	const playerCodec = ref('software')
	const playerPlayStrategy = ref(0)
	const isFollowing = ref(false)
	const followLoading = ref(false)
	const topAudienceAvatars = ref<string[]>(['/static/logo.png', '/static/logo.png', '/static/logo.png'])
	const rankingList = ref<LiveRoomRankingItem[]>([])
	const rankingLoading = ref(false)
	const showRankingPanel = ref(false)
	const messageChannelStatus = ref<LiveMessageChannelStatus>('idle')
	const playerLowSpeedThreshold = 120
	const playerRecoverSpeedThreshold = 220
	const playerPoorNetworkSampleCount = 2
	const playerBufferingWindowMs = 6000
	const playerPoorNetworkHoldMs = 9000
	let comboHintVersion = 0
	let comboClearTimer = 0
	let largeGiftPlaying = false
	let currentLargeGiftEffect: LargeGiftEffectItem | null = null
	let dispatchLargeGiftEffect: (item: LargeGiftEffectItem) => void = (_item: LargeGiftEffectItem): void => {}
	let giftEffectHideTimer = 0
	let messageScrollTimer = 0
	let fullscreenGiftEnterTimer = 0
	let fullscreenGiftPlayTimer = 0
	let fullscreenGiftHideTimer = 0
	let roomActivityPollTimer = 0
	let rankingRefreshTimer = 0
	let lastSeenMessageId = 0
	let lastSeenGiftEventId = 0
	let playerBufferingWindowStartedAt = 0
	let playerBufferingWindowCount = 0
	let playerPoorNetworkHoldUntil = 0

	function localizedText(zhHans: string, en: string): string {
		if (i18nStore.locale == 'zh-Hans' || i18nStore.locale == 'zh-Hant') {
			return zhHans
		}
		return en
	}

	function resetPlayerRuntimeState(): void {
		playerUiState.value = 'loading'
		playerStateCode.value = 0
		playerErrorMessage.value = ''
		playerHasStarted.value = false
		playerBufferingActive.value = false
		playerLowSpeedSamples.value = 0
		playerMeasuredSpeedKbps.value = 0
		playerBufferingWindowStartedAt = 0
		playerBufferingWindowCount = 0
		playerPoorNetworkHoldUntil = 0
	}

	function markPlayerPoorNetwork(): void {
		playerPoorNetworkHoldUntil = Date.now() + playerPoorNetworkHoldMs
	}

	function isPlayerPoorNetwork(): boolean {
		return playerLowSpeedSamples.value >= playerPoorNetworkSampleCount || Date.now() < playerPoorNetworkHoldUntil
	}

	function recordPlayerBufferingSignal(): void {
		const now = Date.now()
		if (playerBufferingWindowStartedAt == 0 || now - playerBufferingWindowStartedAt > playerBufferingWindowMs) {
			playerBufferingWindowStartedAt = now
			playerBufferingWindowCount = 1
		} else {
			playerBufferingWindowCount = playerBufferingWindowCount + 1
		}
		if (playerBufferingWindowCount >= 2) {
			markPlayerPoorNetwork()
		}
	}

	function resolvePoorNetworkHint(): string {
		return localizedText('当前网络较弱，播放器正在尝试维持直播画面。', 'Network is weak. The player is trying to keep the live stream stable.')
	}

	function applyPlayerStatus(state: PlayerUiState, badge: string, headline: string, hint: string): void {
		playerUiState.value = state
		playerStatusText.value = badge
		playerHeadlineText.value = headline
		playerHintText.value = hint
	}

	function shouldShowPlayerOverlay(): boolean {
		return playerUiState.value != 'playing'
	}

	function shouldShowPlayerReconnect(): boolean {
		return playerUiState.value == 'no_stream' || playerUiState.value == 'failed'
	}

	function shouldHidePlayerFrame(): boolean {
		return playerUiState.value == 'no_stream' || playerUiState.value == 'failed' || playerUiState.value == 'unsupported'
	}

	function resolvePlayerBackdropClass(): string {
		if (shouldHidePlayerFrame()) {
			return 'room-player-backdrop-shade room-player-backdrop-shade-black'
		}
		return 'room-player-backdrop-shade room-player-backdrop-shade-blur'
	}

	function resolvePlayerStatusOverlayStyle(): string {
		if (!shouldShowPlayerReconnect()) {
			return ''
		}
		const offsetTop = topSafeOffset.value + 84
		return 'justify-content:flex-start;padding-top:' + offsetTop.toString() + 'px;'
	}

	function syncSafeAreaLayout(): void {
		const systemInfo = uni.getSystemInfoSync()
		const statusBarHeight = systemInfo.statusBarHeight != null ? systemInfo.statusBarHeight : 0
		let safeBottom = 0
		const safeAreaInsets = (systemInfo as any).safeAreaInsets
		if (safeAreaInsets != null && typeof safeAreaInsets.bottom == 'number') {
			safeBottom = safeAreaInsets.bottom
		}
		topSafeOffset.value = statusBarHeight + 2
		const bottomBarBottomGap = 10
		const bottomBarRow = 56
		const publicScreenGapAboveBar = 10
		bottomBarBottom.value = safeBottom + bottomBarBottomGap
		messageLayerBottom.value = safeBottom + bottomBarBottomGap + bottomBarRow + publicScreenGapAboveBar
		actionFeedbackBottom.value = messageLayerBottom.value + 96
		messageBottomSpacerHeight.value = 12
	}

	function canSubmitMessage(): boolean {
		return allowMessage.value && !messageSending.value && draftMessage.value.trim().length > 0
	}

	function clearTimer(timerId: number): number {
		if (timerId > 0) {
			clearTimeout(timerId)
		}
		return 0
	}

	function clearFullscreenGiftTimers(): void {
		fullscreenGiftEnterTimer = clearTimer(fullscreenGiftEnterTimer)
		fullscreenGiftPlayTimer = clearTimer(fullscreenGiftPlayTimer)
		fullscreenGiftHideTimer = clearTimer(fullscreenGiftHideTimer)
	}

	function cloneGiftItem(source: GiftItem): GiftItem {
		return {
			giftId: source.giftId,
			name: source.name,
			icon: source.icon,
			price: source.price,
			type: source.type,
			resource: source.resource,
		}
	}

	function getGiftEffectPreset(giftId: number): GiftEffectPreset | null {
		const gift = getSelectedGift()
		if (gift != null && gift.giftId == giftId) {
			return buildGiftEffectPreset(gift)
		}
		for (let i = 0; i < giftList.value.length; i++) {
			const item = giftList.value[i]
			if (item.giftId == giftId) {
				return buildGiftEffectPreset(item)
			}
		}
		return null
	}

	function isLargeGiftEffectMode(effectMode: string): boolean {
		return effectMode == 'svga' || effectMode == 'fullscreen'
	}

	function normalizeGiftList(source: GiftItem[]): GiftItem[] {
		const list: GiftItem[] = []
		for (let i = 0; i < source.length; i++) {
			const item = source[i]
			list.push({
				giftId: item.giftId,
				name: item.name,
				icon: item.icon.length > 0 ? item.icon : '/static/logo.png',
				price: item.price,
				type: item.type,
				resource: item.resource,
			})
		}
		return list
	}

	function applyFullscreenGiftTheme(themeKey: string): void {
		let resolvedTheme = 'rose'
		if (themeKey == 'gold') {
			resolvedTheme = 'gold'
		}
		if (themeKey == 'sky') {
			resolvedTheme = 'sky'
		}
		fullscreenGiftCardThemeClass.value = 'room-fullscreen-effect-card room-fullscreen-effect-card-' + resolvedTheme
		fullscreenGiftGlowThemeClass.value = 'room-fullscreen-effect-glow room-fullscreen-effect-glow-' + resolvedTheme
		fullscreenGiftBackdropThemeClass.value = 'room-fullscreen-effect-backdrop room-fullscreen-effect-backdrop-' + resolvedTheme
	}

	function createLargeGiftEffectItem(gift: GiftItem, quantity: number, comboCountValue: number, preset: GiftEffectPreset, senderName: string): LargeGiftEffectItem {
		const resolvedSenderName = senderName.length > 0 ? senderName : t('common.defaultMember')
		return {
			id: Date.now(),
			giftName: gift.name,
			giftIcon: gift.icon,
			quantity,
			comboCount: comboCountValue,
			headlineText: preset.headlineText,
			subtitleText: preset.subtitleText,
			senderText: localizedText('来自 ' + resolvedSenderName + ' 的全屏礼物 · ' + anchorName.value, 'Featured gift from ' + resolvedSenderName + ' · ' + anchorName.value),
			themeKey: preset.themeKey,
			durationMs: preset.durationMs,
			effectMode: preset.svgaSource.length > 0 ? 'svga' : preset.effectMode,
			svgaSource: preset.svgaSource,
		}
	}

	function dispatchQueuedLargeGiftEffect(): void {
		if (largeGiftQueue.value.length == 0) {
			return
		}
		const nextEffect = largeGiftQueue.value[0]
		largeGiftQueue.value = largeGiftQueue.value.slice(1)
		currentLargeGiftEffect = nextEffect
		largeGiftPlaying = true
		dispatchLargeGiftEffect(nextEffect)
	}

	function hideSvgaGiftEffect(): void {
		showSvgaGiftEffect.value = false
		svgaGiftSource.value = ''
	}

	function showSvgaGiftEffectByItem(item: LargeGiftEffectItem): void {
		if (item.svgaSource.length == 0) {
			hideSvgaGiftEffect()
			return
		}
		fullscreenGiftUsesSvga.value = true
		svgaGiftSource.value = item.svgaSource
		showSvgaGiftEffect.value = true
	}

	function handleSvgaGiftFinished(): void {
		hideSvgaGiftEffect()
	}

	function playFullscreenGiftEffect(item: LargeGiftEffectItem): void {
		clearFullscreenGiftTimers()
		applyFullscreenGiftTheme(item.themeKey)
		fullscreenGiftUsesSvga.value = item.effectMode == 'svga' && item.svgaSource.length > 0
		if (item.effectMode == 'svga' && item.svgaSource.length > 0) {
			showSvgaGiftEffectByItem(item)
		} else {
			fullscreenGiftUsesSvga.value = false
			hideSvgaGiftEffect()
		}
		fullscreenGiftHeadlineText.value = item.headlineText
		fullscreenGiftNameText.value = item.giftName
		fullscreenGiftIcon.value = item.giftIcon
		fullscreenGiftQuantityText.value = 'x' + item.quantity.toString()
		fullscreenGiftComboText.value = 'combo x' + item.comboCount.toString()
		fullscreenGiftSubtitleText.value = item.subtitleText
		fullscreenGiftSenderText.value = item.senderText
		fullscreenGiftStageClass.value = 'room-fullscreen-effect-shell-enter'
		showFullscreenGiftEffect.value = true
		fullscreenGiftEnterTimer = setTimeout(() => {
			fullscreenGiftStageClass.value = 'room-fullscreen-effect-shell-active'
		}, 80)
		fullscreenGiftPlayTimer = setTimeout(() => {
			fullscreenGiftStageClass.value = 'room-fullscreen-effect-shell-leave'
		}, item.durationMs)
		fullscreenGiftHideTimer = setTimeout(() => {
			showFullscreenGiftEffect.value = false
			fullscreenGiftStageClass.value = 'room-fullscreen-effect-shell-enter'
			fullscreenGiftUsesSvga.value = false
			hideSvgaGiftEffect()
			currentLargeGiftEffect = null
			largeGiftPlaying = false
			dispatchQueuedLargeGiftEffect()
		}, item.durationMs + 260)
	}

	function playNextLargeGiftEffect(): void {
		if (largeGiftPlaying || largeGiftQueue.value.length == 0) {
			return
		}
		dispatchQueuedLargeGiftEffect()
	}

	function enqueueLargeGiftEffect(item: LargeGiftEffectItem): void {
		largeGiftQueue.value = [...largeGiftQueue.value, item]
		playNextLargeGiftEffect()
	}

	dispatchLargeGiftEffect = (item: LargeGiftEffectItem): void => {
		playFullscreenGiftEffect(item)
	}

	function hasPlayableStreamUrl(): boolean {
		const url = roomStreamText.value
		if (url.length == 0) {
			return false
		}
		return url.indexOf('mock://') != 0
	}

	function resolveRoomStreamUrl(defaultUrl: string): string {
		if (streamUrlOverride.value.length > 0) {
			return streamUrlOverride.value
		}
		return defaultUrl
	}

	function resolvePlayerCodec(value: string | null): string {
		if (value == 'hardware') {
			return 'hardware'
		}
		return 'software'
	}

	function resolvePlayerPlayStrategy(value: string | null): number {
		if (value == null) {
			return 0
		}
		const parsed = parseInt(value, 10)
		if (parsed == 1) {
			return 1
		}
		if (parsed == 2) {
			return 2
		}
		return 0
	}

	function syncPlayerVisibility(): void {
		const hasStream = hasPlayableStreamUrl()
		showNativePlayer.value = playerPlatformSupported.value && !roomLoading.value && roomErrorMessage.value.length == 0 && hasStream && playerErrorMessage.value.length == 0
	}

	function syncPlayerFeedback(): void {
		syncPlayerVisibility()
		if (roomLoading.value) {
			applyPlayerStatus('loading', localizedText('加载中', 'Loading'), localizedText('正在拉取直播间信息', 'Loading live room details'), localizedText('先确认房间状态和直播地址，再尝试播放。', 'Checking room state and stream url before playback.'))
			return
		}
		if (roomErrorMessage.value.length > 0) {
			applyPlayerStatus('failed', localizedText('播放失败', 'Playback failed'), roomErrorMessage.value, localizedText('暂时无法连接直播间，请尝试重新连接。', 'Unable to connect to the live room. Please reconnect.'))
			return
		}
		if (!hasPlayableStreamUrl()) {
			applyPlayerStatus('no_stream', localizedText('无流', 'No stream'), t('live.anchorOffline'), localizedText('当前房间还没有可播放的直播流，请稍后重连。', 'This room does not have a playable live stream yet. Please reconnect later.'))
			return
		}
		if (!playerPlatformSupported.value) {
			applyPlayerStatus('unsupported', localizedText('平台受限', 'Unsupported'), localizedText('当前平台暂不支持直播播放', 'This platform does not support live playback'), localizedText('请在 H5 或 App 平台验证直播观看链路。', 'Use the H5 or App build to verify the live playback path.'))
			return
		}
		if (playerErrorMessage.value.length > 0) {
			applyPlayerStatus('failed', localizedText('播放失败', 'Playback failed'), localizedText('直播流暂时无法播放', 'The live stream is not playable yet'), playerErrorMessage.value)
			return
		}
		if (playerStateCode.value == 10004) {
			if (isPlayerPoorNetwork()) {
				applyPlayerStatus('poor_network', localizedText('网速低', 'Weak network'), localizedText('当前网络波动较大', 'The network is unstable right now'), resolvePoorNetworkHint())
				return
			}
			applyPlayerStatus('playing', localizedText('播放中', 'Playing'), roomTitle.value, localizedText('已连接到直播流，可继续观看与互动。', 'Connected to the live stream. Watching is ready.'))
			return
		}
		if (playerStateCode.value == 10002) {
			if (playerHasStarted.value || isPlayerPoorNetwork()) {
				applyPlayerStatus('poor_network', localizedText('网速低', 'Weak network'), localizedText('直播流正在缓冲恢复', 'The live stream is recovering from buffering'), resolvePoorNetworkHint())
				return
			}
			applyPlayerStatus('connecting', localizedText('连接中', 'Connecting'), localizedText('正在等待首帧画面', 'Waiting for the first frame'), localizedText('如果长时间没有画面，请确认主播已经开始推流。', 'If this takes too long, confirm the host has started pushing the stream.'))
			return
		}
		applyPlayerStatus('ready', localizedText('待播放', 'Ready'), localizedText('已拿到直播地址', 'Stream url received'), localizedText('播放器正在初始化，请稍候。', 'The player is initializing. Please wait a moment.'))
	}

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		liveText.value = t('common.live')
		onlineText.value = t('common.online')
		followText.value = t('common.follow')
		followingText.value = localizedText('已关注', 'Following')
		currentFollowButtonText.value = isFollowing.value ? followingText.value : followText.value
		publicMessagesTitle.value = t('room.publicMessages')
		rankingTitle.value = localizedText('互动榜', 'Live ranking')
		rankingLoadingText.value = localizedText('正在加载榜单...', 'Loading ranking...')
		rankingEmptyText.value = localizedText('暂无榜单数据', 'No ranking data yet')
		rankingScoreLabel.value = localizedText('总值', 'Score')
		messagePlaceholder.value = t('room.messagePlaceholder')
		effectTitle.value = t('room.effectTitle')
		panelTitle.value = t('room.panelTitle')
		panelSubtitle.value = t('room.panelSubtitle')
		closeText.value = t('common.close')
		streamRefreshText.value = localizedText('重连', 'Reconnect')
		giftPanelText.value = t('room.giftPanel')
		sendText.value = t('common.send')
		sendingText.value = localizedText('发送中', 'Sending')
		activityEmptyText.value = t('room.activityEmpty')
		balanceLabelText.value = t('wallet.availableBalance')
		rechargeText.value = t('wallet.recharge')
		currencyName.value = getCurrencyName()
		if (selectedGiftId.value > 0 && selectedGiftPrice.value > 0) {
			selectedGiftTotalText.value = (selectedGiftPrice.value * giftQuantity.value).toString() + ' ' + getCurrencyName()
		} else {
			selectedGiftName.value = t('room.selectedGiftNoneLabel')
			selectedGiftTotalText.value = '0 ' + getCurrencyName()
		}
		syncPlayerFeedback()
	}

	function syncTopAudienceAvatars(): void {
		const avatars: string[] = []
		for (let i = 0; i < rankingList.value.length; i++) {
			if (avatars.length >= 3) {
				break
			}
			const rankingItem = rankingList.value[i]
			if (rankingItem.anchorAvatar.length > 0) {
				avatars.push(rankingItem.anchorAvatar)
			}
		}
		if (avatars.length == 0 && anchorAvatar.value.length > 0) {
			avatars.push(anchorAvatar.value)
		}
		while (avatars.length < 3) {
			avatars.push(anchorAvatar.value.length > 0 ? anchorAvatar.value : '/static/logo.png')
		}
		topAudienceAvatars.value = avatars
	}

	async function loadFollowState(): Promise<void> {
		if (anchorId.value <= 0) {
			return
		}
		const state = await getAnchorFollowState(anchorId.value)
		isFollowing.value = state.isFollowing
		currentFollowButtonText.value = isFollowing.value ? followingText.value : followText.value
	}

	function syncCachedFollowState(): void {
		if (anchorId.value <= 0) {
			return
		}
		const cachedState = readCachedAnchorFollowState(anchorId.value)
		if (cachedState == null) {
			return
		}
		isFollowing.value = cachedState
		currentFollowButtonText.value = isFollowing.value ? followingText.value : followText.value
	}

	async function loadRankingData(): Promise<void> {
		rankingLoading.value = true
		try {
			rankingList.value = await getLiveRoomRanking(10)
		} finally {
			rankingLoading.value = false
			syncTopAudienceAvatars()
		}
	}

	function scheduleRankingRefresh(): void {
		rankingRefreshTimer = clearTimer(rankingRefreshTimer)
		rankingRefreshTimer = setTimeout(() => {
			loadRankingData()
			scheduleRankingRefresh()
		}, 30000)
	}

	function openRankingPanel(): void {
		showRankingPanel.value = true
	}

	function closeRankingPanel(): void {
		showRankingPanel.value = false
	}

	function updateDraftMessage(value: string): void {
		draftMessage.value = value
	}

	function applyMessageChannelStatus(status: LiveMessageChannelStatus): void {
		messageChannelStatus.value = status
		if (status == 'connected') {
			roomActivityPollTimer = clearTimer(roomActivityPollTimer)
		}
	}

	function scheduleMessageSync(delay: number = 3000): void {
		roomActivityPollTimer = clearTimer(roomActivityPollTimer)
		if (!allowMessage.value || messageChannelStatus.value == 'connected') {
			return
		}
		roomActivityPollTimer = setTimeout(() => {
			syncRoomMessages()
			scheduleMessageSync(delay)
		}, delay)
	}

	function syncRoomMessages(): void {
		if (roomId.value <= 0 || !allowMessage.value) {
			return
		}
		getLiveMessages(roomId.value).then((list) => {
			mergeIncomingMessages(list)
		})
	}

	function startLiveMessageChannel(room: LiveRoomDetail): void {
		if (!allowMessage.value) {
			applyMessageChannelStatus('idle')
			return
		}
		const opened = openLiveMessageChannel({
			roomId: room.roomId,
			joinToken: room.joinToken != null ? room.joinToken : '',
			socketUrl: room.socketUrl != null ? room.socketUrl : '',
			onStatusChange: (status) => {
				applyMessageChannelStatus(status)
			},
			onMessages: (messages) => {
				mergeIncomingMessages(messages)
			},
			onGiftEvents: (events) => {
				handleIncomingGiftEvents(events)
			},
			onFallback: () => {
				applyMessageChannelStatus('polling')
				scheduleMessageSync(1200)
			},
		})
		if (!opened) {
			applyMessageChannelStatus('polling')
			scheduleMessageSync(1200)
		}
	}

	function openGiftPanel(): void {
		uni.hideKeyboard()
		showGiftPanel.value = true
		nextTick(() => {
			setTimeout(() => {
				giftPanelRenderKey.value = giftPanelRenderKey.value + 1
			}, 20)
		})
	}

	function closeGiftPanel(): void {
		showGiftPanel.value = false
		uni.hideKeyboard()
		setTimeout(() => {
			bottomBarRenderKey.value = bottomBarRenderKey.value + 1
		}, 40)
	}

	function openRecharge(): void {
		uni.navigateTo({
			url: getRechargeRoute(),
		})
	}

	function updateBalanceText(balance: number): void {
		balanceText.value = balance.toString() + ' ' + getCurrencyName()
	}

	function resolveMessageAnchorId(messageId: number): string {
		return 'room-message-' + messageId.toString()
	}

	function scrollToLatestMessage(): void {
		messageScrollTimer = clearTimer(messageScrollTimer)
		if (messageList.value.length == 0) {
			messageScrollIntoView.value = messageBottomAnchorId
			return
		}
		messageScrollIntoView.value = ''
		nextTick(() => {
			messageScrollTimer = setTimeout(() => {
				messageScrollIntoView.value = messageBottomAnchorId
			}, 20)
		})
	}

	function updateMessageList(list: LiveMessage[]): void {
		messageList.value = list
		if (list.length > 0) {
			lastSeenMessageId = list[list.length - 1].id
		}
		scrollToLatestMessage()
	}

	function mergeIncomingMessages(list: LiveMessage[]): void {
		if (list.length == 0) {
			return
		}
		const currentIds: Record<number, boolean> = {}
		for (let i = 0; i < messageList.value.length; i++) {
			currentIds[messageList.value[i].id] = true
		}
		const merged = [...messageList.value]
		for (let i = 0; i < list.length; i++) {
			const item = list[i]
			if (!currentIds[item.id]) {
				merged.push(item)
				currentIds[item.id] = true
			}
			if (item.id > lastSeenMessageId) {
				lastSeenMessageId = item.id
			}
		}
		updateMessageList(merged.slice(Math.max(0, merged.length - 80)))
	}

	function playIncomingGiftEvent(event: LiveGiftEvent): void {
		if (event.id <= lastSeenGiftEventId) {
			return
		}
		lastSeenGiftEventId = event.id
		const gift: GiftItem = {
			giftId: event.giftId,
			name: event.giftName,
			icon: event.giftIcon,
			price: 0,
			type: event.giftType,
			resource: event.resource,
		}
		showGiftEffectPresentation(gift, event.quantity, event.comboCount, event.senderName)
	}

	function buildGiftBroadcastText(senderName: string, giftName: string, quantity: number, comboCount: number): string {
		let text = senderName + ' ' + t('common.send') + ' ' + giftName + ' x' + quantity.toString()
		if (comboCount > quantity) {
			text = text + ' · combo x' + comboCount.toString()
		}
		return text
	}

	function handleIncomingGiftEvents(events: LiveGiftEvent[]): void {
		if (events.length == 0) {
			return
		}
		for (let i = 0; i < events.length; i++) {
			const event = events[i]
			if (event.id <= lastSeenGiftEventId) {
				continue
			}
			playIncomingGiftEvent(event)
			appendRoomBroadcast(buildGiftBroadcastText(event.senderName, event.giftName, event.quantity, event.comboCount))
		}
	}

	function appendRoomBroadcast(content: string): void {
		const item: LiveMessage = {
			id: Date.now(),
			serverMessageId: Date.now(),
			senderName: t('room.broadcastName'),
			content,
			createdAt: t('common.now'),
			status: 'sent',
		}
		updateMessageList([...messageList.value, item])
	}

	function getSelectedGift(): GiftItem | null {
		for (let i = 0; i < giftList.value.length; i++) {
			const gift = giftList.value[i]
			if (gift.giftId == selectedGiftId.value) {
				return gift
			}
		}
		return null
	}

	function syncSelectedGiftSummary(): void {
		const selectedGift = getSelectedGift()
		if (selectedGift == null) {
			selectedGiftName.value = t('room.selectedGiftNoneLabel')
			selectedGiftIcon.value = '/static/logo.png'
			selectedGiftPrice.value = 0
			selectedGiftTotalText.value = '0 ' + getCurrencyName()
			return
		}
		selectedGiftName.value = selectedGift.name
		selectedGiftIcon.value = selectedGift.icon
		selectedGiftPrice.value = selectedGift.price
		selectedGiftTotalText.value = (selectedGift.price * giftQuantity.value).toString() + ' ' + getCurrencyName()
	}

	function previewNextComboCount(giftId: number, quantity: number): number {
		const now = Date.now()
		const sameGift = comboGiftId.value == giftId
		const stillActive = comboDeadline.value > now
		if (sameGift && stillActive) {
			return comboCount.value + quantity
		}
		return quantity
	}

	function commitComboState(giftId: number, nextComboCount: number): void {
		comboGiftId.value = giftId
		comboCount.value = nextComboCount
		comboDeadline.value = Date.now() + 4000
		comboText.value = t('room.sendOneRound') + ' x' + comboCount.value.toString() + ' · 4s'
		comboHintVersion = comboHintVersion + 1
		const currentVersion = comboHintVersion
		comboClearTimer = clearTimer(comboClearTimer)
		comboClearTimer = setTimeout(() => {
			const expired = Date.now() >= comboDeadline.value
			if (currentVersion == comboHintVersion && expired) {
				comboText.value = ''
				comboCount.value = 0
				comboGiftId.value = 0
			}
		}, 4100)
	}

	function updateComboState(giftId: number, quantity: number): number {
		const nextComboCount = previewNextComboCount(giftId, quantity)
		commitComboState(giftId, nextComboCount)
		return nextComboCount
	}

	function showBannerGiftEffectCard(giftIcon: string, giftName: string, quantity: number, nextComboCount: number): void {
		effectGiftIcon.value = giftIcon
		effectGiftName.value = giftName
		effectGiftQuantityText.value = 'x' + quantity.toString()
		effectGiftComboText.value = 'combo x' + nextComboCount.toString()
		showGiftEffect.value = true
		giftEffectHideTimer = clearTimer(giftEffectHideTimer)
		giftEffectHideTimer = setTimeout(() => {
			showGiftEffect.value = false
		}, 1600)
	}

	function showGiftEffectPresentation(gift: GiftItem, quantity: number, nextComboCount: number, senderName: string = ''): void {
		const preset = getGiftEffectPreset(gift.giftId) != null ? (getGiftEffectPreset(gift.giftId) as GiftEffectPreset) : buildGiftEffectPreset(gift)
		if (preset != null && isLargeGiftEffectMode(preset.effectMode)) {
			enqueueLargeGiftEffect(createLargeGiftEffectItem(gift, quantity, nextComboCount, preset, senderName))
			return
		}
		showBannerGiftEffectCard(gift.icon, gift.name, quantity, nextComboCount)
	}

	function loadWalletData(): void {
		getBalance().then((balance) => {
			updateBalanceText(balance.balance)
		}).catch(() => {
			updateBalanceText(0)
		})
		getGiftList().then((list) => {
			giftList.value = normalizeGiftList(list)
			if (giftList.value.length > 0) {
				selectedGiftId.value = giftList.value[0].giftId
				syncSelectedGiftSummary()
			} else {
				selectedGiftId.value = 0
				syncSelectedGiftSummary()
			}
		}).catch(() => {
			giftList.value = []
			selectedGiftId.value = 0
			syncSelectedGiftSummary()
		})
	}

	function resolveErrorMessage(error: any | null): string {
		return resolveUnknownErrorMessage(error, localizedText('操作失败，请稍后重试。', 'Action failed. Please try again.'))
	}

	function loadRoomData(): void {
		roomLoading.value = true
		roomErrorMessage.value = ''
		roomStreamText.value = ''
		messageList.value = []
		closeLiveMessageChannel()
		roomActivityPollTimer = clearTimer(roomActivityPollTimer)
		rankingRefreshTimer = clearTimer(rankingRefreshTimer)
		resetPlayerRuntimeState()
		playerReloadKey.value = playerReloadKey.value + 1
		syncPlayerFeedback()
		if (roomInviteCode.value.length == 0) {
			roomErrorMessage.value = t('liveInvite.missing')
			uni.showToast({
				title: roomErrorMessage.value,
				icon: 'none',
			})
			roomLoading.value = false
			syncPlayerFeedback()
			return
		}
		enterRoom(roomId.value, roomInviteCode.value).then((room) => {
			roomTitle.value = room.liveTitle
			anchorId.value = room.anchorId
			anchorName.value = room.anchorName
			anchorAvatar.value = room.anchorAvatar.length > 0 ? room.anchorAvatar : '/static/logo.png'
			roomOnlineCount.value = room.onlineCount
			roomStreamText.value = resolveRoomStreamUrl(room.streamUrl)
			allowMessage.value = room.allowMessage != false
			allowGift.value = room.allowGift
			syncTopAudienceAvatars()
			loadFollowState()
			loadRankingData()
			scheduleRankingRefresh()
			getLiveMessages(roomId.value).then((list) => {
				updateMessageList(list)
			}).catch(() => {
				updateMessageList([])
			}).finally(() => {
				startLiveMessageChannel(room)
			})
			loadWalletData()
		}).catch((error) => {
			const message = resolveUnknownErrorMessage(error, t('liveInvite.enterFailed'))
			roomErrorMessage.value = message.indexOf(t('live.invite_code_invalid')) >= 0 ? t('liveInvite.invalid') : message
			uni.showToast({
				title: roomErrorMessage.value,
				icon: 'none',
			})
			roomStreamText.value = ''
		}).finally(() => {
			roomLoading.value = false
			syncPlayerFeedback()
		})
	}

	function refreshStreamPlayback(): void {
		retryPlayer()
	}

	function retryPlayer(): void {
		if (roomLoading.value) {
			return
		}
		if (roomErrorMessage.value.length > 0 || !hasPlayableStreamUrl()) {
			loadRoomData()
			return
		}
		resetPlayerRuntimeState()
		playerReloadKey.value = playerReloadKey.value + 1
		syncPlayerFeedback()
	}

	function handleVideoPlay(): void {
		playerHasStarted.value = true
		playerBufferingActive.value = false
		if (playerMeasuredSpeedKbps.value >= playerRecoverSpeedThreshold) {
			playerLowSpeedSamples.value = 0
			playerPoorNetworkHoldUntil = 0
		}
		playerStateCode.value = 10004
		playerErrorMessage.value = ''
		syncPlayerFeedback()
	}

	function handleVideoWaiting(): void {
		playerBufferingActive.value = playerHasStarted.value
		if (playerHasStarted.value) {
			recordPlayerBufferingSignal()
		}
		playerStateCode.value = 10002
		syncPlayerFeedback()
	}

	function handleVideoStalled(): void {
		playerBufferingActive.value = playerHasStarted.value
		if (playerHasStarted.value) {
			recordPlayerBufferingSignal()
			markPlayerPoorNetwork()
		}
		playerStateCode.value = 10002
		syncPlayerFeedback()
	}

	function handleVideoStats(event: any): void {
		const detail = event != null && event.detail != null ? event.detail : event
		const rawSpeed = detail != null ? detail.speed : 0
		const speed = typeof rawSpeed == 'number' ? rawSpeed : parseFloat(rawSpeed)
		if (!isNaN(speed) && speed > 0) {
			playerMeasuredSpeedKbps.value = speed
			if (speed < playerLowSpeedThreshold) {
				playerLowSpeedSamples.value = playerLowSpeedSamples.value + 1
				if (playerLowSpeedSamples.value >= playerPoorNetworkSampleCount) {
					markPlayerPoorNetwork()
				}
			} else if (speed >= playerRecoverSpeedThreshold) {
				playerLowSpeedSamples.value = 0
				if (!playerBufferingActive.value) {
					playerPoorNetworkHoldUntil = 0
				}
			}
		}
		syncPlayerFeedback()
	}

	function handleVideoError(event: any): void {
		playerBufferingActive.value = false
		playerStateCode.value = 10010
		playerErrorMessage.value = localizedText('视频播放失败，请稍后重试。', 'Video playback failed. Please try again later.')
		syncPlayerFeedback()
	}

	function selectGift(giftId: number): void {
		selectedGiftId.value = giftId
		syncSelectedGiftSummary()
	}

	async function performGiftSend(isComboRound: boolean): Promise<void> {
		if (!allowGift.value) {
			actionMessage.value = localizedText('当前房间暂未开放送礼。', 'Gift sending is disabled in this room.')
			return
		}
		const selectedGift = getSelectedGift()
		if (selectedGift == null) {
			actionMessage.value = localizedText('请先选择礼物。', 'Please select a gift first.')
			return
		}
		const totalPrice = selectedGift.price * giftQuantity.value
		const currentBalance = await getBalance()
		if (currentBalance.balance < totalPrice) {
			actionMessage.value = t('wallet.balanceInsufficient')
			openRecharge()
			return
		}
		const nextComboCount = previewNextComboCount(selectedGift.giftId, giftQuantity.value)
		try {
			const text = await sendRoomGift(roomId.value, anchorId.value, selectedGift.giftId, selectedGift.name, giftQuantity.value, nextComboCount)
			const balance = await getBalance()
			updateBalanceText(balance.balance)
			updateComboState(selectedGift.giftId, giftQuantity.value)
			actionMessage.value = text
			showGiftEffectPresentation(selectedGift, giftQuantity.value, nextComboCount, localizedText('你', 'You'))
			appendRoomBroadcast(text)
			uni.showToast({
				title: t('room.sendGiftSuccess'),
				icon: 'none',
			})
		} catch (error) {
			actionMessage.value = resolveErrorMessage(error)
		}
	}

	function sendSelectedGift(): void {
		performGiftSend(false)
	}

	async function submitMessage(): Promise<void> {
		const nextMessage = draftMessage.value.trim()
		if (nextMessage.length == 0 || !allowMessage.value || messageSending.value) {
			if (!allowMessage.value) {
				actionMessage.value = localizedText('当前房间暂未开放公屏。', 'Public chat is disabled in this room.')
			}
			return
		}
		messageSending.value = true
		const clientMessageId = 'live-room-' + roomId.value.toString() + '-' + Date.now().toString()
		try {
			await sendLiveMessage(roomId.value, nextMessage, clientMessageId)
			draftMessage.value = ''
			setTimeout(() => {
				syncRoomMessages()
			}, 320)
		} catch (error) {
			actionMessage.value = resolveErrorMessage(error)
		} finally {
			messageSending.value = false
		}
	}

	async function toggleFollow(): Promise<void> {
		if (followLoading.value || anchorId.value <= 0) {
			return
		}
		followLoading.value = true
		try {
			const state = isFollowing.value ? await unfollowAnchor(anchorId.value) : await followAnchor(anchorId.value)
			isFollowing.value = state.isFollowing
			currentFollowButtonText.value = isFollowing.value ? followingText.value : followText.value
			if (rankingList.value.length > 0) {
				syncTopAudienceAvatars()
			}
			uni.showToast({
				title: isFollowing.value ? localizedText('已关注主播', 'Followed') : localizedText('已取消关注', 'Unfollowed'),
				icon: 'none',
			})
		} catch (error) {
			actionMessage.value = resolveErrorMessage(error)
		} finally {
			followLoading.value = false
		}
	}

	function goBack(): void {
		uni.navigateBack()
	}

	function openAnchorDetail(): void {
		uni.navigateTo({
			url: '/pages/live/anchor-detail?anchorId=' + anchorId.value.toString()
				+ '&anchorName=' + encodeURIComponent(anchorName.value)
				+ '&anchorAvatar=' + encodeURIComponent(anchorAvatar.value)
				+ '&mainImage=' + encodeURIComponent(anchorAvatar.value)
				+ '&gallery=' + encodeURIComponent(JSON.stringify([anchorAvatar.value]))
				+ '&intro=' + encodeURIComponent('')
				+ '&tags=' + encodeURIComponent(JSON.stringify([]))
				+ '&isLiving=' + (hasPlayableStreamUrl() ? '1' : '0')
				+ '&roomId=' + roomId.value.toString()
				+ '&liveTitle=' + encodeURIComponent(roomTitle.value)
				+ '&onlineCount=' + roomOnlineCount.value.toString()
				+ '&heat=0',
		})
	}

	onLoad((options) => {
		syncSafeAreaLayout()
		syncLocaleUI()
		playerPlatformSupported.value = false
		// #ifdef APP-PLUS
		playerPlatformSupported.value = true
		// #endif
		// #ifdef H5
		playerPlatformSupported.value = true
		// #endif
		const roomIdValue = options['roomId']
		const anchorIdValue = options['anchorId']
		const inviteCodeValue = options['inviteCode']
		const streamUrlValue = options['streamUrl']
		const codecValue = options['codec']
		const playStrategyValue = options['playStrategy']
		if (roomIdValue != null) {
			roomId.value = parseInt(roomIdValue as string, 10)
		}
		if (anchorIdValue != null) {
			anchorId.value = parseInt(anchorIdValue as string, 10)
		}
		if (inviteCodeValue != null) {
			roomInviteCode.value = decodeURIComponent(inviteCodeValue as string)
		}
		if (streamUrlValue != null) {
			streamUrlOverride.value = streamUrlValue as string
		}
		playerCodec.value = resolvePlayerCodec(codecValue != null ? (codecValue as string) : null)
		playerPlayStrategy.value = resolvePlayerPlayStrategy(playStrategyValue != null ? (playStrategyValue as string) : null)
		if (roomId.value <= 0) {
			roomLoading.value = false
			roomErrorMessage.value = localizedText('直播间参数缺失，请返回列表重试。', 'Missing room id. Go back to the list and try again.')
			syncPlayerFeedback()
			return
		}
		loadRoomData()
	})

	onShow(() => {
		syncSafeAreaLayout()
		syncLocaleUI()
		syncCachedFollowState()
	})

	onUnload(() => {
		roomActivityPollTimer = clearTimer(roomActivityPollTimer)
		rankingRefreshTimer = clearTimer(rankingRefreshTimer)
		closeLiveMessageChannel()
		comboClearTimer = clearTimer(comboClearTimer)
		giftEffectHideTimer = clearTimer(giftEffectHideTimer)
		messageScrollTimer = clearTimer(messageScrollTimer)
		clearFullscreenGiftTimers()
		largeGiftQueue.value = []
		currentLargeGiftEffect = null
		largeGiftPlaying = false
		showGiftEffect.value = false
		hideSvgaGiftEffect()
		showFullscreenGiftEffect.value = false
		resetPlayerRuntimeState()
		if (roomId.value > 0) {
			leaveRoom(roomId.value)
		}
	})
</script>

<style>
	.room-page {
		display: flex;
		flex-direction: column;
		flex: 1;
		background-color: #050505;
		overflow: hidden;
	}

	.room-live-stage {
		display: flex;
		flex-direction: column;
		flex: 1;
		background-color: #050505;
	}

	.room-surface-soft {
		background-color: rgba(110, 110, 110, 0.38);
	}

	.room-surface-chat {
		background-color: rgba(128, 128, 128, 0.42);
	}


	.room-live-player {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		width: 100%;
		height: 100%;
		background-color: #000000;
		z-index: 1;
	}

	.room-player-offline-base {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		width: 100%;
		height: 100%;
		background-color: #000000;
		z-index: 1;
	}

	.room-player-backdrop-shade {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		width: 100%;
		height: 100%;
		z-index: 9;
	}

	.room-player-backdrop-shade-black {
		background-color: rgba(0, 0, 0, 0.96);
	}

	.room-player-backdrop-shade-blur {
		background-color: rgba(6, 6, 6, 0.38);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
	}

	.room-topbar {
		position: fixed;
		left: 16px;
		right: 16px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		z-index: 20;
	}

	.room-top-main {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
		height: 40px;
		border-radius: 20px;
		padding-left: 6px;
		padding-right: 10px;
	}

	.room-anchor-avatar {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		background-color: #2b2b2b;
	}

	.room-anchor-copy {
		display: flex;
		flex-direction: column;
		margin-left: 8px;
		flex: 1;
	}

	.room-anchor-name {
		font-size: 14px;
		font-weight: 700;
		color: #f0d7c1;
	}

	.room-anchor-meta {
		font-size: 10px;
		color: #f0d7c1;
		margin-top: 2px;
	}

	.room-top-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.room-follow-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding-left: 12px;
		padding-right: 12px;
		border-radius: 15px;
		background-color: #ff335f;
	}

	.room-follow-button-active {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding-left: 12px;
		padding-right: 12px;
		border-radius: 15px;
		background-color: #ffffff;
	}

	.room-follow-button-text {
		font-size: 11px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-follow-button-text-active {
		font-size: 11px;
		font-weight: 700;
		color: #121212;
	}

	.room-ranking-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 30px;
		border-radius: 15px;
		padding-left: 8px;
		padding-right: 8px;
		margin-left: 8px;
	}

	.room-ranking-avatars {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.room-ranking-avatar {
		width: 20px;
		height: 20px;
		border-radius: 10px;
		margin-right: 3px;
		background-color: #2b2b2b;
	}

	.room-ranking-count {
		font-size: 11px;
		font-weight: 600;
		color: #ffffff;
		margin-left: 5px;
	}

	.room-close-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 15px;
		margin-left: 8px;
	}

	.room-close-text {
		font-size: 14px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-player-status-overlay {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 24px;
		padding-right: 28px;
		padding-bottom: 24px;
		padding-left: 28px;
		z-index: 15;
		pointer-events: none;
	}

	.room-player-status-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 340px;
		border-radius: 24px;
		background-color: rgba(17, 17, 17, 0.82);
		border-width: 1px;
		border-style: solid;
		border-color: rgba(255, 255, 255, 0.08);
		padding-top: 18px;
		padding-right: 18px;
		padding-bottom: 18px;
		padding-left: 18px;
		pointer-events: auto;
	}

	.room-player-status-badge {
		font-size: 11px;
		font-weight: 700;
		color: #d7d7d7;
		background-color: #2f2f2f;
		padding-top: 5px;
		padding-right: 10px;
		padding-bottom: 5px;
		padding-left: 10px;
		border-radius: 12px;
	}

	.room-player-status-badge-active {
		font-size: 11px;
		font-weight: 700;
		color: #ffffff;
		background-color: #ff335f;
		padding-top: 5px;
		padding-right: 10px;
		padding-bottom: 5px;
		padding-left: 10px;
		border-radius: 12px;
	}

	.room-player-status-title {
		font-size: 16px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 12px;
	}

	.room-player-status-desc {
		font-size: 12px;
		line-height: 18px;
		color: #d0d0d0;
		margin-top: 8px;
		text-align: center;
	}

	.room-player-refresh-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 34px;
		padding-left: 16px;
		padding-right: 16px;
		border-radius: 17px;
		background-color: #ffffff;
		margin-top: 14px;
	}

	.room-player-refresh-text {
		font-size: 12px;
		font-weight: 700;
		color: #111111;
	}

	.room-message-layer {
		position: fixed;
		left: 16px;
		right: 16px;
		display: flex;
		flex-direction: column;
		height: 240px;
		z-index: 22;
		overflow: hidden;
	}

	.room-message-header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		align-self: flex-start;
		border-radius: 12px;
		padding-top: 4px;
		padding-right: 10px;
		padding-bottom: 4px;
		padding-left: 10px;
	}

	.room-message-header-text {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-message-combo {
		font-size: 11px;
		font-weight: 700;
		color: #ffd166;
	}

	.room-message-scroll {
		flex: 1;
		margin-top: 6px;
		overflow: hidden;
	}

	.room-message-scroll-content {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.room-message-empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 16px;
	}

	.room-message-empty-text {
		font-size: 12px;
		color: #bbbbbb;
	}

	.room-message-bubble {
		display: flex;
		flex-direction: row;
		align-items: center;
		align-self: flex-start;
		width: 82%;
		max-width: 320px;
		border-radius: 14px;
		padding-top: 5px;
		padding-right: 12px;
		padding-bottom: 5px;
		padding-left: 12px;
		margin-bottom: 3px;
	}

	.room-message-bottom-anchor {
		flex-shrink: 0;
	}

	.room-message-name {
		font-size: 11px;
		font-weight: 700;
		color: #f0d7c1;
		margin-right: 6px;
	}

	.room-message-content {
		font-size: 11px;
		line-height: 16px;
		color: #ffffff;
	}

	.room-action-feedback {
		position: fixed;
		left: 16px;
		right: 16px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		z-index: 23;
	}

	.room-action-feedback-text {
		font-size: 11px;
		color: #ffffff;
		background-color: #171717;
		padding-top: 8px;
		padding-right: 12px;
		padding-bottom: 8px;
		padding-left: 12px;
		border-radius: 14px;
		text-align: center;
	}

	.room-bottom-bar {
		position: fixed;
		left: 12px;
		right: 12px;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-bottom: 0px;
		z-index: 26;
	}

	.room-input {
		flex: 1;
		height: 44px;
		border-radius: 22px;
		padding-left: 16px;
		padding-right: 16px;
		font-size: 14px;
		color: #ffffff;
	}

	.room-bottom-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 58px;
		height: 44px;
		border-radius: 22px;
		margin-left: 10px;
	}

	.room-bottom-button-accent {
		width: 72px;
		background-color: #ff4f87;
	}

	.room-bottom-button-send-disabled {
		background-color: #232a47;
	}

	.room-bottom-button-send-active {
		background-color: #ddd1ba;
	}

	.room-bottom-button-text-disabled {
		font-size: 12px;
		font-weight: 700;
		color: #8d96ba;
	}

	.room-bottom-button-text-active {
		font-size: 12px;
		font-weight: 700;
		color: #2a241d;
	}

	.room-bottom-button-text-accent {
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
	}

	.room-effect-layer {
		position: fixed;
		left: 24px;
		right: 24px;
		top: 220px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		z-index: 70;
	}

	.room-effect-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		border-radius: 26px;
		background-color: #121533;
		padding-top: 14px;
		padding-right: 16px;
		padding-bottom: 14px;
		padding-left: 16px;
	}

	.room-effect-icon {
		width: 56px;
		height: 56px;
		border-radius: 18px;
		background-color: #2b2b2b;
	}

	.room-effect-copy {
		display: flex;
		flex-direction: column;
		margin-left: 12px;
	}

	.room-effect-kicker {
		font-size: 11px;
		font-weight: 700;
		color: #ffd166;
	}

	.room-effect-title {
		font-size: 20px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 4px;
	}

	.room-effect-meta {
		font-size: 12px;
		color: #e4defc;
		margin-top: 6px;
	}

	.room-svga-effect-player-shell {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		z-index: 81;
	}

	.room-svga-effect-player {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		width: 100%;
		height: 100%;
	}

	.room-fullscreen-effect-layer {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		z-index: 80;
	}

	.room-fullscreen-effect-shell {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition-property: opacity, transform;
		transition-duration: 240ms;
	}

	.room-fullscreen-effect-shell-enter {
		opacity: 0;
		transform: scale(0.9) translateY(28px);
	}

	.room-fullscreen-effect-shell-active {
		opacity: 1;
		transform: scale(1) translateY(0px);
	}

	.room-fullscreen-effect-shell-leave {
		opacity: 0;
		transform: scale(1.05) translateY(-20px);
	}

	.room-fullscreen-effect-backdrop {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
	}

	.room-fullscreen-effect-backdrop-rose {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-color: rgba(72, 6, 29, 0.82);
	}

	.room-fullscreen-effect-backdrop-gold {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-color: rgba(65, 33, 0, 0.82);
	}

	.room-fullscreen-effect-backdrop-sky {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-color: rgba(7, 28, 67, 0.82);
	}

	.room-fullscreen-effect-glow {
		position: fixed;
		width: 340px;
		height: 340px;
		border-radius: 170px;
	}

	.room-fullscreen-effect-glow-rose {
		position: fixed;
		width: 340px;
		height: 340px;
		border-radius: 170px;
		background-color: rgba(255, 79, 135, 0.26);
	}

	.room-fullscreen-effect-glow-gold {
		position: fixed;
		width: 340px;
		height: 340px;
		border-radius: 170px;
		background-color: rgba(255, 196, 73, 0.28);
	}

	.room-fullscreen-effect-glow-sky {
		position: fixed;
		width: 340px;
		height: 340px;
		border-radius: 170px;
		background-color: rgba(86, 176, 255, 0.24);
	}

	.room-fullscreen-effect-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 78%;
		border-radius: 32px;
		padding-top: 24px;
		padding-right: 20px;
		padding-bottom: 26px;
		padding-left: 20px;
		border-width: 1px;
		border-style: solid;
		z-index: 82;
		box-sizing: border-box;
	}

	.room-fullscreen-effect-card-rose {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 78%;
		border-radius: 32px;
		padding-top: 24px;
		padding-right: 20px;
		padding-bottom: 26px;
		padding-left: 20px;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(255, 165, 198, 0.62);
		background-color: rgba(47, 11, 28, 0.95);
		z-index: 82;
		box-sizing: border-box;
	}

	.room-fullscreen-effect-card-gold {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 78%;
		border-radius: 32px;
		padding-top: 24px;
		padding-right: 20px;
		padding-bottom: 26px;
		padding-left: 20px;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(255, 222, 130, 0.7);
		background-color: rgba(58, 34, 4, 0.95);
		z-index: 82;
		box-sizing: border-box;
	}

	.room-fullscreen-effect-card-sky {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 78%;
		border-radius: 32px;
		padding-top: 24px;
		padding-right: 20px;
		padding-bottom: 26px;
		padding-left: 20px;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(159, 212, 255, 0.7);
		background-color: rgba(9, 27, 58, 0.95);
		z-index: 82;
		box-sizing: border-box;
	}

	.room-fullscreen-effect-card-svga-plain {
		background-color: transparent !important;
		border-width: 0 !important;
		border-style: none !important;
		border-color: transparent !important;
		box-shadow: none !important;
	}

	.room-fullscreen-effect-headline {
		font-size: 26px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 16px;
		text-align: center;
	}

	.room-fullscreen-effect-icon {
		width: 92px;
		height: 92px;
		border-radius: 28px;
		background-color: rgba(255, 255, 255, 0.14);
		margin-top: 18px;
	}

	.room-fullscreen-effect-name {
		font-size: 24px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 16px;
	}

	.room-fullscreen-effect-meta {
		font-size: 14px;
		font-weight: 600;
		color: #ffe6bf;
		margin-top: 8px;
	}

	.room-fullscreen-effect-subtitle {
		font-size: 12px;
		line-height: 18px;
		color: #f4f1ff;
		margin-top: 14px;
		text-align: center;
	}

	.room-fullscreen-effect-sender {
		font-size: 11px;
		color: #d8d0ec;
		margin-top: 16px;
		text-align: center;
	}

	.room-modal-mask {
		position: fixed;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-color: rgba(0, 0, 0, 0.68);
		z-index: 50;
	}

	.room-gift-panel {
		position: fixed;
		left: 0px;
		right: 0px;
		bottom: 0px;
		display: flex;
		flex-direction: column;
		height: 460px;
		background-color: #15192b;
		border-top-left-radius: 28px;
		border-top-right-radius: 28px;
		padding-top: 20px;
		padding-right: 18px;
		padding-bottom: 18px;
		padding-left: 18px;
		box-sizing: border-box;
		z-index: 60;
	}

	.room-gift-balance-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		border-radius: 18px;
		background-color: #202640;
		padding-top: 12px;
		padding-right: 14px;
		padding-bottom: 12px;
		padding-left: 14px;
	}

	.room-gift-balance-copy {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.room-gift-balance-label {
		font-size: 12px;
		color: #b9bfd7;
	}

	.room-gift-balance-value {
		font-size: 22px;
		font-weight: 700;
		color: #ffffff;
		margin-top: 4px;
	}

	.room-recharge-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 34px;
		padding-left: 14px;
		padding-right: 14px;
		border-radius: 17px;
		background-color: #ffb238;
	}

	.room-recharge-button-text {
		font-size: 12px;
		font-weight: 700;
		color: #1a1f33;
	}

	.room-gift-panel-scroll {
		flex: 1;
		margin-top: 12px;
	}

	.room-gift-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.room-gift-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		width: 23%;
		height: 118px;
		border-radius: 18px;
		background-color: transparent;
		border-width: 1px;
		border-style: solid;
		border-color: transparent;
		margin-bottom: 12px;
		padding-top: 14px;
		padding-right: 8px;
		padding-bottom: 0px;
		padding-left: 8px;
		box-sizing: border-box;
	}

	.room-gift-item-active {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		width: 23%;
		height: 118px;
		border-radius: 18px;
		background-color: #202640;
		border-width: 1px;
		border-style: solid;
		border-color: #ff4f87;
		margin-bottom: 12px;
		padding-top: 14px;
		padding-right: 8px;
		padding-bottom: 0px;
		padding-left: 8px;
		box-sizing: border-box;
		overflow: hidden;
	}

	.room-gift-icon {
		width: 48px;
		height: 48px;
		border-radius: 16px;
	}

	.room-gift-name {
		font-size: 12px;
		font-weight: 600;
		color: #ffffff;
		margin-top: 10px;
	}

	.room-gift-price {
		font-size: 11px;
		color: #d4d8e9;
		margin-top: 4px;
	}

	.room-gift-item-action {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		height: 34px;
		margin-top: auto;
		margin-left: -8px;
		margin-right: -8px;
		background-color: #ff2f74;
		border-bottom-left-radius: 18px;
		border-bottom-right-radius: 18px;
	}

	.room-gift-item-action-text {
		font-size: 14px;
		font-weight: 700;
		color: #ffffff;
	}


</style>
