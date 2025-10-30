/**
 * Booking page locators
 */

export const bookingLocators = {
    // Booking workflow
    viewServicesButton: (page) => page.getByTestId('viewServicesButton'),
    bookButton: (page) => page.getByTestId('bookButton'),
    completeBookingButton: (page) => page.getByTestId('completeBookingButton'),
    singleBookingServiceList: (page) => page.getByTestId('singleBookingServiceList'),
    checkoutPriceBreakdown: (page) => page.getByTestId('checkOutPriceBreakDown'),
    successCloseButton: (page) => page.getByTestId('successCloseButton'),
    skipFeedbackButton: (page) => page.getByTestId('skipFeedbackButton'),
    cancelBookingButton: (page) => page.getByText('Cancel Booking'),
    confirmCancelButton: (page) => page.getByRole('button', { name: "Yes, I'm sure" }),
    homeLink: (page) => page.getByTestId('homeLink'),
    
    // Registration / Account
    fullNameInput: (page) => page.getByTestId('fullNameInput'),
    phoneInput: (page) => page.getByTestId('phoneInput'),
    emailInput: (page) => page.getByTestId('emailInput'),
    passwordInput: (page) => page.getByTestId('passwordInput'),
    confirmPasswordInput: (page) => page.getByTestId('confirmPasswordInput'),
    createAccountButton: (page) => page.getByTestId('createAccountButton'),
    createOneAccountLink: (page) => page.getByText('Create one'),
    createAccountFromMyAccountTab: (page) => page.getByText('My account'),
    createAccountLinkGuest: (page) => page.getByText('Create Account'),
    countryIrelandOption: (page) => page.getByText('Ireland - (353)'),
    countryGermanyOption: (page) => page.getByText('Germany (Deutschland) - (49)'),
    successUserRegistration: (page) => page.getByTestId('successUserRegistration'),
    successUserRegistrationButton: (page) => page.getByTestId('successUserRegistrationButton'),
    
    // Membership
    membershipContainer: (page) => page.getByTestId('ClientMembershipsScreen'),
    membershipsActiveTab: (page) => page.getByRole('tab', { name: 'Active' }),
    membershipsActiveTabServices: (page) => page.getByTestId('servicesTab'),
    membershipsActiveTabSegment: (page) => page.getByTestId('SegmentedControlFirstSegment'),
    buyMembershipButton: (page) => page.getByTestId('buyMembershipButton'),
    buyMembershipDetailsButton: (page) => page.getByTestId('membershipDetailsBuyButton'),
    
    // Contact info
    salonContactInfoRoot: (page) => page.getByTestId('salonContactInfo'),
    branchAddress: (page) => page.getByTestId('salonContactInfo').getByTestId('branchSalonAddress').locator("div[dir='auto']").last(),
    branchPhone: (page) => page.getByTestId('salonContactInfo').getByTestId('branchPhoneNumber').locator("div[dir='auto']").last(),
    branchEmail: (page) => page.getByTestId('salonContactInfo').getByTestId('branchEmailAddress').locator("div[dir='auto']").last(),
    openingTimesRoot: (page) => page.getByTestId('salonContactInfo').getByTestId('branchOpeningTimes'),
    localizedTime: (page) => page.locator("[data-testid='localizedTime']"),
    
    // Stripe payment / iframe
    iframeSelector: "iframe[name^='__privateStripeFrame']",
    termsAndConditions: (page) => page.locator("[data-testid='termsAndConditions']"),
    
    // Vouchers
    addGiftVoucherButton: (page) => page.getByText('Add Gift Voucher'),
    voucherSerialInput: (page) => page.getByTestId('voucherSerialInput'),
    addVoucherButton: (page) => page.getByTestId('addVoucherButton'),
    
    // Used tab locator
    usedTabLocator: (page) => page.locator("xpath=//div[@role='tab' and @data-testid='staffMembersTab' and .//div[normalize-space()='Used']]"),
    
    // Courses
    buyCoursesButton: (page) => page.getByTestId('buyCoursesButton'),
    coursePurchaseRoot: (page) => page.locator('[data-testid="coursePurchase"]'),
    coursePurchaseName: (page) => page.locator('[data-testid="coursePurchaseName"]'),
    coursePurchaseCategory: (page) => page.locator('[data-testid="coursePurchaseCategory"]'),
    coursePurchaseButton: '[data-testid="coursePurchaseButton"]',
    
    // Dynamic locators
    categoryButton: (page, categoryName) => page.getByRole('button', { name: categoryName }),
    serviceItem: (page, serviceName, servicePrice) => page.locator(`//div[@data-testid='serviceItem'][.//div[contains(text(), '${serviceName}')]][.//div[contains(text(), '€${servicePrice.toFixed(2)}')]]`),
    dayLocator: (page, date) => page.getByTestId(`undefined.day_${date}`),
    staffLocator: (page, staffName) => page.locator(`//li[starts-with(@data-testid, 'staff_') and .//div[starts-with(normalize-space(.), '${staffName}')]]`),
    monthSelectButton: (page) => page.getByTestId('monthSelectButton'),
    availabilityCellButton: (page) => page.getByTestId('availabilityCellButton'),
    branchTime: (page) => page.locator("[data-testid='branchTime']"),
    categoryLabel: (page, categoryName) => page.getByLabel(categoryName),
    serviceText: (page, serviceName) => page.getByText(serviceName),
    membershipText: (page, membershipName) => page.getByText(membershipName),
    loyaltyButton: (page) => page.getByTestId("loyalty"),
    clientMembershipBanner: (page, membershipName) => page.locator(`//button[@data-testid='ClientMembershipBanner'][.//div[text()='${membershipName}']]`),
    activeMembershipsItem: (page, membershipName) => page.locator(`xpath=//div[@data-testid='activeMemberships']//li[.//div[normalize-space()='${membershipName}']]`),
    frozenMembershipItem: (page, membershipName) => page.locator(`xpath=//li[.//div[normalize-space()='${membershipName}'] and .//div[normalize-space()='Frozen']]`),
    cancelMembershipButton: (page) => page.locator("//div[normalize-space()='Cancel Membership']"),
    goToMembershipButton: (page) => page.locator("//div[normalize-space()='Go to Membership']"),
    membershipPurchaseLocator: (page, membershipName) => page.locator(`xpath=//div[@data-testid='membershipPurchase'][.//div[@data-testid='membershipPurchaseName' and normalize-space() = '${membershipName}']]//button[@data-testid='membershipPurchaseButton']`),
    membershipDisclaimer: (page) => page.locator('[data-testid="membership-disclaimer"]'),
    acceptDisclaimerCheckbox: (page) => page.locator('[data-testid="accept-disclaimer-checkbox"]'),
    activeCoursesItem: (page, courseName) => page.locator(`xpath=//div[@data-testid='activeCourses']//li[.//div[normalize-space()='${courseName}']]`),
    usedCoursesItem: (page, courseName) => page.locator(`xpath=//div[@data-testid='usedCourses']//li[.//div[text()='${courseName}'] and .//span[normalize-space()='Used']]`)
};
