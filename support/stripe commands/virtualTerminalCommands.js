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
  // This step is hard setting the payment country to avoid needing a postal code > new if clause should resolve this
  // await countryDropdown.selectOption('Puerto Rico');

  // Checks to ensure a post code is not required to a post code is required for the payment
  const countryValue = await countryDropdown.inputValue();
  console.log('Current country code selected is ' + countryValue)
  if (countryValue === 'US') {
    console.log('US ZIP Code required');
    await zipCodeEntry.type('10009')
    } else {
    console.log('US ZIP code not required');
  }

    if (countryValue === 'GB') {
    console.log('UK Postcode required');
    await zipCodeEntry.type('EC1Y 8SY')
    } else {
    console.log('UK Postcode not required');
  }

  if (countryValue === 'CA') {
    console.log('Canadian post code required');
    await zipCodeEntry.type('M5H 2N2')
    } else {
    console.log('Canadian post code not required');
  }

    if (countryValue === 'PR') {
    console.log('Puerto Rican post code required');
    await zipCodeEntry.type('00631')
    } else {
    console.log('Puerto Rican post code not required');
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