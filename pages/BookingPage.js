/**
 * BookingPage - JavaScript version of pages/BookingPage.py
 */

import { expect } from '@playwright/test';
import { AppointmentBuilder } from '../builders/AppointmentBuilder.js';
import { getTimeout } from '../config/timeouts.js';

export class BookingPage {
    constructor(page) {
        this.page = page;
        this.selectedTime = null;
        this.selectedService = null;
        this.appointment = null;

        // Booking workflow
        this.viewServicesButton = page.getByTestId('viewServicesButton');
        this.bookButton = page.getByTestId('bookButton');
        this.completeBookingButton = page.getByTestId('completeBookingButton');
        this._submitButton = this.completeBookingButton;
        this.singleBookingServiceList = page.getByTestId('singleBookingServiceList');
        this.checkoutPriceBreakdown = page.getByTestId('checkOutPriceBreakDown');
        this.successCloseButton = page.getByTestId('successCloseButton');
        this.skipFeedbackButton = page.getByTestId('skipFeedbackButton');
        this.cancelBookingButton = page.getByText('Cancel Booking');
        this.confirmCancelButton = page.getByRole('button', { name: "Yes, I'm sure" });

        // Registration / Account
        this.fullNameInput = page.getByTestId('fullNameInput');
        this.phoneInput = page.getByTestId('phoneInput');
        this.emailInput = page.getByTestId('emailInput');
        this.passwordInput = page.getByTestId('passwordInput');
        this.confirmPasswordInput = page.getByTestId('confirmPasswordInput');
        this.createAccountButton = page.getByTestId('createAccountButton');
        this.createOneAccountLink = page.getByText('Create one');
        this.createAccountFromMyAccountTab = page.getByText('My account');
        this.createAccountLinkGuest = page.getByText('Create Account');
        this.countryIrelandOption = page.getByText('Ireland - (353)');
        this.countryGermanyOption = page.getByText('Germany (Deutschland) - (49)');
        this.successUserRegistration = page.getByTestId('successUserRegistration');
        this.successUserRegistrationButton = page.getByTestId('successUserRegistrationButton');

        // Membership
        this.membershipContainer = page.getByTestId('ClientMembershipsScreen');
        this.membershipsActiveTab = page.getByRole('tab', { name: 'Active' });
        this.membershipsActiveTabServices = page.getByTestId('servicesTab');
        this.membershipsActiveTabSegment = page.getByTestId('SegmentedControlFirstSegment');
        this.buyMembershipButton = page.getByTestId('buyMembershipButton');
        this.buyMembershipDetailsButton = page.getByTestId('membershipDetailsBuyButton');

        // Contact info
        this.salonContactInfoRoot = page.getByTestId('salonContactInfo');
        this.branchAddress = this.salonContactInfoRoot
            .getByTestId('branchSalonAddress')
            .locator("div[dir='auto']").last();
        this.branchPhone = this.salonContactInfoRoot
            .getByTestId('branchPhoneNumber')
            .locator("div[dir='auto']").last();
        this.branchEmail = this.salonContactInfoRoot
            .getByTestId('branchEmailAddress')
            .locator("div[dir='auto']").last();
        this.openingTimesRoot = this.salonContactInfoRoot.getByTestId('branchOpeningTimes');

        // Stripe payment / iframe
        this._iframeSelector = "iframe[name^='__privateStripeFrame']";
        this.TERMS_SELECTOR = 'div:has-text("Bookings can be cancelled or changed online up to 0 hours in advance of your visit with no extra charge.")';

        // Vouchers
        this.addGiftVoucherButton = page.getByText('Add Gift Voucher');
        this.voucherSerialInput = page.getByTestId('voucherSerialInput');
        this.addVoucherButton = page.getByTestId('addVoucherButton');

        // Used tab locator
        this.usedTabLocator = page.locator(
            "xpath=//div[@role='tab' and @data-testid='staffMembersTab' and .//div[normalize-space()='Used']]"
        );

        // Courses
        this.buyCoursesButton = page.getByTestId('buyCoursesButton');
        this.coursePurchaseRoot = page.locator('[data-testid="coursePurchase"]');
        this.coursePurchaseName = page.locator('[data-testid="coursePurchaseName"]');
        this.coursePurchaseCategory = page.locator('[data-testid="coursePurchaseCategory"]');

        // Derived public URLs (host + slug)
        const { clientCoursesUrl, clientMembershipUrl } = this._derivePublicUrls();
        this.clientCoursesUrl = clientCoursesUrl;
        this.clientMembershipUrl = clientMembershipUrl;
    }

    /**
     * Derive public URLs from current page URL
     * @returns {Object} Object with clientCoursesUrl and clientMembershipUrl
     */
    _derivePublicUrls() {
        const url = this.page.url();

        // Try to match /book/salons/<slug> pattern
        let match = url.match(/^(https?:\/\/[^\/]+)\/book\/salons\/([^\/?#]+)/);
        if (!match) {
            // Try to match /salon/<slug>/... pattern
            match = url.match(/^(https?:\/\/[^\/]+)\/salon\/([^\/?#]+)/);
        }

        if (!match) {
            throw new Error(`Cannot derive salon slug from URL: ${url}`);
        }

        const [, host, slug] = match;
        const clientCoursesUrl = `${host}/salon/${slug}/book/client-courses`;
        const clientMembershipUrl = `${host}/salon/${slug}/account/memberships`;

        return { clientCoursesUrl, clientMembershipUrl };
    }

    /**
     * Get category button
     * @param {Category} category - Category object
     * @returns {Object} Locator
     */
    getCategoryButton(category) {
        return this.page.getByRole('button', { name: category.name });
    }

    /**
     * Get service element
     * @param {string} serviceName - Service name
     * @param {number} servicePrice - Service price
     * @returns {Object} Locator
     */
    getServiceElement(serviceName, servicePrice) {
        return this.page.locator(
            `//div[@data-testid='serviceItem'][.//div[contains(text(), '${serviceName}')]][.//div[contains(text(), '€${servicePrice.toFixed(2)}')]]`
        );
    }

    /**
     * Get day locator
     * @param {string} date - Date string
     * @returns {Object} Locator
     */
    getDayLocator(date) {
        return this.page.getByTestId(`undefined.day_${date}`);
    }

    /**
     * Get staff selector
     * @param {string} staffName - Staff name
     * @returns {Object} Locator
     */
    getStaffSelector(staffName) {
        return this.page.getByTestId(`staff_${staffName}`);
    }

    /**
     * Get branch time
     * @param {Object} locator - Locator object
     * @returns {Object} Locator
     */
    getBranchTime(locator) {
        return locator.locator("[data-testid='branchTime']");
    }

    /**
     * Get opening times for day
     * @param {string} day - Day of the week
     * @returns {Promise<Array>} Opening and closing times
     */
    async _getOpeningTimesForDay(day) {
        const row = this.openingTimesRoot.getByText(day).first().locator('..');
        const times = row.locator("[data-testid='localizedTime']");
        const openTime = await times.nth(0).innerText();
        const closeTime = await times.nth(1).innerText();
        return [openTime.trim(), closeTime.trim()];
    }

    /**
     * Verify contact info
     * @param {ContactInfo} expected - Expected contact info
     */
    async verifyContactInfo(expected) {
        console.log('  Verifying salon contact information ...');

        const actualAddress = await this.branchAddress.innerText();
        console.log(`   • Address   | expected: '${expected.address}' | actual: '${actualAddress}'`);
        await expect(this.branchAddress).toHaveText(expected.address);

        const actualPhone = await this.branchPhone.innerText();
        console.log(`   • Phone     | expected: '${expected.phone}' | actual: '${actualPhone}'`);
        await expect(this.branchPhone).toHaveText(expected.phone);

        const actualEmail = await this.branchEmail.innerText();
        console.log(`   • Email     | expected: '${expected.email}' | actual: '${actualEmail}'`);
        await expect(this.branchEmail).toHaveText(expected.email);

        console.log('   • Opening hours');
        for (const [day, [expOpen, expClose]] of Object.entries(expected.openingHours)) {
            const [actOpen, actClose] = await this._getOpeningTimesForDay(day);
            console.log(`       - ${day.padEnd(9)}: expected ${expOpen} – ${expClose} | actual ${actOpen} – ${actClose}`);
            if (actOpen !== expOpen || actClose !== expClose) {
                throw new Error(`${day}: expected ${expOpen}-${expClose}, got ${actOpen}-${actClose}`);
            }
        }
        console.log('  Contact information verified successfully.\n');
    }

    /**
     * Select service and book
     * @param {Category} category - Category to select
     */
    async selectServiceAndBook(category) {
        if (await this.page.getByTestId('homeLink').isVisible()) {
            await this.page.getByTestId('homeLink').click();
            await this.viewServicesButton.click();
        } else {
            await this.viewServicesButton.click();
        }
        await this.getCategoryButton(category).click();

        const service = category.services[0];
        this.selectedService = service;
        await this.getServiceElement(service.name, service.price).click();

        await expect(this.page.getByLabel(category.name)).toBeVisible();
        await this.bookButton.click();
    }

    /**
     * Select staff and time
     * @param {Staff} staff - Staff member
     * @param {Service} service - Optional service
     */
    async selectStaffAndTime(staff, service = null) {
        if (service) {
            this.selectedService = service;
            await this.page.getByText(service.name).click();
            await this.page.getByTestId('bookButton').click();
        }

        const firstNameOnly = staff.name.split(' ')[0];
        const staffLocator = this.page.locator(
            `//li[starts-with(@data-testid, 'staff_') and .//div[starts-with(normalize-space(.), '${firstNameOnly}')]]`
        );
        await staffLocator.click();

        const monthButton = this.page.getByTestId('monthSelectButton');
        await monthButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await monthButton.click();

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayLocator = this.getDayLocator(todayStr);
        await expect(dayLocator).toBeVisible({ timeout: 5000 });
        await dayLocator.click();

        const slots = this.page.getByTestId('availabilityCellButton');
        const slotCount = await slots.count();

        for (let i = 0; i < slotCount; i++) {
            try {
                const slot = slots.nth(i);
                await expect(slot).toBeVisible({ timeout: 2000 });
                this.selectedTime = await this.getBranchTime(slot).innerText();
                await slot.click();
                console.log(` Selected slot: ${this.selectedTime}`);
                break;
            } catch (error) {
                continue;
            }
        }

        if (!this.selectedTime) {
            throw new Error('❌ No available time slots found!');
        }

        this.appointment = new AppointmentBuilder()
            .withDate(today)
            .withTime(this.selectedTime)
            .withStaff(staff.name)
            .withService(this.selectedService.name)
            .withPrice(this.selectedService.price)
            .build();
        console.log(`  Appointment cached → ${this.appointment}`);
    }

    /**
     * Create account
     * @param {User} user - User object
     */
    async createAccount(user) {
        await this.createOneAccountLink.click();
        await this.fullNameInput.fill(user.name);
        await this.countryIrelandOption.click();
        await this.countryGermanyOption.click();
        await this.phoneInput.fill(user.phone);
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
        await this.createAccountButton.click();
    }

    /**
     * Create account from my account
     * @param {User} user - User object
     */
    async createAccountFromMyAccount(user) {
        await this.createAccountFromMyAccountTab.first().click();
        await this.createAccountLinkGuest.click();
        await this.fullNameInput.fill(user.name);
        await this.countryIrelandOption.click();
        await this.countryGermanyOption.click();
        await this.phoneInput.fill(user.phone);
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
        await this.createAccountButton.click();
    }

    /**
     * Verify registration success
     */
    async verifyRegistrationSuccess() {
        await this.successUserRegistration.locator('path').first().waitFor({ state: 'visible' });
        await this.successUserRegistrationButton.click();
    }

    /**
     * Verify booking
     * @param {string} serviceName - Service name
     * @param {Staff} staff - Staff member
     * @param {number} servicePrice - Service price
     */
    async verifyBooking(serviceName, staff, servicePrice) {
        console.log(` Verifying booking for selected time: ${this.selectedTime}`);
        if (!this.selectedTime) {
            throw new Error('❌ No time selected during booking to verify!');
        }

        const firstNameOnly = staff.name.split(' ')[0];
        const expectedText = `${serviceName}${this.selectedTime} with ${firstNameOnly}€${servicePrice.toFixed(2)}`;
        await this.singleBookingServiceList.waitFor({ state: 'visible' });
        const serviceListText = await this.singleBookingServiceList.textContent();
        if (!serviceListText.includes(expectedText)) {
            throw new Error(`Service list does not contain expected text: ${expectedText}`);
        }

        const priceText = await this.checkoutPriceBreakdown.textContent();
        if (!priceText.includes(servicePrice.toFixed(2))) {
            throw new Error(`Price breakdown does not contain expected price: ${servicePrice.toFixed(2)}`);
        }

        // Use exact selectors like in Python version
        await this.successCloseButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await this.successCloseButton.click();

        await this.skipFeedbackButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await this.skipFeedbackButton.click();
    }

    /**
     * Cancel booking
     */
    async cancelBooking() {
        await this.cancelBookingButton.click();
        await this.confirmCancelButton.click();
    }

    /**
     * Wait for Stripe iframes
     * @param {number} expected - Expected number of iframes
     * @param {number} timeout - Timeout in milliseconds
     */
    async _waitForStripeIframes(expected = 3, timeout = 30000) {
        await this.page.waitForFunction(
            `() => document.querySelectorAll("${this._iframeSelector}").length >= ${expected}`,
            { timeout }
        );
    }

    /**
     * Find frame with specific field
     * @param {string} role - Field role
     * @param {string} name - Field name
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Object} Frame locator
     */
    async _findFrameWith(role, name, timeout = 5000) {
        const count = await this.page.locator(this._iframeSelector).count();
        for (let idx = 0; idx < count; idx++) {
            const frame = this.page.frameLocator(this._iframeSelector).nth(idx);
            const locator = frame.getByRole(role, { name });
            try {
                await locator.waitFor({ state: 'visible', timeout });
                return frame;
            } catch (error) {
                continue;
            }
        }
        throw new Error(`Iframe with field "${name}" not found after waiting`);
    }

    /**
     * Scroll to cancellation terms
     */
    async scrollToCancellationTerms() {
        const terms = this.page.locator("[data-testid='termsAndConditions']");
        await terms.waitFor({ state: 'attached', timeout: getTimeout('ELEMENT_VISIBLE') });
        await terms.first().scrollIntoViewIfNeeded();
        console.log(" Scrolled to cancellation terms (data-testid=termsAndConditions).");
    }

    /**
     * Fill card details
     * @param {Card} card - Card object
     * @param {Voucher} voucher - Optional voucher
     */
    async fillCard(card, voucher = null) {
        console.log(' fill_card started');

        if (voucher) {
            console.log(` Adding gift voucher with serial: ${voucher.serial}`);
            await this.addGiftVoucherButton.click();
            await this.voucherSerialInput.click();
            await this.voucherSerialInput.fill(voucher.serial);
            await this.addVoucherButton.click();
            await this.page.waitForTimeout(1500);
            await this._waitForStripeIframes();
        }

        await this.scrollToCancellationTerms();

        console.log(` Filling expiry date: ${card.expiry}`);
        const expiryFrame = await this._findFrameWith('textbox', 'Expiration date MM / YY');
        const expiryInput = expiryFrame.getByRole('textbox', { name: 'Expiration date MM / YY' });
        await expiryInput.fill('');
        await expiryInput.type(card.expiry, { delay: 100 });

        console.log(` Filling CVC: ${card.cvc}`);
        const cvcFrame = await this._findFrameWith('textbox', 'Security code');
        const cvcInput = cvcFrame.getByRole('textbox', { name: 'Security code' });
        await cvcInput.fill('');
        await cvcInput.type(card.cvc, { delay: 100 });

        console.log(` Selecting country: ${card.country}`);
        const frameLocators = this.page.frameLocator(this._iframeSelector);
        const iframeCount = await this.page.locator(this._iframeSelector).count();
        for (let idx = 0; idx < iframeCount; idx++) {
            const frame = frameLocators.nth(idx);
            try {
                const countrySelect = frame.getByLabel('Country');
                await countrySelect.waitFor({ state: 'visible', timeout: 1000 });
                await countrySelect.selectOption(card.country);
                console.log(` Country selected in iframe #${idx}`);
                break;
            } catch (error) {
                continue;
            }
        }

        console.log(` Filling card number: ${card.number}`);
        const numberFrame = await this._findFrameWith('textbox', 'Card number');
        const numberInput = numberFrame.getByRole('textbox', { name: 'Card number' });
        await numberInput.fill('');
        await numberInput.type(card.number, { delay: 100 });

        // Try different selectors for complete booking button
        const completeButton = this.page.getByRole('button', { name: /complete|book|submit/i }).first();
        await completeButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await completeButton.click();
    }

    /**
     * Verify membership summary
     * @param {Membership} membership - Membership to verify
     * @param {string} billingDate - Optional billing date
     */
    async verifyMembershipSummary(membership, billingDate = null) {
        if (billingDate === null) {
            const today = new Date();
            billingDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });
        await this.page.getByText(membership.name).click();

        await this.membershipContainer.getByText(membership.name).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership name is visible: ${membership.name}`);

        await this.membershipContainer.getByText(`Monthly fee of €${membership.recurringFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified monthly fee is visible: €${membership.recurringFee.toFixed(2)}`);

        await this.membershipContainer.getByText(`Sign up fee of €${membership.signupFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified sign-up fee is visible: €${membership.signupFee.toFixed(2)}`);

        await this.membershipContainer.getByText("Active").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified membership status is 'Active'");

        await this.membershipContainer.getByText(`€${membership.recurringFee.toFixed(2)} per month`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified 'per month' €${membership.recurringFee.toFixed(2)} text is visible`);

        await this.membershipContainer.getByText(`Member since ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership start date is visible: ${billingDate}`);

        await this.membershipContainer.getByText(`Next billing date is ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified next billing date is visible: ${billingDate}`);

        await this.membershipContainer.getByText("No card found for this membership").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified billing method text is visible (card ending in ...)");

        await this.page.getByText(`€${membership.creditAmount.toFixed(2)} Credit On Services And Products`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified credit is visible: €${membership.creditAmount.toFixed(2)} Credit On Services`);

        await this.page.getByText(`${membership.discountAmount}% Discount on Services`, { exact: true }).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified service discount is visible: ${membership.discountAmount}% Discount on Services`);
    }

    /**
     * Verify membership from loyalty
     * @param {Membership} membership - Membership to verify
     * @param {string} billingDate - Optional billing date
     */
    async verifyMembershipFromLoyalty(membership, billingDate = null) {
        if (billingDate === null) {
            const today = new Date();
            billingDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        await this.page.getByTestId("loyalty").click();

        const bannerXpath = `//button[@data-testid='ClientMembershipBanner'][.//div[text()='${membership.name}']]`;
        await this.page.locator(bannerXpath).click();

        const container = this.page.locator("div").filter({ hasText: membership.name }).first();

        await container.getByText(membership.name).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership name by loyalty is visible: ${membership.name}`);

        await container.getByText(`Monthly fee of €${membership.recurringFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified monthly fee by loyalty is visible: €${membership.recurringFee.toFixed(2)}`);

        await container.getByText(`Sign up fee of €${membership.signupFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified sign-up fee by loyalty is visible: €${membership.signupFee.toFixed(2)}`);

        await container.getByText("Active").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified membership status by loyalty is 'Active'");

        await container.getByText(`€${membership.recurringFee.toFixed(2)} per month`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified 'per month by loyalty' €${membership.recurringFee.toFixed(2)} text is visible`);

        await container.getByText(`Member since ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership start date by loyalty is visible: ${billingDate}`);

        await container.getByText(`Next billing date is ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified next billing date by loyalty is visible: ${billingDate}`);

        await container.getByText("No card found for this membership").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified billing method text by loyalty is visible (card ending in ...)");
    }

    /**
     * Verify membership frozen visible
     * @param {Membership} membership - Membership to verify
     */
    async verifyMembershipFrozenVisible(membership) {
        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });

        const xpathActive = `//div[@data-testid='activeMemberships']//li[.//div[normalize-space()='${membership.name}']]`;
        const activeMembershipItem = this.page.locator(`xpath=${xpathActive}`);
        await activeMembershipItem.waitFor({ state: 'hidden', timeout: getTimeout('ELEMENT_VISIBLE') });

        await this.usedTabLocator.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await this.usedTabLocator.click();
        await this.page.waitForTimeout(500);

        const xpathFrozen = `//li[.//div[normalize-space()='${membership.name}'] and .//div[normalize-space()='Frozen']]`;
        const frozenMembershipItem = this.page.locator(`xpath=${xpathFrozen}`);
        await frozenMembershipItem.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
    }

    /**
     * Cancel a membership from the list and verify 'Cancelled' status on details.
     * @param {Membership} membership - Membership object
     */
    async cancelMembershipAndVerify(membership) {
        console.log(` Cancelling membership '${membership.name}' and verifying...`);

        // Open list and ensure Active tab
        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });

        // Try to click one of the Active tabs (different selectors exist in different contexts)
        for (const tab of [
            this.membershipsActiveTab,
            this.membershipsActiveTabServices,
            this.membershipsActiveTabSegment,
        ]) {
            try {
                await tab.waitFor({ state: 'visible', timeout: 3000 });
                await tab.click();
                break;
            } catch (e) {
                continue;
            }
        }

        // Open membership by name
        const membershipTile = this.page.getByText(membership.name, { exact: true }).first();
        await membershipTile.click();

        // Cancel flow
        const cancelMembershipButton = this.page.locator("//div[normalize-space()='Cancel Membership']").first();
        await expect(cancelMembershipButton).toBeVisible({ timeout: 10000 });
        await cancelMembershipButton.click();

        await this.page.waitForTimeout(500);
        const cancelMembershipConfirmButton = this.page.locator("//div[normalize-space()='Cancel Membership']").nth(1);
        await cancelMembershipConfirmButton.waitFor({ state: 'visible', timeout: 3000 });
        await cancelMembershipConfirmButton.click();

        // Go to details
        const goToMembershipButton = this.page.locator("//div[normalize-space()='Go to Membership']").first();
        await expect(goToMembershipButton).toBeVisible({ timeout: 10000 });
        await goToMembershipButton.click();

        // Verify details and 'Cancelled/Canceled' status
        await expect(this.membershipContainer.getByText(membership.name).first()).toBeVisible({ timeout: 10000 });

        const statusCancelled = this.membershipContainer.locator(
            "xpath=(.//*[normalize-space()='Cancelled' or normalize-space()='Canceled'])[1]"
        ).first();
        await expect(statusCancelled).toBeVisible({ timeout: 10000 });

        console.log(` Verified membership '${membership.name}' is Cancelled.`);
    }

    /**
     * Purchase course from list
     * @param {Course} course - Course to purchase
     */
    async purchaseCourseFromList(course) {
        console.log(`📚 Purchasing course from list: ${course.name}`);
        await this.buyCoursesButton.click();

        const courseLocator = this.coursePurchaseRoot.filter({
            has: this.coursePurchaseName.filter({ hasText: course.name })
        }).filter({
            has: this.coursePurchaseCategory.filter({ hasText: course.categoryName })
        });

        await courseLocator.locator('[data-testid="coursePurchaseButton"]').click();
        console.log(`✅ Course selected and purchase initiated: ${course.name}`);
    }

    /**
     * Pay with voucher
     * @param {Voucher} voucher - Voucher to use
     * @param {Card} card - Card details
     */
    async payWithVoucher(voucher, card) {
        console.log(`🎟️ Applying voucher with serial: ${voucher.serial}`);
        await this.addGiftVoucherButton.click();
        await this.voucherSerialInput.fill(voucher.serial);
        await this.addVoucherButton.click();
        console.log('✅ Voucher submitted');

        await this.page.waitForTimeout(1000);
        let fillCard = false;

        const iframeElements = this.page.locator(this._iframeSelector);
        const iframeCount = await iframeElements.count();
        for (let i = 0; i < iframeCount; i++) {
            const frame = this.page.frameLocator(this._iframeSelector).nth(i);
            try {
                await frame.getByRole('textbox', { name: 'Security code' }).waitFor({ timeout: 1000 });
                fillCard = true;
                console.log('🧾 Detected Stripe iframe, proceeding to fill card details');
                break;
            } catch (e) {
                continue;
            }
        }

        if (fillCard) {
            await this.scrollToCancellationTerms();

            const expiryFrame = await this._findFrameWith('textbox', 'Expiration date MM / YY');
            const expiryInput = expiryFrame.getByRole('textbox', { name: 'Expiration date MM / YY' });
            await expiryInput.fill('');
            await expiryInput.type(card.expiry, { delay: 100 });

            const cvcFrame = await this._findFrameWith('textbox', 'Security code');
            const cvcInput = cvcFrame.getByRole('textbox', { name: 'Security code' });
            await cvcInput.fill('');
            await cvcInput.type(card.cvc, { delay: 100 });

            for (let idx = 0; idx < iframeCount; idx++) {
                const frame = this.page.frameLocator(this._iframeSelector).nth(idx);
                try {
                    const countrySelect = frame.getByLabel('Country');
                    await countrySelect.waitFor({ state: 'visible', timeout: 1000 });
                    await countrySelect.selectOption(card.country);
                    console.log(` Country selected in iframe #${idx}`);
                    break;
                } catch (e) {
                    continue;
                }
            }

            const numberFrame = await this._findFrameWith('textbox', 'Card number');
            const numberInput = numberFrame.getByRole('textbox', { name: 'Card number' });
            await numberInput.fill('');
            await numberInput.type(card.number, { delay: 100 });
        }

        await expect(this._submitButton).toBeEnabled({ timeout: 5000 });
        await this._submitButton.click();
    }

    /**
     * Book a service from courses
     * @param {Staff} staff - Staff to book with
     * @param {Course} course - Course to use
     * @param {Service} service - Service to book
     */
    async bookAServiceFromCourses(staff, course, service) {
        console.log(`📅 Booking service '${service.name}' from course: ${course.name}`);
        await this.successCloseButton.click();
        await this.skipFeedbackButton.click();
        await this.page.getByText(course.name).click();

        await this.selectStaffAndTime(staff, service);
        await this.completeBookingButton.click();
        console.log(`✅ Booking completed for service: ${service.name}`);
    }

    /**
     * Verify course used visible
     * @param {Course} course - Course to verify
     */
    async verifyCourseUsedVisible(course) {
        console.log(`🔍 Verifying course '${course.name}' is marked as Used`);
        await this.page.goto(this.clientCoursesUrl, { waitUntil: 'domcontentloaded' });

        const xpathActive = `//div[@data-testid='activeCourses']//li[.//div[normalize-space()='${course.name}']]`;
        const activeCourseItem = this.page.locator(`xpath=${xpathActive}`);
        await expect(activeCourseItem).not.toBeVisible({ timeout: 10000 });

        await this.usedTabLocator.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.reload();
        await this.usedTabLocator.click();

        const xpathUsed = `//div[@data-testid='usedCourses']//li[.//div[text()='${course.name}'] and .//span[normalize-space()='Used']]`;
        const usedCourseItem = this.page.locator(`xpath=${xpathUsed}`);
        await expect(usedCourseItem).toBeVisible({ timeout: 10000 });

        console.log(`✅ Course '${course.name}' verified as Used`);
    }

    /**
     * Buy membership online
     * @param {Membership} membership - Membership to buy
     */
    async buyMembershipOnline(membership) {
        console.log(`💳 Buying membership online: ${membership.name}`);

        await this.buyMembershipButton.click();

        const membershipLocator = this.page.locator(
            `xpath=//div[@data-testid='membershipPurchase']` +
            `[.//div[@data-testid='membershipPurchaseName' and normalize-space() = '${membership.name}']]` +
            `//button[@data-testid='membershipPurchaseButton']`
        );
        await membershipLocator.click();

        await this.buyMembershipDetailsButton.click();

        console.log(`✅ Membership selected: ${membership.name}`);
    }

    /**
     * Scroll and accept membership disclaimer
     */
    async scrollAndAcceptMembershipDisclaimer() {
        const disclaimer = this.page.locator('[data-testid="membership-disclaimer"]');
        const isVisible = await disclaimer.isVisible().catch(() => false);
        if (isVisible) {
            await disclaimer.scrollIntoViewIfNeeded();
            const acceptCheckbox = this.page.locator('[data-testid="accept-disclaimer-checkbox"]');
            await acceptCheckbox.click();
        }
    }

    /**
     * Fill card for membership
     * @param {Card} card - Card details
     */
    async fillCardMembership(card) {
        console.log('💳 Filling card for membership...');
        await this.scrollAndAcceptMembershipDisclaimer();

        console.log(` Filling expiry date: ${card.expiry}`);
        const expiryFrame = await this._findFrameWith('textbox', 'Expiration date MM / YY');
        const expiryInput = expiryFrame.getByRole('textbox', { name: 'Expiration date MM / YY' });
        await expiryInput.fill('');
        await expiryInput.type(card.expiry, { delay: 100 });

        console.log(` Filling CVC: ${card.cvc}`);
        const cvcFrame = await this._findFrameWith('textbox', 'Security code');
        const cvcInput = cvcFrame.getByRole('textbox', { name: 'Security code' });
        await cvcInput.fill('');
        await cvcInput.type(card.cvc, { delay: 100 });

        console.log(` Selecting country: ${card.country}`);
        const iframeCount = await this.page.locator(this._iframeSelector).count();
        for (let idx = 0; idx < iframeCount; idx++) {
            const frame = this.page.frameLocator(this._iframeSelector).nth(idx);
            try {
                const countrySelect = frame.getByLabel('Country');
                await countrySelect.waitFor({ state: 'visible', timeout: 1000 });
                await countrySelect.selectOption(card.country);
                console.log(` Country selected in iframe #${idx}`);
                break;
            } catch (e) {
                continue;
            }
        }

        console.log(` Filling card number: ${card.number}`);
        const numberFrame = await this._findFrameWith('textbox', 'Card number');
        const numberInput = numberFrame.getByRole('textbox', { name: 'Card number' });
        await numberInput.fill('');
        await numberInput.type(card.number, { delay: 100 });

        await expect(this._submitButton).toBeEnabled({ timeout: 5000 });
        await this._submitButton.click();

        console.log('✅ Card details filled for membership');
    }
}