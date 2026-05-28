<template>
	<view class="live-page" :key="localeVersion">
		<view class="live-topbar">
			<view class="live-heading">
				<text class="live-heading-title">{{ headingTitle }}</text>
			<!-- 	<text class="live-heading-subtitle">{{ headingSubtitle }}</text> -->
			</view>
			<view class="outline-button live-refresh-button" @tap="reloadBatch">
				<text class="live-refresh-text">{{ reloadText }}</text>
			</view>
		</view>

		<scroll-view class="live-category-scroll" :scroll-x="true" show-scrollbar="false">
			<view class="live-category-track">
				<view
					v-for="item in liveCategories"
					:key="item.code"
					:class="item.code == activeCategoryCode ? 'live-category-chip live-category-chip-active' : 'live-category-chip'"
					@tap="selectCategory(item.code)"
				>
					<text :class="item.code == activeCategoryCode ? 'live-category-text-active' : 'live-category-text'">{{ resolveCategoryName(item) }}</text>
				</view>
			</view>
		</scroll-view>

		<view v-if="loading && anchors.length == 0" class="section-card live-state-card">
			<text class="live-state-title">{{ loadingText }}</text>
		</view>
		<view v-else-if="errorMessage.length > 0" class="section-card live-state-card">
			<text class="live-state-title">{{ errorMessage }}</text>
			<view class="primary-button live-state-action" @tap="retryLoad">
				<text class="live-action-text">{{ retryText }}</text>
			</view>
		</view>
		<view v-else-if="anchors.length == 0" class="section-card live-state-card">
			<text class="live-state-title">{{ emptyText }}</text>
			<view class="outline-button live-state-action" @tap="retryLoad">
				<text class="live-refresh-text">{{ retryText }}</text>
			</view>
		</view>
		<scroll-view v-else class="live-grid-scroll" :scroll-y="true" show-scrollbar="false">
			<view class="live-grid">
				<view
					v-for="item in anchors"
					:key="item.anchorId"
					:class="item.isLiving && item.roomId > 0 ? 'live-card' : 'live-card live-card-offline'"
					@tap="handleAnchorTap(item)"
				>
					<image class="live-cover" :src="item.mainImage" mode="aspectFill"></image>
					<view class="live-cover-overlay"></view>
					<text v-if="item.isLiving" class="live-status-badge live-status-badge-on">{{ liveNowText }}</text>
					<view v-if="item.isLiving" class="live-entry-button" @tap.stop="openRoomFromCard(item)">
						<text class="live-entry-button-text">{{ enterRoomText }}</text>
					</view>
					<view class="live-card-body">
						<view class="live-card-top-copy" @tap.stop="openAnchorDetail(item)">
							<text class="live-name">{{ item.anchorName }}</text>
							<text class="live-title">{{ item.isLiving ? item.liveTitle : item.intro }}</text>
						</view>
						<view class="live-card-bottom-copy">
							<view v-if="item.isLiving" class="live-stats-row">
								<text class="live-stats">{{ onlineText }} {{ item.onlineCount }} · {{ heatText }} {{ item.heat }}</text>
							</view>
							<view class="live-tags">
								<text v-for="tag in item.tags" :key="tag" class="tag-chip live-tag-chip">{{ tag }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<InviteCodeDialog
			:visible="showInviteDialog"
			:title="inviteTitle"
			:placeholder="invitePlaceholder"
			:server-error-text="inviteErrorText"
			:cancel-text="inviteCancelText"
			:confirm-text="inviteConfirmText"
			:confirming-text="inviteConfirmingText"
			:required-text="inviteRequiredText"
			:loading="inviteSubmitting"
			@cancel="closeInviteDialog"
			@confirm="confirmInviteAndEnter"
		/>
	</view>
</template>

<script setup lang="ts">
	import { onShow } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import InviteCodeDialog from '../../components/live/InviteCodeDialog.vue'
	import { applyTabBarLocale, i18nStore, t } from '../../store/i18n'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import { getAnchorList, verifyLiveRoomInviteCode } from '../../services/live'
	import { restoreAuthState } from '../../store/auth'
	import type { AnchorCard, LiveCategory } from '../../types/live'

	const localeVersion = ref(0)
	const headingTitle = ref('')
	const headingSubtitle = ref('')
	const reloadText = ref('')
	const liveNowText = ref('')
	const offlineText = ref('')
	const offlineBlockedText = ref('')
	const onlineText = ref('')
	const heatText = ref('')
	const enterRoomText = ref('')
	const inviteTitle = ref('')
	const invitePlaceholder = ref('')
	const inviteCancelText = ref('')
	const inviteConfirmText = ref('')
	const inviteConfirmingText = ref('')
	const inviteRequiredText = ref('')
	const inviteErrorText = ref('')
	const comeLaterText = ref('')
	const loadingText = ref('')
	const emptyText = ref('')
	const retryText = ref('')
	const anchors = ref<AnchorCard[]>([])
	const liveCategories = ref<LiveCategory[]>([])
	const activeCategoryCode = ref('')
	const batchNo = ref(1)
	const loading = ref(false)
	const errorMessage = ref('')
	const initialized = ref(false)
	const showInviteDialog = ref(false)
	const inviteSubmitting = ref(false)
	const pendingRoomId = ref(0)
	const pendingAnchorId = ref(0)
	let anchorRequestToken = 0

	function resolveErrorMessage(error: any | null): string {
		return resolveUnknownErrorMessage(error, t('liveIndex.errorDefault'))
	}

	function resolveCategoryName(item: LiveCategory): string {
		return item.name
	}

	function buildDefaultCategories(): LiveCategory[] {
		return [
			{ code: 'all', name: t('liveIndex.categoryAll'), sort: 1 },
			{ code: 'nearby', name: t('liveIndex.categoryNearby'), sort: 2 },
			{ code: 'hot', name: t('liveIndex.categoryHot'), sort: 3 },
			{ code: 'rookie', name: t('liveIndex.categoryNewcomer'), sort: 4 },
			{ code: 'goddess', name: t('liveIndex.categoryGoddess'), sort: 5 },
			{ code: 'male', name: t('liveIndex.categoryMale'), sort: 6 },
			{ code: 'talent', name: t('liveIndex.categoryTalent'), sort: 7 },
		]
	}

	function resolveCategoryRequestTag(categoryCode: string): string {
		if (categoryCode == 'all') {
			return ''
		}
		if (categoryCode == 'nearby') {
			return '附近'
		}
		if (categoryCode == 'hot') {
			return '热门'
		}
		if (categoryCode == 'rookie') {
			return '新秀'
		}
		if (categoryCode == 'goddess') {
			return '女神'
		}
		if (categoryCode == 'male') {
			return '男神'
		}
		if (categoryCode == 'talent') {
			return '才艺'
		}
		return ''
	}

	function syncLiveCategories(): void {
		const previousCode = activeCategoryCode.value
		liveCategories.value = buildDefaultCategories()
		let matched = false
		for (let i = 0; i < liveCategories.value.length; i++) {
			if (liveCategories.value[i].code == previousCode) {
				matched = true
				break
			}
		}
		activeCategoryCode.value = matched && previousCode.length > 0 ? previousCode : liveCategories.value[0].code
	}

	async function loadAnchors(): Promise<void> {
		if (activeCategoryCode.value.length == 0) {
			return
		}
		anchorRequestToken = anchorRequestToken + 1
		const requestToken = anchorRequestToken
		loading.value = true
		errorMessage.value = ''
		try {
			const list = await getAnchorList({
				batchNo: batchNo.value,
				tag: resolveCategoryRequestTag(activeCategoryCode.value),
			})
			if (requestToken != anchorRequestToken) {
				return
			}
			anchors.value = list
			if (list.length == 0) {
				emptyText.value = t('liveIndex.emptyCategory')
			} else {
				emptyText.value = t('liveIndex.empty')
			}
		} catch (error) {
			if (requestToken != anchorRequestToken) {
				return
			}
			anchors.value = []
			errorMessage.value = resolveErrorMessage(error)
		} finally {
			if (requestToken == anchorRequestToken) {
				loading.value = false
			}
		}
	}

	async function initializeHomeData(): Promise<void> {
		syncLiveCategories()
		if (activeCategoryCode.value.length > 0) {
			await loadAnchors()
		}
	}

	function ensureLogin(): void {
			restoreAuthState().then(() => {
			if (!initialized.value) {
				initialized.value = true
				initializeHomeData()
				return
			}
			if (liveCategories.value.length == 0) {
				initializeHomeData()
				return
			}
			if (anchors.value.length == 0 && activeCategoryCode.value.length > 0) {
				loadAnchors()
			}
		}).catch(() => {
			if (!initialized.value || liveCategories.value.length == 0) {
				initialized.value = true
				initializeHomeData()
				return
			}
			if (anchors.value.length == 0 && activeCategoryCode.value.length > 0) {
				loadAnchors()
			}
		})
	}

	function reloadBatch(): void {
		if (loading.value || activeCategoryCode.value.length == 0) {
			return
		}
		batchNo.value = batchNo.value + 1
		loadAnchors()
	}

	function retryLoad(): void {
		if (liveCategories.value.length == 0) {
			initializeHomeData()
			return
		}
		loadAnchors()
	}

	function selectCategory(categoryCode: string): void {
		if (categoryCode.length == 0 || categoryCode == activeCategoryCode.value) {
			return
		}
		activeCategoryCode.value = categoryCode
		batchNo.value = 1
		anchors.value = []
		loadAnchors()
	}

	function handleAnchorTap(item: AnchorCard): void {
		openAnchorDetail(item)
	}

	function buildAnchorDetailUrl(item: AnchorCard): string {
		return '/pages/live/anchor-detail?anchorId=' + item.anchorId.toString()
			+ '&anchorName=' + encodeURIComponent(item.anchorName)
			+ '&anchorAvatar=' + encodeURIComponent(item.anchorAvatar)
			+ '&mainImage=' + encodeURIComponent(item.mainImage)
			+ '&gallery=' + encodeURIComponent(JSON.stringify(item.gallery))
			+ '&intro=' + encodeURIComponent(item.intro)
			+ '&tags=' + encodeURIComponent(JSON.stringify(item.tags))
			+ '&isLiving=' + (item.isLiving ? '1' : '0')
			+ '&roomId=' + item.roomId.toString()
			+ '&liveTitle=' + encodeURIComponent(item.liveTitle)
			+ '&onlineCount=' + item.onlineCount.toString()
			+ '&heat=' + item.heat.toString()
	}

	function openAnchorDetail(item: AnchorCard): void {
		uni.navigateTo({
			url: buildAnchorDetailUrl(item),
		})
	}

	function openRoomFromCard(item: AnchorCard): void {
		if (!item.isLiving || item.roomId <= 0) {
			uni.showToast({
				title: offlineBlockedText.value,
				icon: 'none',
			})
			return
		}
		openRoom(item.roomId, item.anchorId)
	}

	function openRoom(roomId: number, anchorId: number): void {
		pendingRoomId.value = roomId
		pendingAnchorId.value = anchorId
		inviteErrorText.value = ''
		showInviteDialog.value = true
	}

	function closeInviteDialog(): void {
		if (inviteSubmitting.value) {
			return
		}
		showInviteDialog.value = false
		pendingRoomId.value = 0
		pendingAnchorId.value = 0
		inviteErrorText.value = ''
	}

	function confirmInviteAndEnter(inviteCode: string): void {
		if (inviteSubmitting.value || pendingRoomId.value <= 0) {
			return
		}
		inviteSubmitting.value = true
		verifyLiveRoomInviteCode(pendingRoomId.value, inviteCode).then(() => {
			uni.navigateTo({
				url: '/pages/live/room?roomId=' + pendingRoomId.value
					+ '&anchorId=' + pendingAnchorId.value
					+ '&inviteCode=' + encodeURIComponent(inviteCode),
				success: () => {
					showInviteDialog.value = false
					pendingRoomId.value = 0
					pendingAnchorId.value = 0
				},
				complete: () => {
					inviteSubmitting.value = false
				},
			})
		}).catch((error) => {
			inviteSubmitting.value = false
			const message = resolveUnknownErrorMessage(error, t('liveInvite.enterFailed'))
			inviteErrorText.value = message.indexOf(t('live.invite_code_invalid')) >= 0 ? t('liveInvite.invalid') : message
			uni.showToast({
				title: inviteErrorText.value,
				icon: 'none',
			})
		})
	}

	function syncLocaleText(): void {
		localeVersion.value = i18nStore.version
		applyTabBarLocale()
		syncLiveCategories()
		headingTitle.value = t('liveIndex.headingTitle')
		headingSubtitle.value = t('liveIndex.headingSubtitle')
		reloadText.value = t('liveIndex.reloadBatch')
		liveNowText.value = t('liveIndex.liveNow')
		offlineText.value = t('liveIndex.offline')
		offlineBlockedText.value = t('liveIndex.offlineBlocked')
		onlineText.value = t('common.online')
		heatText.value = t('common.heat')
		enterRoomText.value = t('liveIndex.enterRoom')
		inviteTitle.value = t('liveInvite.title')
		invitePlaceholder.value = t('liveInvite.placeholder')
		inviteCancelText.value = t('liveInvite.cancel')
		inviteConfirmText.value = t('liveInvite.confirm')
		inviteConfirmingText.value = t('liveInvite.confirming')
		inviteRequiredText.value = t('liveInvite.required')
		comeLaterText.value = t('liveIndex.comeLater')
		loadingText.value = t('liveIndex.loading')
		emptyText.value = t('liveIndex.empty')
		retryText.value = t('common.retry')
	}

	onShow(() => {
		syncLocaleText()
		ensureLogin()
	})
</script>

<style>
	page {
		background-color: #f4e7d9;
		height: 100%;
		overflow: hidden;
	}

	.live-page {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100vh;
		min-height: 100vh;
		overflow: hidden;
		background-color: #f4e7d9;
		padding-top: 20px;
		padding-right: 18px;
		padding-bottom: calc(18px + env(safe-area-inset-bottom));
		padding-left: 18px;
		box-sizing: border-box;
	}

	.live-topbar {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 14px;
	}

	.live-heading {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding-right: 12px;
	}

	.live-heading-title {
		font-size: 28px;
		font-weight: 700;
		color: #1c1613;
	}

	.live-heading-subtitle {
		font-size: 13px;
		line-height: 20px;
		color: #7f6654;
		margin-top: 6px;
	}

	.live-refresh-button {
		padding-left: 16px;
		padding-right: 16px;
		margin-top: 2px;
	}

	.live-refresh-text {
		font-size: 14px;
		font-weight: 600;
		color: #7a5543;
	}

	.live-category-scroll {
		width: 100%;
		white-space: nowrap;
		margin-bottom: 14px;
	}

	.live-category-track {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-bottom: 2px;
	}

	.live-category-chip {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 34px;
		padding-left: 16px;
		padding-right: 16px;
		border-radius: 18px;
		background-color: rgba(255, 249, 242, 0.7);
		margin-right: 10px;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(122, 85, 67, 0.12);
		font-size: 12rpx;
	}

	.live-category-chip-active {
		background-color: #1c1613;
		border-color: #1c1613;
	}

	.live-category-text {
		font-size: 12px;
		font-weight: 600;
		color: #7a5543;
		white-space: nowrap;
	}

	.live-category-text-active {
		font-size: 13px;
		font-weight: 700;
		color: #fff9f2;
		white-space: nowrap;
	}

	.live-state-card {
		display: flex;
		flex-direction: column;
		flex: 1;
		align-items: center;
		justify-content: center;
	}

	.live-state-title {
		font-size: 14px;
		line-height: 22px;
		color: #6f5544;
		text-align: center;
	}

	.live-state-action {
		margin-top: 16px;
	}

	.live-action-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.live-grid-scroll {
		flex: 1;
		min-height: 0;
	}

	.live-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
		padding-bottom: 16px;
	}

	.live-card {
		position: relative;
		width: calc((100% - 12px) / 2);
		height: 256px;
		border-radius: 24px;
		overflow: hidden;
		background-color: #201612;
		margin-bottom: 12px;
	}

	.live-card-offline {
		opacity: 0.88;
	}

	.live-cover {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0px;
		top: 0px;
	}

	.live-cover-overlay {
		position: absolute;
		left: 0px;
		top: 0px;
		right: 0px;
		bottom: 0px;
		background-image: linear-gradient(180deg, rgba(17, 11, 8, 0.08) 0%, rgba(17, 11, 8, 0.34) 42%, rgba(17, 11, 8, 0.84) 100%);
	}

	.live-status-badge {
		position: absolute;
		right: 12px;
		top: 12px;
		z-index: 2;
		font-size: 11px;
		font-weight: 700;
		padding-top: 5px;
		padding-right: 10px;
		padding-bottom: 5px;
		padding-left: 10px;
		border-radius: 12px;
	}

	.live-status-badge-on {
		color: #fff9f2;
		background-color: rgba(255, 61, 108, 0.92);
	}

	.live-entry-button {
		position: absolute;
		left: 50%;
		top: 58%;
		transform: translate(-50%, -50%);
		z-index: 2;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 34px;
		min-width: 92px;
		padding-left: 14px;
		padding-right: 14px;
		border-radius: 17px;
		border-width: 0.5px;
		border-style: solid;
		border-color: rgba(255, 255, 255, 0.72);
		background-color: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.live-entry-button-text {
		font-size: 12px;
		font-weight: 700;
		color: #fff9f2;
	}

	.live-status-badge-off {
		color: #f5dfcc;
		background-color: rgba(74, 56, 44, 0.88);
	}

	.live-card-body {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding-top: 12px;
		padding-right: 10px;
		padding-bottom: 11px;
		padding-left: 10px;
		box-sizing: border-box;
	}

	.live-card-top-copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.live-card-bottom-copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.live-name {
		font-size: 18px;
		font-weight: 700;
		color: #fff9f2;
		max-width: 100%;
	}

	.live-title {
		font-size: 13px;
		line-height: 19px;
		color: #f7e7d8;
		margin-top: 6px;
		max-width: 100%;
	}

	.live-tags {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 6px;
		margin-right: -4px;
	}

	.live-tag-chip {
		line-height: 24px;
		padding-top: 0px;
		padding-right: 9px;
		padding-bottom: 0px;
		padding-left: 9px;
		margin-right: 4px;
		margin-bottom: 4px;
		font-size: 10px;
	}

	.live-stats-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-top: 10px;
	}

	.live-stats {
		font-size: 12px;
		color: #f0d7c1;
	}

</style>
