// Purchase page locators - extracted from voucher.spec.js
export const purchaseLocators = {
  // Navigation elements
  purchaseLink: "#main-nav-purchase-link",
  clientsLink: "#main-nav-clients-link",
  
  // Client search elements
  firstNamePlaceholder: "First name",
  lastNamePlaceholder: "Last name",
  clientButton: "TV TestUser Voucher", // This will be made dynamic
  clientLink: "TestUser",
  
  // Service selection elements
  staffProfileButton: "Dean Winchester's profile",
  servicesButton: "Services",
  colourServiceButton: "Colour",
  permanentServiceButton: "Permanent €60.00 100min",
  
  // Payment elements
  payButton: "Pay",
  skipButton: "Skip",
  tillSelectionButton: "Select till: No till selected",
  till1Option: "Till 1",
  okButton: "OK",
  
  // Voucher payment elements
  voucherBalanceButton: "Voucher - Balance: €",
  voucherSelectionButton: "Voucher - ", // Will be combined with serial number
  voucherOkButton: "Ok",
  completePaymentButton: "Complete Payment",
  
  // Post-payment elements
  closeButton: "Close",
  vouchersTabButton: "Vouchers",
  
  // Role-based selectors for getByRole usage
  roleSelectors: {
    clientButton: { name: "TV TestUser Voucher" },
    staffProfileButton: { name: "Dean Winchester's profile" },
    servicesButton: { name: "Services" },
    colourServiceButton: { name: "Colour" },
    permanentServiceButton: { name: "Permanent €60.00 100min" },
    payButton: { name: "Pay" },
    skipButton: { name: "Skip" },
    tillSelectionButton: { name: "Select till: No till selected" },
    okButton: { name: "OK" },
    voucherBalanceButton: { name: "Voucher - Balance: €" },
    voucherOkButton: { name: "Ok" },
    completePaymentButton: { name: "Complete Payment" },
    closeButton: { name: "Close" },
    vouchersTabButton: { name: "Vouchers" }
  },
  
  // Placeholder-based selectors for getByPlaceholder usage
  placeholderSelectors: {
    firstNameInput: "First name",
    lastNameInput: "Last name"
  },
  
  // Text-based selectors for getByText usage
  textSelectors: {
    till1Option: "Till 1"
  },
  
  // Dynamic selectors (functions that return selectors)
  getClientButton: (firstName, lastName) => `button:has-text("TV ${firstName} ${lastName}")`,
  getVoucherSelectionButton: (serialNumber) => `button:has-text("Voucher - ${serialNumber} €")`,
  getClientLink: (firstName) => `a:has-text("${firstName}")`
};
