// Purchase screen payment slideover locators
export const paySlideoverLocators = {
  completePaymentButton: "[name='charge-button']",

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
  cvcInputField: "input[id='Field-cvcInput']"
};