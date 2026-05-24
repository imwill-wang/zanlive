import { t } from '../store/i18n'

type RegionAvailabilityCheckOptions = {
	loadingTitleKey?: string
	resultTitleKey?: string
	resultMessageKey?: string
	showResultAsModal?: boolean
}

function resolveRandomDelay(minDelayMs: number, maxDelayMs: number): number {
	if (maxDelayMs <= minDelayMs) {
		return minDelayMs
	}
	return minDelayMs + Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1))
}

export async function runRegionAvailabilityCheck(
	minDelayMs: number = 1000,
	maxDelayMs: number = 5000,
	options: RegionAvailabilityCheckOptions | null = null,
): Promise<boolean> {
	const delayMs = resolveRandomDelay(minDelayMs, maxDelayMs)
	const loadingTitleKey = options != null && options.loadingTitleKey != null ? options.loadingTitleKey : 'common.checkingEnvironment'
	const resultTitleKey = options != null && options.resultTitleKey != null ? options.resultTitleKey : 'recharge.submitConfirmTitle'
	const resultMessageKey = options != null && options.resultMessageKey != null ? options.resultMessageKey : 'recharge.submitUnavailableMessage'
	const showResultAsModal = options != null && options.showResultAsModal == true
	uni.showLoading({
		title: t(loadingTitleKey),
		mask: true,
	})
	await new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve()
		}, delayMs)
	})
	uni.hideLoading()
	if (showResultAsModal) {
		uni.showModal({
			title: t(resultTitleKey),
			content: t(resultMessageKey),
			showCancel: false,
		})
		return false
	}
	uni.showToast({
		title: t(resultMessageKey),
		icon: 'none',
	})
	return false
}
