// Purchase screen payment slideover locators
export const paySlideoverLocators = {
  completePaymentButton: "button[name='charge-button']",
  closePaymentButton: "button[name='close-payment']",

  // Non-integrated payment methods
  cashButton: "button[name='add-cash-button']",
  chequeButton: "button[name='add-cheque-button']",
  voucherButton: "button[name='add-voucher-button']",

  // Integrated payment methods
  cardPresentButton: "button[name='add-terminal-button']",
  storedCardButton: "button[name='preferred-card']",

  // Card present options
  terminalPayment: "div[aria-label='TERMINAL']",

  // Virtual terminal options
  virtualTerminalPayment: "div[aria-label='MANUAL']",
  stripeIframe: "iframe[title='Secure payment input frame']",
  cardNumberInput: "input[id='Field-numberInput']",
  expiryDateInput: "input[id='Field-expiryInput']",
  cvcInputField: "input[id='Field-cvcInput']",
  countryInputDropdown: "select[id='Field-countryInput']",
  postalCodeInputField: "input[id='Field-postalCodeInput']", // Required for US (ZIP Code) + CA (Postal Code) + UK (Post Code) virtual terminal payments

  // Manual tipping
  tabTipPercentage: "button[name='tip-percentage-tab']",
  buttonTip10Percent: "button[name='percentage-tip-button-0.1']",
  buttonTip15Percent: "button[name='percentage-tip-button-0.15']",
  tabTipAmount: "button[name='tip-amount-tab']",
  tabTipCustomize: "button[name='tip-customize-tab']",
  buttonConfirmTip: "button[name='confirm-tip']",
  inputTip: "input[name='tip-input']",
  // The below locators are used for manually adding staff amounts (mostly during refund/edit flows)
  buttonAddStaffTip: "button[name='add-staff-member-tip']",
  inputStaffName: "input[name='staff-member']",
  inputTipAmount: "input[name='tip-input']", // Note: intentionally duplicates inputTip selector for semantic clarity in staff tip flows

  // Direct Tipping
  tipPromptToggle: "div[name='show-tip-prompt'] button[role='switch']",
  editStaffTipPrompt: "button[name='edit-staff-tip-prompt']",
  addStaffTipPrompt: "button[name='add-staff-to-tip-prompt']",
  enterStaffNameForPrompt: "input[name='add-new-staff-member-to-tip-prompt']",
  deleteStaffTipPrompt: "button[name='delete-staff']"
};