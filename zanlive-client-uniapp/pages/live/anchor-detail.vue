<template>
	<view class="page-root" :key="localeVersion">
		<scroll-view class="page-scroll" :scroll-y="true">
			<view class="anchor-detail-page">
				<view class="anchor-hero-shell">
					<image class="anchor-hero-image" :src="heroImage" mode="aspectFill"></image>
					<view class="anchor-hero-overlay"></view>
				</view>

				<view class="anchor-summary-card section-card">
					<view class="anchor-summary-row">
						<image class="anchor-summary-avatar" :src="anchorAvatar" mode="aspectFill"></image>
						<view class="anchor-summary-copy">
							<view class="anchor-summary-name-row">
								<text class="anchor-summary-name">{{ anchorName }}</text>
							</view>
							<text class="anchor-summary-intro">{{ introText }}</text>
						</view>
					</view>

					<view class="anchor-follow-row">
						<view :class="isFollowing ? 'anchor-follow-button-active' : 'anchor-follow-button'" :style="followLoading ? 'opacity:0.72;' : ''" @tap="toggleFollow">
							<text :class="isFollowing ? 'anchor-follow-text-active' : 'anchor-follow-text'">{{ followButtonText }}</text>
						</view>
					</view>

					<view v-if="tagList.length > 0" class="anchor-tags-row">
						<text v-for="tag in tagList" :key="tag" class="tag-chip">{{ tag }}</text>
					</view>
				</view>

				<view class="anchor-section-card section-card">
					<view class="anchor-section-tab-row">
						<text class="anchor-section-tab-text">{{ photosTabText }}</text>
						<view class="anchor-section-tab-indicator"></view>
					</view>

					<view v-if="galleryGroups.length == 0" class="anchor-empty-wrap">
						<text class="empty-text">{{ emptyPhotosText }}</text>
					</view>

					<view v-else>
						<view v-for="group in galleryGroups" :key="group.dateText" class="anchor-photo-group">
							<text class="anchor-photo-group-date">{{ group.dateText }}</text>
							<view class="anchor-photo-grid">
								<image
									v-for="(item, index) in group.images"
									:key="item + index.toString()"
									class="anchor-photo-item"
									:src="item"
									mode="aspectFill"
									@tap="previewImages(resolvePreviewIndex(group.startIndex + index))"
								></image>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { mockAnchors } from '../../mock/data'
	import { applyNavigationTitle, i18nStore, t } from '../../store/i18n'
	import { followAnchor, getAnchorFollowState, readCachedAnchorFollowState, unfollowAnchor } from '../../services/friend'
	import { resolveUnknownErrorMessage } from '../../services/http'
	import type { AnchorCard } from '../../types/live'

	type AnchorDetailView = {
		anchorId: number
		anchorName: string
		anchorAvatar: string
		mainImage: string
		gallery: string[]
		intro: string
		tags: string[]
		isLiving: boolean
		roomId: number
		liveTitle: string
		onlineCount: number
		heat: number
	}

	type GalleryGroup = {
		dateText: string
		images: string[]
		startIndex: number
	}

	const localeVersion = ref(0)
	const currentDetailView = ref<AnchorDetailView | null>(null)
	const anchorId = ref(0)
	const anchorName = ref('')
	const anchorAvatar = ref('/static/logo.png')
	const heroImage = ref('/static/logo.png')
	const galleryList = ref<string[]>([])
	const galleryGroups = ref<GalleryGroup[]>([])
	const tagList = ref<string[]>([])
	const introText = ref('')
	const photosTabText = ref('')
	const emptyPhotosText = ref('')
	const followText = ref('')
	const followingText = ref('')
	const followButtonText = ref('')
	const followLoading = ref(false)
	const isFollowing = ref(false)
	const galleryDateSeed = ['2026-04-14 15:17:00', '2026-01-19 11:00:38', '2025-12-03 20:08:16']

	function decodeJsonArray(text: string | null | undefined): string[] {
		if (text == null || text.length == 0) {
			return []
		}
		try {
			const parsed = JSON.parse(decodeURIComponent(text)) as string[]
			return Array.isArray(parsed) ? parsed : []
		} catch (_error) {
			return []
		}
	}

	function parseNumber(value: string | undefined): number {
		if (value == null || value.length == 0) {
			return 0
		}
		const parsed = parseInt(value, 10)
		return isNaN(parsed) ? 0 : parsed
	}

	function resolveMockAnchor(nextAnchorId: number): AnchorCard | null {
		for (let i = 0; i < mockAnchors.length; i++) {
			if (mockAnchors[i].anchorId == nextAnchorId) {
				return mockAnchors[i]
			}
		}
		return null
	}

	function buildDetailView(options: Record<string, string>): AnchorDetailView {
		const nextAnchorId = parseNumber(options['anchorId'])
		const fallback = resolveMockAnchor(nextAnchorId)
		const gallery = decodeJsonArray(options['gallery'])
		const tags = decodeJsonArray(options['tags'])
		const mainImageValue = options['mainImage'] != null && options['mainImage'].length > 0
			? decodeURIComponent(options['mainImage'])
			: (fallback != null ? fallback.mainImage : '/static/logo.png')
		const anchorAvatarValue = options['anchorAvatar'] != null && options['anchorAvatar'].length > 0
			? decodeURIComponent(options['anchorAvatar'])
			: (fallback != null ? fallback.anchorAvatar : '/static/logo.png')
		const finalGallery = gallery.length > 0 ? gallery : (fallback != null ? [...fallback.gallery] : [])
		return {
			anchorId: nextAnchorId > 0 ? nextAnchorId : (fallback != null ? fallback.anchorId : 0),
			anchorName: options['anchorName'] != null && options['anchorName'].length > 0 ? decodeURIComponent(options['anchorName']) : (fallback != null ? fallback.anchorName : t('common.anchor')),
			anchorAvatar: anchorAvatarValue,
			mainImage: mainImageValue,
			gallery: finalGallery,
			intro: options['intro'] != null && options['intro'].length > 0 ? decodeURIComponent(options['intro']) : (fallback != null ? fallback.intro : ''),
			tags: tags.length > 0 ? tags : (fallback != null ? [...fallback.tags] : []),
			isLiving: options['isLiving'] == '1' || (options['isLiving'] == null && fallback != null ? fallback.isLiving : false),
			roomId: parseNumber(options['roomId']) > 0 ? parseNumber(options['roomId']) : (fallback != null ? fallback.roomId : 0),
			liveTitle: options['liveTitle'] != null && options['liveTitle'].length > 0 ? decodeURIComponent(options['liveTitle']) : (fallback != null ? fallback.liveTitle : ''),
			onlineCount: parseNumber(options['onlineCount']) > 0 ? parseNumber(options['onlineCount']) : (fallback != null ? fallback.onlineCount : 0),
			heat: parseNumber(options['heat']) > 0 ? parseNumber(options['heat']) : (fallback != null ? fallback.heat : 0),
		}
	}

	function applyDetailView(view: AnchorDetailView): void {
		currentDetailView.value = view
		anchorId.value = view.anchorId
		anchorName.value = view.anchorName
		anchorAvatar.value = view.anchorAvatar.length > 0 ? view.anchorAvatar : '/static/logo.png'
		heroImage.value = view.mainImage.length > 0 ? view.mainImage : (view.gallery.length > 0 ? view.gallery[0] : anchorAvatar.value)
		galleryList.value = view.gallery.length > 0 ? view.gallery : (heroImage.value.length > 0 ? [heroImage.value] : [])
		galleryGroups.value = buildGalleryGroups(galleryList.value)
		tagList.value = view.tags
		introText.value = view.intro.length > 0 ? view.intro : t('anchorDetail.introFallback')
	}

	function buildGalleryGroups(images: string[]): GalleryGroup[] {
		const groups: GalleryGroup[] = []
		if (images.length == 0) {
			return groups
		}
		let currentIndex = 0
		let seedIndex = 0
		while (currentIndex < images.length) {
			const nextImages = images.slice(currentIndex, currentIndex + 4)
			groups.push({
				dateText: galleryDateSeed[seedIndex % galleryDateSeed.length],
				images: nextImages,
				startIndex: currentIndex,
			})
			currentIndex = currentIndex + nextImages.length
			seedIndex = seedIndex + 1
		}
		return groups
	}

	function resolvePreviewIndex(index: number): number {
		if (index < 0) {
			return 0
		}
		if (index >= galleryList.value.length) {
			return galleryList.value.length - 1
		}
		return index
	}

	function syncLocaleText(): void {
		localeVersion.value = i18nStore.version
		photosTabText.value = t('anchorDetail.photosTab')
		emptyPhotosText.value = t('anchorDetail.emptyPhotos')
		followText.value = t('common.follow')
		followingText.value = t('anchorDetail.following')
		followButtonText.value = isFollowing.value ? followingText.value : followText.value
		applyNavigationTitle(t('anchorDetail.title'))
	}

	function previewImages(index: number): void {
		if (galleryList.value.length == 0) {
			return
		}
		uni.previewImage({
			urls: galleryList.value,
			current: galleryList.value[index],
		})
	}

	async function loadFollowState(): Promise<void> {
		if (anchorId.value <= 0) {
			return
		}
		const cachedState = readCachedAnchorFollowState(anchorId.value)
		if (cachedState != null) {
			isFollowing.value = cachedState
			followButtonText.value = isFollowing.value ? followingText.value : followText.value
		}
		const state = await getAnchorFollowState(anchorId.value)
		isFollowing.value = state.isFollowing
		followButtonText.value = isFollowing.value ? followingText.value : followText.value
	}

	async function toggleFollow(): Promise<void> {
		if (followLoading.value || anchorId.value <= 0) {
			return
		}
		followLoading.value = true
		try {
			const state = isFollowing.value ? await unfollowAnchor(anchorId.value) : await followAnchor(anchorId.value)
			isFollowing.value = state.isFollowing
			followButtonText.value = isFollowing.value ? followingText.value : followText.value
			uni.showToast({
				title: isFollowing.value ? t('anchorDetail.followSuccess') : t('anchorDetail.unfollowSuccess'),
				icon: 'none',
			})
		} catch (error) {
			uni.showToast({
				title: resolveUnknownErrorMessage(error, t('anchorDetail.followError')),
				icon: 'none',
			})
		} finally {
			followLoading.value = false
		}
	}

	onLoad((options) => {
		syncLocaleText()
		applyDetailView(buildDetailView(options as Record<string, string>))
		loadFollowState()
	})

	onShow(() => {
		syncLocaleText()
		if (currentDetailView.value != null) {
			applyDetailView(currentDetailView.value)
		}
		loadFollowState()
	})
</script>

<style>
	.anchor-detail-page {
		min-height: 100%;
		background-color: #f4e7d9;
		padding-bottom: 28px;
	}

	.anchor-hero-shell {
		position: relative;
		height: 23vh;
		min-height: 168px;
		max-height: 208px;
		overflow: hidden;
		border-bottom-left-radius: 34px;
		border-bottom-right-radius: 34px;
	}

	.anchor-hero-image {
		width: 100%;
		height: 100%;
	}

	.anchor-hero-overlay {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-image: linear-gradient(180deg, rgba(20, 14, 13, 0.08) 0%, rgba(20, 14, 13, 0.14) 28%, rgba(20, 14, 13, 0.18) 46%, rgba(244, 231, 217, 0.9) 100%);
	}

	.anchor-summary-card {
		margin-top: -82px;
		margin-right: 14px;
		margin-left: 14px;
		position: relative;
		z-index: 2;
		border-top-left-radius: 28px;
		border-top-right-radius: 28px;
		border-bottom-left-radius: 22px;
		border-bottom-right-radius: 22px;
		padding-top: 22px;
		padding-right: 20px;
		padding-bottom: 20px;
		padding-left: 20px;
		box-shadow: 0 14px 34px rgba(74, 46, 32, 0.12);
	}

	.anchor-summary-row {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
	}

	.anchor-summary-avatar {
		width: 64px;
		height: 64px;
		border-radius: 32px;
		background-color: #ead8c8;
		flex-shrink: 0;
		border-width: 3px;
		border-style: solid;
		border-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 8px 22px rgba(40, 22, 17, 0.14);
	}

	.anchor-summary-copy {
		flex: 1;
		min-width: 0;
		margin-left: 18px;
		padding-top: 6px;
	}

	.anchor-summary-name-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
	}

	.anchor-summary-name {
		font-size: 25px;
		font-weight: 700;
		color: #1c1613;
		letter-spacing: 0.5px;
	}

	.anchor-follow-row {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		margin-top: 18px;
	}

	.anchor-follow-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 40px;
		min-width: 124px;
		padding-left: 24px;
		padding-right: 24px;
		border-radius: 20px;
		background-color: #ff335f;
		flex-shrink: 0;
	}

	.anchor-follow-button-active {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 40px;
		min-width: 124px;
		padding-left: 24px;
		padding-right: 24px;
		border-radius: 20px;
		background-color: #f7efe6;
		border-width: 1px;
		border-style: solid;
		border-color: rgba(94, 73, 59, 0.12);
		flex-shrink: 0;
	}

	.anchor-follow-text {
		font-size: 12px;
		font-weight: 700;
		color: #fff9f2;
	}

	.anchor-follow-text-active {
		font-size: 12px;
		font-weight: 700;
		color: #5e493b;
	}

	.anchor-summary-intro {
		font-size: 13px;
		line-height: 21px;
		color: #7c6251;
		margin-top: 10px;
	}

	.anchor-tags-row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 18px;
	}

	.anchor-section-card {
		margin-top: 6px;
		margin-right: 14px;
		margin-left: 14px;
		border-radius: 22px;
		padding-top: 20px;
		padding-right: 20px;
		padding-bottom: 20px;
		padding-left: 20px;
	}

	.anchor-section-tab-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 18px;
	}

	.anchor-section-tab-text {
		font-size: 16px;
		font-weight: 700;
		color: #1c1613;
	}

	.anchor-section-tab-indicator {
		width: 36px;
		height: 6px;
		border-radius: 3px;
		background-color: #d9a4ef;
		margin-top: 10px;
	}

	.anchor-empty-wrap {
		padding-top: 12px;
	}

	.anchor-photo-group {
		margin-bottom: 22px;
	}

	.anchor-photo-group-date {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: #b7a08b;
		margin-bottom: 14px;
	}

	.anchor-photo-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.anchor-photo-item {
		width: calc((100% - 12px) / 3);
		height: 120px;
		border-radius: 14px;
		background-color: #ead8c8;
		margin-bottom: 10px;
	}
</style>
