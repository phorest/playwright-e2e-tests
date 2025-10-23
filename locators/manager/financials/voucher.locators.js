// Voucher page locators - extracted from voucher.spec.js
export const voucherLocators = {
  // Navigation elements
  managerLink: "#main-nav-manager-link",
  vouchersLink: '#vouchers',
  clientsLink: "#main-nav-clients-link",
  
  // Voucher form elements
  addVoucherButton: 'button:has-text("Add Voucher")',
  serialTextbox: { name: "Serial" },
  searchClientButton: 'button:has-text("Search for a client")',
  firstNamePlaceholder: 'input[placeholder="First name, ID or Treatcard"]',
  lastNamePlaceholder: 'input[placeholder="Last name"]',
  clientSelectButton: 'button:has-text("Test Voucher 0891231243 test@")',
  issueDateTextbox: { name: "Issue Date Open calendar" },
  notesTextbox: { name: "Notes" },
  saveButton: 'button:has-text("Save")',
  
  // Calculator elements
  originalBalanceLabel: 'label:has-text("Original Balance Open")',
  calculatorButton: 'button[name="calculator-button"]',
  calculatorButton2: 'button:has-text("2")',
  calculatorButton0: 'button:has-text("0")',
  calculatorOkButton: 'button:has-text("Ok")',
  
  // Client search elements
  clientSearchbox: { name: "First name, ID or Treatcard" },
  clientLastNameSearchbox: { name: "Last name" },
  clientSelectLink: '.text-primary.text-sm',
  vouchersTabButton: 'button:has-text("Vouchers")',
  
  // Success messages
  successMessage: 'text="Successfully saved!"',
  voucherAddedMessage: 'text="New voucher has been added."',
  
  // Voucher table columns
  originalBalanceColumn: '[data-column-name="Original Balance"]',
  remainingBalanceColumn: '[data-column-name="Remaining Balance"]',
  serialColumn: '[data-column-name="Serial"]',
  
  // Date picker elements
  datePicker: '[data-date]',
  
  // Role-based selectors for getByRole usage
  roleSelectors: {
    serialTextbox: { name: "Serial" },
    issueDateTextbox: { name: "Issue Date Open calendar" },
    notesTextbox: { name: "Notes" },
    clientSearchbox: { name: "First name, ID or Treatcard" },
    clientLastNameSearchbox: { name: "Last name" },
    vouchersTabButton: { name: "Vouchers" }
  },
  
  // Placeholder-based selectors for getByPlaceholder usage
  placeholderSelectors: {
    firstNameInput: "First name, ID or Treatcard",
    lastNameInput: "Last name"
  },
  
  // Text-based selectors for getByText usage
  textSelectors: {
    successMessage: "Successfully saved!",
    voucherAddedMessage: "New voucher has been added."
  }
};
