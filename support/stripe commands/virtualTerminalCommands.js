import { paySlideoverLocators } from "../../locators/purchase_slideover.locators.js";

export async function submitVirtualTerminalCardDetails(page, {
  cardNumber,
  expirationDate,
  cvcNumber,
  paymentScenario
}) {
  console.log(`📢 simulates submitting card payment details for ${paymentScenario} -->`);
  console.log(`💳 Submitting ${paymentScenario} card details to virtual terminal…`);

  const stripeFrame = page.frameLocator(paySlideoverLocators.stripeIframe)
  const cardNumberEntry = stripeFrame.locator(paySlideoverLocators.cardNumberInput);
  await cardNumberEntry.type(cardNumber);
  const expiryDateEntry = stripeFrame.locator(paySlideoverLocators.expiryDateInput);
  await expiryDateEntry.type(expirationDate);
  const cvcEntry = stripeFrame.locator(paySlideoverLocators.cvcInputField);
  await cvcEntry.type(cvcNumber);
  const countryDropdown = stripeFrame.locator(paySlideoverLocators.countryInputDropdown);
  const zipCodeEntry = stripeFrame.locator(paySlideoverLocators.postalCodeInputField)

  // Checks to ensure a post code is not required to a post code is required for the payment
  const countryValue = await countryDropdown.inputValue();
  console.log('Current country code selected is ' + countryValue)
    const postalCodes = {
    'US': '10009',
    'GB': 'EC1Y 8SY',
    'CA': 'M5H 2N2',
    'PR': '00631'
    };
    if (postalCodes[countryValue]) {
        console.log(`${countryValue} postal code required`);
        await zipCodeEntry.fill(postalCodes[countryValue]);
    } else {
    console.log('Postal code not required for this country');
    }
  
  console.log(`💳 ${paymentScenario} card details successfully entered`);
  await page.locator(paySlideoverLocators.completePaymentButton).click();
  }

  export async function submitVisaCardDetails(page, options = {}) {
    return submitVirtualTerminalCardDetails(page, {
      ...options,
      cardNumber: '4242424242424242',
      expirationDate: '12/30',
      cvcNumber: '600',
      paymentScenario: 'Successful payment',
    });
  }