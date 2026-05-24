<template>
	<view class="page-root" :key="localeVersion">
		<scroll-view class="page-scroll" :scroll-y="true">
			<view class="page-content">
				<view class="section-card recharge-balance-card">
					<text class="section-title">{{ text.balanceTitle }}</text>
					<text class="recharge-balance-value">{{ balanceText }}</text>
					<text class="section-subtitle">{{ text.balanceSubtitle }}</text>
				</view>

				<view class="section-card">
					<text class="section-title">{{ text.amountTitle }}</text>
					<view class="recharge-amount-grid">
						<view
							v-for="item in amountOptions"
							:key="item.id"
							:class="selectedAmountOptionId == item.id ? 'recharge-amount-card-active' : 'recharge-amount-card'"
							@tap="selectAmount(item.id, item.amount)"
						>
							<text :class="selectedAmountOptionId == item.id ? 'recharge-amount-value-active' : 'recharge-amount-value'">{{ item.amount }} {{ currencyName }}</text>
							<text :class="selectedAmountOptionId == item.id ? 'recharge-amount-bonus-active' : 'recharge-amount-bonus'">{{ text.bonusPrefix }} {{ item.bonusText }}</text>
						</view>
						<view :class="isOtherAmountSelected ? 'recharge-amount-card-active' : 'recharge-amount-card'" @tap="selectOtherAmount">
							<text :class="isOtherAmountSelected ? 'recharge-amount-value-active' : 'recharge-amount-value'">{{ text.otherAmount }}</text>
							<text :class="isOtherAmountSelected ? 'recharge-amount-bonus-active' : 'recharge-amount-bonus'">{{ text.customAmountLabel }}</text>
						</view>
					</view>

					<view v-if="isOtherAmountSelected">
						<text class="field-label recharge-custom-label">{{ text.customAmountLabel }}</text>
						<input
							class="field-input recharge-custom-input"
							type="number"
							:value="customAmount"
							:placeholder="text.customAmountPlaceholder"
							@input="handleAmountInput"
						/>
					</view>
				</view>

				<view class="section-card">
					<text class="section-title">{{ text.methodTitle }}</text>
					<view class="recharge-method-grid">
						<view
							v-for="item in paymentMethods"
							:key="item.code"
							:class="selectedPaymentCode == item.code ? 'recharge-method-chip-active' : 'recharge-method-chip'"
							@tap="selectPaymentMethod(item.code)"
						>
							<text :class="resolvePaymentMethodTextClass(item)">{{ resolvePaymentMethodName(item) }}</text>
						</view>
					</view>
					<view class="recharge-method-panel">
						<text class="recharge-method-panel-name">{{ selectedPaymentName }}</text>
						<text class="recharge-method-panel-desc">{{ selectedPaymentDescription }}</text>
					</view>
				</view>

				<view class="section-card">
					<text class="section-title">{{ text.paymentInfoTitle }}</text>
					<view v-for="field in currentPaymentFields" :key="field.key" class="recharge-form-field">
						<text class="field-label">{{ field.label }}</text>
						<input
							v-if="field.type != 'network'"
							class="field-input recharge-payment-input"
							:type="field.type"
							:value="getPaymentFormValue(field.key)"
							:placeholder="field.placeholder"
							@input="updatePaymentFormField(field.key, $event)"
						/>
						<view v-if="field.type == 'network'" class="recharge-network-grid">
							<view
								v-for="network in usdtNetworkOptions"
								:key="network"
								:class="paymentForm.network == network ? 'recharge-network-chip-active' : 'recharge-network-chip'"
								@tap="selectUsdtNetwork(network)"
							>
								<text :class="paymentForm.network == network ? 'recharge-network-chip-text-active' : 'recharge-network-chip-text'">{{ network }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="section-card">
					<text class="section-title">{{ text.summaryTitle }}</text>
					<view class="recharge-summary-row">
						<text class="meta-text">{{ text.selectedAmountLabel }}</text>
						<text class="recharge-summary-value">{{ selectedAmountDisplay }}</text>
					</view>
					<view class="recharge-summary-row recharge-summary-row-last">
						<text class="meta-text">{{ text.selectedMethodLabel }}</text>
						<text class="recharge-summary-value">{{ selectedPaymentName }}</text>
					</view>
					<view class="primary-button recharge-submit-button" @tap="submitRecharge">
						<text class="recharge-submit-text">{{ text.submit }}</text>
					</view>
					<view class="outline-button recharge-contact-button" @tap="openCustomerService">
						<text class="recharge-contact-text">{{ text.contactSupport }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { onShow } from '@dcloudio/uni-app'
	import { computed, reactive, ref } from 'vue'
	import { mockRechargeAmountOptions, mockRechargePaymentMethods } from '../../mock/data'
	import { runRegionAvailabilityCheck } from '../../services/availability'
	import { getBalance } from '../../services/wallet'
	import { applyNavigationTitle, getCurrencyName, getCustomerServiceRoute, i18nStore, t } from '../../store/i18n'
	import type { RechargeAmountOption, RechargePaymentMethod } from '../../types/wallet'

	type RechargeFormField = {
		key: string
		label: string
		placeholder: string
		type: string
	}

	type RechargePageText = {
		balanceTitle: string
		balanceSubtitle: string
		amountTitle: string
		bonusPrefix: string
		otherAmount: string
		customAmountLabel: string
		customAmountPlaceholder: string
		methodTitle: string
		summaryTitle: string
		paymentInfoTitle: string
		selectedAmountLabel: string
		selectedMethodLabel: string
		contactSupport: string
		note: string
		submit: string
		submitConfirmTitle: string
		submitUnavailableMessage: string
		submitContactAction: string
		amountInvalid: string
		submitSuccess: string
		visa: string
		visaDesc: string
		mastercard: string
		mastercardDesc: string
		grabpay: string
		grabpayDesc: string
		dana: string
		danaDesc: string
		gopay: string
		gopayDesc: string
		tt: string
		ttDesc: string
		usdt: string
		usdtDesc: string
		payerName: string
		payerNamePlaceholder: string
		cardNumber: string
		cardNumberPlaceholder: string
		expiryDate: string
		expiryDatePlaceholder: string
		cvv: string
		cvvPlaceholder: string
		phoneNumber: string
		phoneNumberPlaceholder: string
		walletAccount: string
		walletAccountPlaceholder: string
		beneficiaryName: string
		beneficiaryNamePlaceholder: string
		bankName: string
		bankNamePlaceholder: string
		bankAccount: string
		bankAccountPlaceholder: string
		swiftCode: string
		swiftCodePlaceholder: string
		network: string
		walletAddress: string
		walletAddressPlaceholder: string
		transactionHash: string
		transactionHashPlaceholder: string
	}

	const localeVersion = ref(0)
	const text = reactive<RechargePageText>({
		balanceTitle: '',
		balanceSubtitle: '',
		amountTitle: '',
		bonusPrefix: '',
		otherAmount: '',
		customAmountLabel: '',
		customAmountPlaceholder: '',
		methodTitle: '',
		summaryTitle: '',
		paymentInfoTitle: '',
		selectedAmountLabel: '',
		selectedMethodLabel: '',
		contactSupport: '',
		note: '',
		submit: '',
		submitConfirmTitle: '',
		submitUnavailableMessage: '',
		submitContactAction: '',
		amountInvalid: '',
		submitSuccess: '',
		visa: '',
		visaDesc: '',
		mastercard: '',
		mastercardDesc: '',
		grabpay: '',
		grabpayDesc: '',
		dana: '',
		danaDesc: '',
		gopay: '',
		gopayDesc: '',
		tt: '',
		ttDesc: '',
		usdt: '',
		usdtDesc: '',
		payerName: '',
		payerNamePlaceholder: '',
		cardNumber: '',
		cardNumberPlaceholder: '',
		expiryDate: '',
		expiryDatePlaceholder: '',
		cvv: '',
		cvvPlaceholder: '',
		phoneNumber: '',
		phoneNumberPlaceholder: '',
		walletAccount: '',
		walletAccountPlaceholder: '',
		beneficiaryName: '',
		beneficiaryNamePlaceholder: '',
		bankName: '',
		bankNamePlaceholder: '',
		bankAccount: '',
		bankAccountPlaceholder: '',
		swiftCode: '',
		swiftCodePlaceholder: '',
		network: '',
		walletAddress: '',
		walletAddressPlaceholder: '',
		transactionHash: '',
		transactionHashPlaceholder: '',
	})
	const balanceText = ref('0 Coins')
	const currencyName = ref('Coins')
	const amountOptions = ref<RechargeAmountOption[]>(mockRechargeAmountOptions)
	const paymentMethods = ref<RechargePaymentMethod[]>(mockRechargePaymentMethods)
	const selectedAmount = ref(mockRechargeAmountOptions[1].amount)
	const selectedAmountOptionId = ref(mockRechargeAmountOptions[1].id)
	const customAmount = ref('')
	const selectedPaymentCode = ref(mockRechargePaymentMethods[0].code)
	const usdtNetworkOptions = ['TRC20', 'ERC20', 'BEP20']
	const paymentForm = reactive<Record<string, string>>({
		payerName: '',
		cardNumber: '',
		expiryDate: '',
		cvv: '',
		phoneNumber: '',
		walletAccount: '',
		beneficiaryName: '',
		bankName: '',
		bankAccount: '',
		swiftCode: '',
		network: 'TRC20',
		walletAddress: '',
		transactionHash: '',
	})

	function syncLocaleUI(): void {
		localeVersion.value = i18nStore.version
		currencyName.value = getCurrencyName()
		text.balanceTitle = t('recharge.balanceTitle')
		text.balanceSubtitle = t('recharge.balanceSubtitle')
		text.amountTitle = t('recharge.amountTitle')
		text.bonusPrefix = t('recharge.bonusPrefix')
		text.otherAmount = t('recharge.otherAmount')
		text.customAmountLabel = t('recharge.customAmountLabel')
		text.customAmountPlaceholder = t('recharge.customAmountPlaceholder')
		text.methodTitle = t('recharge.methodTitle')
		text.summaryTitle = t('recharge.summaryTitle')
		text.paymentInfoTitle = t('recharge.paymentInfoTitle')
		text.selectedAmountLabel = t('recharge.selectedAmountLabel')
		text.selectedMethodLabel = t('recharge.selectedMethodLabel')
		text.contactSupport = t('recharge.contactSupport')
		text.note = t('recharge.note')
		text.submit = t('recharge.submit')
		text.submitConfirmTitle = t('recharge.submitConfirmTitle')
		text.submitUnavailableMessage = t('recharge.submitUnavailableMessage')
		text.submitContactAction = t('recharge.submitContactAction')
		text.amountInvalid = t('recharge.amountInvalid')
		text.submitSuccess = t('recharge.submitSuccess')
		text.visa = t('recharge.visa')
		text.visaDesc = t('recharge.visaDesc')
		text.mastercard = t('recharge.mastercard')
		text.mastercardDesc = t('recharge.mastercardDesc')
		text.grabpay = t('recharge.grabpay')
		text.grabpayDesc = t('recharge.grabpayDesc')
		text.dana = t('recharge.dana')
		text.danaDesc = t('recharge.danaDesc')
		text.gopay = t('recharge.gopay')
		text.gopayDesc = t('recharge.gopayDesc')
		text.tt = t('recharge.tt')
		text.ttDesc = t('recharge.ttDesc')
		text.usdt = t('recharge.usdt')
		text.usdtDesc = t('recharge.usdtDesc')
		text.payerName = t('recharge.payerName')
		text.payerNamePlaceholder = t('recharge.payerNamePlaceholder')
		text.cardNumber = t('recharge.cardNumber')
		text.cardNumberPlaceholder = t('recharge.cardNumberPlaceholder')
		text.expiryDate = t('recharge.expiryDate')
		text.expiryDatePlaceholder = t('recharge.expiryDatePlaceholder')
		text.cvv = t('recharge.cvv')
		text.cvvPlaceholder = t('recharge.cvvPlaceholder')
		text.phoneNumber = t('recharge.phoneNumber')
		text.phoneNumberPlaceholder = t('recharge.phoneNumberPlaceholder')
		text.walletAccount = t('recharge.walletAccount')
		text.walletAccountPlaceholder = t('recharge.walletAccountPlaceholder')
		text.beneficiaryName = t('recharge.beneficiaryName')
		text.beneficiaryNamePlaceholder = t('recharge.beneficiaryNamePlaceholder')
		text.bankName = t('recharge.bankName')
		text.bankNamePlaceholder = t('recharge.bankNamePlaceholder')
		text.bankAccount = t('recharge.bankAccount')
		text.bankAccountPlaceholder = t('recharge.bankAccountPlaceholder')
		text.swiftCode = t('recharge.swiftCode')
		text.swiftCodePlaceholder = t('recharge.swiftCodePlaceholder')
		text.network = t('recharge.network')
		text.walletAddress = t('recharge.walletAddress')
		text.walletAddressPlaceholder = t('recharge.walletAddressPlaceholder')
		text.transactionHash = t('recharge.transactionHash')
		text.transactionHashPlaceholder = t('recharge.transactionHashPlaceholder')
		applyNavigationTitle(t('nav.recharge'))
	}

	function loadBalance(): void {
		getBalance().then((data) => {
			balanceText.value = data.balance.toString() + ' ' + getCurrencyName()
		}).catch(() => {
			balanceText.value = '0 ' + getCurrencyName()
		})
	}

	function selectAmount(optionId: number, amount: number): void {
		selectedAmountOptionId.value = optionId
		selectedAmount.value = amount
		customAmount.value = ''
	}

	function selectOtherAmount(): void {
		selectedAmountOptionId.value = 0
		selectedAmount.value = 0
		customAmount.value = ''
	}

	function handleAmountInput(event: any): void {
		const value = event != null && event.detail != null && typeof event.detail.value == 'string' ? event.detail.value : ''
		customAmount.value = value
		const parsed = parseFloat(value)
		selectedAmount.value = isNaN(parsed) ? 0 : parsed
	}

	function selectPaymentMethod(code: string): void {
		selectedPaymentCode.value = code
	}

	function getPaymentFormValue(key: string): string {
		const value = paymentForm[key]
		return typeof value == 'string' ? value : ''
	}

	function updatePaymentFormField(key: string, event: any): void {
		const value = event != null && event.detail != null && typeof event.detail.value == 'string' ? event.detail.value : ''
		paymentForm[key] = value
	}

	function selectUsdtNetwork(network: string): void {
		paymentForm.network = network
	}

	function resolvePaymentMethodName(item: RechargePaymentMethod): string {
		if (item.code == 'visa') { return text.visa }
		if (item.code == 'mastercard') { return text.mastercard }
		if (item.code == 'grabpay') { return text.grabpay }
		if (item.code == 'dana') { return text.dana }
		if (item.code == 'gopay') { return text.gopay }
		if (item.code == 'tt') { return text.tt }
		if (item.code == 'usdt') { return text.usdt }
		return item.name
	}

	function resolvePaymentMethodDescription(item: RechargePaymentMethod): string {
		if (item.code == 'visa') { return text.visaDesc }
		if (item.code == 'mastercard') { return text.mastercardDesc }
		if (item.code == 'grabpay') { return text.grabpayDesc }
		if (item.code == 'dana') { return text.danaDesc }
		if (item.code == 'gopay') { return text.gopayDesc }
		if (item.code == 'tt') { return text.ttDesc }
		if (item.code == 'usdt') { return text.usdtDesc }
		return item.description
	}

	function resolvePaymentMethodTextClass(item: RechargePaymentMethod): string {
		if (item.code == 'tt') {
			return selectedPaymentCode.value == item.code ? 'recharge-method-chip-text-active recharge-method-chip-text-tight' : 'recharge-method-chip-text recharge-method-chip-text-tight'
		}
		return selectedPaymentCode.value == item.code ? 'recharge-method-chip-text-active' : 'recharge-method-chip-text'
	}

	const currentPaymentFields = computed(() => {
		if (selectedPaymentCode.value == 'visa' || selectedPaymentCode.value == 'mastercard') {
			return [
				{ key: 'payerName', label: text.payerName, placeholder: text.payerNamePlaceholder, type: 'text' },
				{ key: 'cardNumber', label: text.cardNumber, placeholder: text.cardNumberPlaceholder, type: 'number' },
				{ key: 'expiryDate', label: text.expiryDate, placeholder: text.expiryDatePlaceholder, type: 'text' },
				{ key: 'cvv', label: text.cvv, placeholder: text.cvvPlaceholder, type: 'number' },
			] as RechargeFormField[]
		}
		if (selectedPaymentCode.value == 'grabpay' || selectedPaymentCode.value == 'dana' || selectedPaymentCode.value == 'gopay') {
			return [
				{ key: 'payerName', label: text.payerName, placeholder: text.payerNamePlaceholder, type: 'text' },
				{ key: 'phoneNumber', label: text.phoneNumber, placeholder: text.phoneNumberPlaceholder, type: 'number' },
				{ key: 'walletAccount', label: text.walletAccount, placeholder: text.walletAccountPlaceholder, type: 'text' },
			] as RechargeFormField[]
		}
		if (selectedPaymentCode.value == 'tt') {
			return [
				{ key: 'beneficiaryName', label: text.beneficiaryName, placeholder: text.beneficiaryNamePlaceholder, type: 'text' },
				{ key: 'bankName', label: text.bankName, placeholder: text.bankNamePlaceholder, type: 'text' },
				{ key: 'bankAccount', label: text.bankAccount, placeholder: text.bankAccountPlaceholder, type: 'text' },
				{ key: 'swiftCode', label: text.swiftCode, placeholder: text.swiftCodePlaceholder, type: 'text' },
			] as RechargeFormField[]
		}
		return [
			{ key: 'network', label: text.network, placeholder: '', type: 'network' },
			{ key: 'walletAddress', label: text.walletAddress, placeholder: text.walletAddressPlaceholder, type: 'text' },
			{ key: 'transactionHash', label: text.transactionHash, placeholder: text.transactionHashPlaceholder, type: 'text' },
		] as RechargeFormField[]
	})

	const selectedAmountDisplay = computed(() => {
		if (selectedAmount.value <= 0) {
			return '--'
		}
		return selectedAmount.value.toString() + ' ' + currencyName.value
	})

	const selectedPaymentName = computed(() => {
		for (let i = 0; i < paymentMethods.value.length; i++) {
			const item = paymentMethods.value[i]
			if (item.code == selectedPaymentCode.value) {
				return resolvePaymentMethodName(item)
			}
		}
		return '--'
	})

	const selectedPaymentDescription = computed(() => {
		for (let i = 0; i < paymentMethods.value.length; i++) {
			const item = paymentMethods.value[i]
			if (item.code == selectedPaymentCode.value) {
				return resolvePaymentMethodDescription(item)
			}
		}
		return ''
	})

	const isOtherAmountSelected = computed(() => {
		return selectedAmountOptionId.value == 0
	})

	function openCustomerService(): void {
		uni.navigateTo({
			url: getCustomerServiceRoute(),
		})
	}

	function submitRecharge(): void {
		if (selectedAmount.value <= 0) {
			uni.showToast({
				title: text.amountInvalid,
				icon: 'none',
			})
			return
		}
		runRegionAvailabilityCheck(1000, 5000, {
			loadingTitleKey: 'recharge.checkingEnvironment',
			resultTitleKey: 'recharge.submitConfirmTitle',
			resultMessageKey: 'recharge.submitUnavailableMessage',
			showResultAsModal: true,
		})
	}

	onShow(() => {
		syncLocaleUI()
		loadBalance()
	})
</script>

<style>
	.recharge-balance-card {
		padding-bottom: 20px;
	}

	.recharge-balance-value {
		font-size: 34px;
		font-weight: 700;
		color: #1c1613;
		margin-top: 10px;
	}

	.recharge-amount-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
		margin-top: 16px;
	}

	.recharge-amount-card {
		width: calc((100% - 12px) / 2);
		height: 78px;
		border-radius: 18px;
		background-color: #f7efe6;
		border-width: 1px;
		border-style: solid;
		border-color: transparent;
		padding: 14px 12px;
		box-sizing: border-box;
		margin-bottom: 12px;
	}

	.recharge-amount-card-active {
		width: calc((100% - 12px) / 2);
		height: 78px;
		border-radius: 18px;
		background-color: #fff4ea;
		border-width: 1px;
		border-style: solid;
		border-color: #ff6b8f;
		padding: 14px 12px;
		box-sizing: border-box;
		margin-bottom: 12px;
	}

	.recharge-amount-value {
		font-size: 16px;
		font-weight: 700;
		color: #1c1613;
	}

	.recharge-amount-value-active {
		font-size: 16px;
		font-weight: 700;
		color: #d33a66;
	}

	.recharge-amount-bonus {
		display: block;
		font-size: 12px;
		color: #8a6d54;
		margin-top: 6px;
	}

	.recharge-amount-bonus-active {
		display: block;
		font-size: 12px;
		color: #d33a66;
		margin-top: 6px;
	}

	.recharge-custom-label {
		margin-top: 8px;
	}

	.recharge-custom-input {
		margin-top: 6px;
		margin-bottom: 0px;
	}

	.recharge-form-field {
		margin-top: 14px;
	}

	.recharge-payment-input {
		margin-top: 6px;
		margin-bottom: 0px;
	}

	.recharge-method-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: flex-start;
		margin-top: 14px;
	}

	.recharge-method-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		width: auto;
		min-height: 42px;
		padding: 0 10px;
		border-radius: 14px;
		background-color: #f7efe6;
		margin-right: 8px;
		margin-bottom: 8px;
		box-sizing: border-box;
	}

	.recharge-method-chip-active {
		display: flex;
		align-items: center;
		justify-content: center;
		width: auto;
		min-height: 42px;
		padding: 0 10px;
		border-radius: 14px;
		background-color: #fff4ea;
		border-width: 1px;
		border-style: solid;
		border-color: #ff6b8f;
		margin-right: 8px;
		margin-bottom: 8px;
		box-sizing: border-box;
	}

	.recharge-method-chip-text {
		font-size: 13px;
		font-weight: 600;
		color: #7a5543;
		line-height: 16px;
		text-align: center;
	}

	.recharge-method-chip-text-active {
		font-size: 13px;
		font-weight: 700;
		color: #d33a66;
		line-height: 16px;
		text-align: center;
	}

	.recharge-method-chip-text-tight {
		font-size: 12px;
		letter-spacing: 0.2px;
	}

	.recharge-method-panel {
		display: flex;
		flex-direction: column;
		border-radius: 18px;
		background-color: #f7efe6;
		padding: 14px 16px;
		margin-top: 14px;
	}

	.recharge-method-panel-name {
		font-size: 15px;
		font-weight: 700;
		color: #1c1613;
	}

	.recharge-method-panel-desc {
		display: block;
		font-size: 12px;
		line-height: 18px;
		color: #8a6d54;
		margin-top: 6px;
		white-space: normal;
	}

	.recharge-summary-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin-top: 14px;
	}

	.recharge-summary-row-last {
		margin-top: 10px;
	}

	.recharge-summary-value {
		font-size: 14px;
		font-weight: 700;
		color: #1c1613;
	}

	.recharge-contact-button {
		width: 100%;
		margin-top: 18px;
	}

	.recharge-contact-text {
		font-size: 14px;
		font-weight: 600;
		color: #7a5543;
	}

	.recharge-submit-button {
		width: 100%;
		margin-top: 14px;
	}

	.recharge-submit-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff9f2;
	}

	.recharge-network-grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 8px;
	}

	.recharge-network-chip {
		padding: 10px 14px;
		border-radius: 999px;
		background-color: #f7efe6;
		margin-right: 10px;
		margin-bottom: 10px;
	}

	.recharge-network-chip-active {
		padding: 10px 14px;
		border-radius: 999px;
		background-color: #fff4ea;
		border-width: 1px;
		border-style: solid;
		border-color: #ff6b8f;
		margin-right: 10px;
		margin-bottom: 10px;
	}

	.recharge-network-chip-text {
		font-size: 13px;
		font-weight: 600;
		color: #7a5543;
	}

	.recharge-network-chip-text-active {
		font-size: 13px;
		font-weight: 600;
		color: #d33a66;
	}
</style>
