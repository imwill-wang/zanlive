<script>
import { initializeLocale, t } from './store/i18n'

let firstBackTime = 0
let backHandlerAttached = false

function handleAndroidBackButton() {
	const pages = getCurrentPages()
	if (pages.length > 1) {
		uni.navigateBack()
		return
	}

	const now = Date.now()
	if (now - firstBackTime < 2000) {
		plus.runtime.quit()
		return
	}

	firstBackTime = now
	uni.showToast({
		title: t('app.exitAgain'),
		icon: 'none',
		position: 'bottom',
	})

	setTimeout(() => {
		if (Date.now() - firstBackTime >= 2000) {
			firstBackTime = 0
		}
	}, 2000)
}

function attachAndroidBackHandler() {
	if (backHandlerAttached) {
		return
	}
	if (typeof plus === 'undefined' || plus.os.name !== 'Android') {
		return
	}

	plus.key.addEventListener('backbutton', handleAndroidBackButton, false)
	backHandlerAttached = true
}

	export default {
		onLaunch() {
			initializeLocale()
			// #ifdef APP-PLUS
			document.addEventListener('plusready', attachAndroidBackHandler, false)
			attachAndroidBackHandler()
			// #endif
		},
		onShow() {},
		onHide() {},
	}
</script>

<style>
	page {
		background-color: #f4e7d9;
	}

	.page-root {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100vh;
		min-height: 100vh;
		overflow: hidden;
		box-sizing: border-box;
		background-color: #f4e7d9;
	}

	.page-scroll {
		flex: 1;
		height: 100%;
		min-height: 0;
	}

	.page-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 100%;
		padding-top: 24px;
		padding-right: 20px;
		padding-bottom: 24px;
		padding-left: 20px;
		box-sizing: border-box;
	}

	.section-card {
		display: flex;
		flex-direction: column;
		background-color: #fff9f2;
		border-radius: 20px;
		padding-top: 18px;
		padding-right: 18px;
		padding-bottom: 18px;
		padding-left: 18px;
		margin-bottom: 16px;
	}

	.section-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: #1c1613;
	}

	.section-subtitle {
		font-size: 13px;
		color: #8a6d54;
		margin-top: 6px;
	}

	.primary-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 44px;
		border-radius: 22px;
		background-color: #1c1613;
	}

	.secondary-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 42px;
		border-radius: 21px;
		background-color: #ead8c2;
	}

	.outline-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 42px;
		border-radius: 21px;
		border-width: 1px;
		border-style: solid;
		border-color: #c9ab8f;
		background-color: #fff9f2;
	}

	.field-label {
		font-size: 13px;
		color: #6f5544;
		margin-bottom: 8px;
	}

	.field-input {
		height: 44px;
		border-radius: 14px;
		background-color: #f7efe6;
		padding-top: 0px;
		padding-right: 14px;
		padding-bottom: 0px;
		padding-left: 14px;
		font-size: 15px;
		color: #1c1613;
		margin-bottom: 14px;
	}

	.meta-text {
		font-size: 12px;
		color: #8a6d54;
	}

	.empty-text {
		font-size: 14px;
		color: #8a6d54;
		text-align: center;
		padding-top: 32px;
		padding-bottom: 32px;
	}

	.tag-chip {
		line-height: 28px;
		padding-top: 0px;
		padding-right: 12px;
		padding-bottom: 0px;
		padding-left: 12px;
		border-radius: 14px;
		background-color: #efe1d3;
		color: #5a4334;
		font-size: 12px;
		margin-right: 8px;
		margin-bottom: 8px;
	}
</style>
