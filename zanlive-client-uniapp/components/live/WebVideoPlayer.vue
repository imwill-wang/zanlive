<template>
	<view class="web-video-player" :playerData="playerData" :change:playerData="playerBridge.render">
		<!-- #ifdef APP-PLUS || H5 -->
		<div :id="playerDomId" class="web-video-player-dom"></div>
		<!-- #endif -->
	</view>
</template>

<script>
export default {
	name: 'WebVideoPlayer',
	props: {
		src: {
			type: String,
			default: '',
		},
		autoplay: {
			type: Boolean,
			default: true,
		},
		muted: {
			type: Boolean,
			default: false,
		},
		controls: {
			type: Boolean,
			default: true,
		},
		objectFit: {
			type: String,
			default: 'cover',
		},
		reloadKey: {
			type: Number,
			default: 0,
		},
		standbyMode: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['play', 'waiting', 'stalled', 'stats', 'error'],
	data() {
		return {
			playerDomId: 'room-web-player-' + Date.now().toString(36) + Math.random().toString(36).slice(2),
		}
	},
	computed: {
		playerData() {
			return {
				playerDomId: this.playerDomId,
				src: this.src,
				autoplay: this.autoplay,
				muted: this.muted,
				controls: this.controls,
				objectFit: this.objectFit,
				reloadKey: this.reloadKey,
				standbyMode: this.standbyMode,
			}
		},
	},
	methods: {
		handleRenderPlay() {
			this.$emit('play')
		},
		handleRenderWaiting() {
			this.$emit('waiting')
		},
		handleRenderStalled() {
			this.$emit('stalled')
		},
		handleRenderStats(detail) {
			this.$emit('stats', {
				detail: detail && typeof detail === 'object' ? detail : {},
			})
		},
		handleRenderError(detail) {
			this.$emit('error', {
				detail: {
					errCode: detail && detail.code ? detail.code : 0,
					errMsg: detail && detail.message ? detail.message : 'Video playback failed.',
				},
			})
		},
	},
}
</script>

<script lang="renderjs" module="playerBridge">
import flvjs from '../../node_modules/flv.js/dist/flv.min.js'

export default {
	data() {
		return {
			video: null,
			flvPlayer: null,
			standbyCover: null,
			currentDomId: '',
			currentReloadKey: -1,
		}
	},
	methods: {
		isFlvSource(src) {
			if (!src) {
				return false
			}
			return src.toLowerCase().indexOf('.flv') >= 0
		},
		destroyFlvPlayer() {
			if (!this.flvPlayer) {
				return
			}
			try {
				this.flvPlayer.pause()
			} catch (e) {}
			try {
				this.flvPlayer.unload()
			} catch (e) {}
			try {
				this.flvPlayer.detachMediaElement()
			} catch (e) {}
			try {
				this.flvPlayer.destroy()
			} catch (e) {}
			this.flvPlayer = null
		},
		bindEvents(video, ownerInstance) {
			if (video.__uniBound) {
				return
			}
			video.__uniBound = true
			video.addEventListener('play', () => {
				ownerInstance.callMethod('handleRenderPlay')
			})
			video.addEventListener('playing', () => {
				ownerInstance.callMethod('handleRenderPlay')
			})
			video.addEventListener('loadeddata', () => {
				ownerInstance.callMethod('handleRenderPlay')
			})
			video.addEventListener('waiting', () => {
				ownerInstance.callMethod('handleRenderWaiting')
			})
			video.addEventListener('stalled', () => {
				ownerInstance.callMethod('handleRenderStalled')
			})
			video.addEventListener('error', () => {
				const mediaError = video.error
				ownerInstance.callMethod('handleRenderError', {
					code: mediaError && mediaError.code ? mediaError.code : 0,
					message: mediaError && mediaError.message ? mediaError.message : 'Video playback failed.',
				})
			})
		},
		resolveFlvErrorMessage(errorType, errorDetail, errorInfo) {
			const parts = []
			if (typeof errorType === 'string' && errorType.length > 0) {
				parts.push(errorType)
			}
			if (typeof errorDetail === 'string' && errorDetail.length > 0) {
				parts.push(errorDetail)
			}
			if (errorInfo != null) {
				if (typeof errorInfo === 'string' && errorInfo.length > 0) {
					parts.push(errorInfo)
				} else if (typeof errorInfo === 'object') {
					try {
						parts.push(JSON.stringify(errorInfo))
					} catch (e) {}
				}
			}
			if (parts.length == 0) {
				return 'Video playback failed.'
			}
			return parts.join(' | ')
		},
		bindFlvPlayerEvents(player, ownerInstance) {
			if (!player || player.__uniBridgeBound) {
				return
			}
			player.__uniBridgeBound = true
			if (flvjs && flvjs.Events && flvjs.Events.STATISTICS_INFO) {
				player.on(flvjs.Events.STATISTICS_INFO, (info) => {
					ownerInstance.callMethod('handleRenderStats', info && typeof info === 'object' ? info : {})
				})
			}
			if (flvjs && flvjs.Events && flvjs.Events.ERROR) {
				player.on(flvjs.Events.ERROR, (errorType, errorDetail, errorInfo) => {
					ownerInstance.callMethod('handleRenderError', {
						code: 0,
						message: this.resolveFlvErrorMessage(errorType, errorDetail, errorInfo),
					})
				})
			}
		},
		ensureStandbyCover(mount, playerData) {
			mount.style.position = 'relative'
			mount.style.width = '100%'
			mount.style.height = '100%'
			if (!this.standbyCover || this.standbyCover.parentElement !== mount) {
				if (this.standbyCover && this.standbyCover.parentElement) {
					try {
						this.standbyCover.parentElement.removeChild(this.standbyCover)
					} catch (e) {}
				}
				this.standbyCover = null
				const cover = document.createElement('div')
				cover.className = 'web-video-standby-cover'
				cover.style.position = 'absolute'
				cover.style.left = '0'
				cover.style.top = '0'
				cover.style.width = '100%'
				cover.style.height = '100%'
				cover.style.backgroundColor = '#000000'
				cover.style.zIndex = '3'
				cover.style.pointerEvents = 'none'
				mount.appendChild(cover)
				this.standbyCover = cover
			}
			this.syncStandbyCover(playerData)
		},
		syncStandbyCover(playerData) {
			const standby = !!playerData.standbyMode
			if (this.standbyCover) {
				this.standbyCover.style.display = standby ? 'block' : 'none'
			}
			if (this.video) {
				this.video.style.opacity = standby ? '0' : '1'
			}
		},
		ensureVideo(playerData, ownerInstance) {
			const mount = document.getElementById(playerData.playerDomId)
			if (!mount) {
				return null
			}
			if (this.video && this.currentDomId === playerData.playerDomId) {
				this.ensureStandbyCover(mount, playerData)
				return this.video
			}
			mount.innerHTML = ''
			this.standbyCover = null
			const video = document.createElement('video')
			video.className = 'web-video-uni-native'
			if (!document.getElementById('web-video-player-chrome-hide')) {
				const styleNode = document.createElement('style')
				styleNode.id = 'web-video-player-chrome-hide'
				styleNode.textContent =
					'video.web-video-uni-native::-webkit-media-controls{display:none!important}' +
					'video.web-video-uni-native::-webkit-media-controls-enclosure{display:none!important}' +
					'video.web-video-uni-native::-webkit-media-controls-panel{display:none!important}' +
					'video.web-video-uni-native::-webkit-media-controls-play-button{display:none!important}' +
					'video.web-video-uni-native::-webkit-media-controls-start-playback-button{display:none!important}'
				document.head.appendChild(styleNode)
			}
			video.style.width = '100%'
			video.style.height = '100%'
			video.style.display = 'block'
			video.style.backgroundColor = '#000000'
			video.style.objectFit = playerData.objectFit || 'cover'
			video.setAttribute('playsinline', 'true')
			video.setAttribute('webkit-playsinline', 'true')
			video.setAttribute('x5-playsinline', 'true')
			video.setAttribute('x5-video-player-type', 'h5')
			video.setAttribute('preload', 'auto')
			video.setAttribute('disablePictureInPicture', 'true')
			video.style.position = 'relative'
			video.style.zIndex = '1'
			mount.appendChild(video)
			this.video = video
			this.currentDomId = playerData.playerDomId
			this.bindEvents(video, ownerInstance)
			this.ensureStandbyCover(mount, playerData)
			return video
		},
		applyPlayerData(video, playerData) {
			video.controls = !!playerData.controls
			video.autoplay = !!playerData.autoplay
			video.muted = !!playerData.muted
			video.style.objectFit = playerData.objectFit || 'cover'
		},
		attemptAutoplay(video) {
			const playResult = video.play()
			if (!playResult || typeof playResult.catch !== 'function') {
				return
			}
			playResult.catch(() => {
				if (video.muted) {
					return
				}
				video.muted = true
				const retry = video.play()
				if (retry && typeof retry.catch === 'function') {
					retry.catch(() => {})
				}
			})
		},
		loadFlv(video, playerData, ownerInstance) {
			this.destroyFlvPlayer()
			if (!flvjs || typeof flvjs.isSupported !== 'function' || !flvjs.isSupported()) {
				return false
			}
			const player = flvjs.createPlayer({
				type: 'flv',
				url: playerData.src,
				isLive: true,
			})
			player.attachMediaElement(video)
			player.load()
			this.flvPlayer = player
			this.bindFlvPlayerEvents(player, ownerInstance)
			if (playerData.autoplay) {
				this.attemptAutoplay(video)
			}
			return true
		},
		render(playerData, oldValue, ownerInstance) {
			const video = this.ensureVideo(playerData, ownerInstance)
			if (!video) {
				return
			}
			this.applyPlayerData(video, playerData)
			const shouldReload = this.currentReloadKey !== playerData.reloadKey || video.getAttribute('data-src') !== playerData.src
			if (shouldReload) {
				this.currentReloadKey = playerData.reloadKey
				video.setAttribute('data-src', playerData.src || '')
				if (!playerData.src) {
					this.destroyFlvPlayer()
					video.pause()
					video.removeAttribute('src')
					video.load()
				} else if (this.isFlvSource(playerData.src)) {
					video.pause()
					video.removeAttribute('src')
					video.load()
					if (!this.loadFlv(video, playerData, ownerInstance)) {
						ownerInstance.callMethod('handleRenderError', {
							code: 0,
							message: 'FLV playback is not supported in current WebView.',
						})
					}
				} else {
					this.destroyFlvPlayer()
					video.pause()
					video.src = playerData.src
					video.load()
					if (playerData.autoplay) {
						this.attemptAutoplay(video)
					}
				}
			}
			this.syncStandbyCover(playerData)
		},
	},
	beforeUnmount() {
		this.destroyFlvPlayer()
		if (this.video) {
			this.video.pause()
			this.video.removeAttribute('src')
			this.video.load()
			this.video = null
		}
		this.standbyCover = null
	},
}
</script>

<style scoped>
	.web-video-player {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: #000;
	}

	.web-video-player-dom {
		width: 100%;
		height: 100%;
		background-color: #000000;
	}
</style>
