/**
 * BookingService
 */

import { expect } from '@playwright/test';
import { AppointmentBuilder } from '../../builders/AppointmentBuilder.js';
import { getTimeout } from '../../config/timeouts.js';
import { bookingLocators } from '../../locators/booking/booking.locators.js';

export class BookingService {
    constructor(page) {
        this.page = page;
        this.selectedTime = null;
        this.selectedService = null;
        this.appointment = null;
        
        const { clientCoursesUrl, clientMembershipUrl } = this._derivePublicUrls();
        this.clientCoursesUrl = clientCoursesUrl;
        this.clientMembershipUrl = clientMembershipUrl;
    }

    _derivePublicUrls() {
        const url = this.page.url();
        let match = url.match(/^(https?:\/\/[^\/]+)\/book\/salons\/([^\/?#]+)/);
        if (!match) {
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

    async _getOpeningTimesForDay(day) {
        const openingTimesRoot = bookingLocators.openingTimesRoot(this.page);
        const row = openingTimesRoot.getByText(day).first().locator('..');
        const times = bookingLocators.localizedTime(row);
        const openTime = await times.nth(0).innerText();
        const closeTime = await times.nth(1).innerText();
        return [openTime.trim(), closeTime.trim()];
    }

    async verifyContactInfo(expected) {
        console.log('  Verifying salon contact information ...');

        const branchAddress = bookingLocators.branchAddress(this.page);
        const actualAddress = await branchAddress.innerText();
        console.log(`   • Address   | expected: '${expected.address}' | actual: '${actualAddress}'`);
        await expect(branchAddress).toHaveText(expected.address);

        const branchPhone = bookingLocators.branchPhone(this.page);
        const actualPhone = await branchPhone.innerText();
        console.log(`   • Phone     | expected: '${expected.phone}' | actual: '${actualPhone}'`);
        await expect(branchPhone).toHaveText(expected.phone);

        const branchEmail = bookingLocators.branchEmail(this.page);
        const actualEmail = await branchEmail.innerText();
        console.log(`   • Email     | expected: '${expected.email}' | actual: '${actualEmail}'`);
        await expect(branchEmail).toHaveText(expected.email);

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

    async selectServiceAndBook(category) {
        if (await bookingLocators.homeLink(this.page).isVisible()) {
            await bookingLocators.homeLink(this.page).click();
            await bookingLocators.viewServicesButton(this.page).click();
        } else {
            await bookingLocators.viewServicesButton(this.page).click();
        }
        await bookingLocators.categoryButton(this.page, category.name).click();

        const service = category.services[0];
        this.selectedService = service;
        await bookingLocators.serviceItem(this.page, service.name, service.price).click();

        await expect(bookingLocators.categoryLabel(this.page, category.name)).toBeVisible();
        await bookingLocators.bookButton(this.page).click();
    }

    async selectStaffAndTime(staff, service = null) {
        if (service) {
            this.selectedService = service;
            await bookingLocators.serviceText(this.page, service.name).click();
            await bookingLocators.bookButton(this.page).click();
        }

        const firstNameOnly = staff.name.split(' ')[0];
        const staffLocator = bookingLocators.staffLocator(this.page, firstNameOnly);
        await staffLocator.click();

        const monthButton = bookingLocators.monthSelectButton(this.page);
        await monthButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await monthButton.click();

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayLocator = bookingLocators.dayLocator(this.page, todayStr);
        await expect(dayLocator).toBeVisible({ timeout: 5000 });
        await dayLocator.click();

        const slots = bookingLocators.availabilityCellButton(this.page);
        const slotCount = await slots.count();

        for (let i = 0; i < slotCount; i++) {
            try {
                const slot = slots.nth(i);
                await expect(slot).toBeVisible({ timeout: 2000 });
                this.selectedTime = await slot.locator("[data-testid='branchTime']").innerText();
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

    async createAccount(user) {
        await bookingLocators.createOneAccountLink(this.page).click();
        await bookingLocators.fullNameInput(this.page).fill(user.name);
        await bookingLocators.countryIrelandOption(this.page).click();
        await bookingLocators.countryGermanyOption(this.page).click();
        await bookingLocators.phoneInput(this.page).fill(user.phone);
        await bookingLocators.emailInput(this.page).fill(user.email);
        await bookingLocators.passwordInput(this.page).fill(user.password);
        await bookingLocators.confirmPasswordInput(this.page).fill(user.password);
        await bookingLocators.createAccountButton(this.page).click();
    }

    async createAccountFromMyAccount(user) {
        await bookingLocators.createAccountFromMyAccountTab(this.page).first().click();
        await bookingLocators.createAccountLinkGuest(this.page).click();
        await bookingLocators.fullNameInput(this.page).fill(user.name);
        await bookingLocators.countryIrelandOption(this.page).click();
        await bookingLocators.countryGermanyOption(this.page).click();
        await bookingLocators.phoneInput(this.page).fill(user.phone);
        await bookingLocators.emailInput(this.page).fill(user.email);
        await bookingLocators.passwordInput(this.page).fill(user.password);
        await bookingLocators.confirmPasswordInput(this.page).fill(user.password);
        await bookingLocators.createAccountButton(this.page).click();
    }

    async verifyRegistrationSuccess() {
        await bookingLocators.successUserRegistration(this.page).locator('path').first().waitFor({ state: 'visible' });
        await bookingLocators.successUserRegistrationButton(this.page).click();
    }

    async verifyBooking(serviceName, staff, servicePrice) {
        console.log(` Verifying booking for selected time: ${this.selectedTime}`);
        if (!this.selectedTime) {
            throw new Error('❌ No time selected during booking to verify!');
        }

        const firstNameOnly = staff.name.split(' ')[0];
        const expectedText = `${serviceName}${this.selectedTime} with ${firstNameOnly}€${servicePrice.toFixed(2)}`;
        await bookingLocators.singleBookingServiceList(this.page).waitFor({ state: 'visible' });
        const serviceListText = await bookingLocators.singleBookingServiceList(this.page).textContent();
        if (!serviceListText.includes(expectedText)) {
            throw new Error(`Service list does not contain expected text: ${expectedText}`);
        }

        const priceText = await bookingLocators.checkoutPriceBreakdown(this.page).textContent();
        if (!priceText.includes(servicePrice.toFixed(2))) {
            throw new Error(`Price breakdown does not contain expected price: ${servicePrice.toFixed(2)}`);
        }

        await bookingLocators.successCloseButton(this.page).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await bookingLocators.successCloseButton(this.page).click();

        await bookingLocators.skipFeedbackButton(this.page).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await bookingLocators.skipFeedbackButton(this.page).click();
    }

    async cancelBooking() {
        await bookingLocators.cancelBookingButton(this.page).click();
        await bookingLocators.confirmCancelButton(this.page).click();
    }

    async _waitForStripeIframes(expected = 3, timeout = 30000) {
        await this.page.waitForFunction(
            `() => document.querySelectorAll("${bookingLocators.iframeSelector}").length >= ${expected}`,
            { timeout }
        );
    }

    async _findFrameWith(role, name, timeout = 5000) {
        const count = await this.page.locator(bookingLocators.iframeSelector).count();
        for (let idx = 0; idx < count; idx++) {
            const frame = this.page.frameLocator(bookingLocators.iframeSelector).nth(idx);
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

    async scrollToCancellationTerms() {
        const terms = bookingLocators.termsAndConditions(this.page);
        await terms.waitFor({ state: 'attached', timeout: getTimeout('ELEMENT_VISIBLE') });
        await terms.first().scrollIntoViewIfNeeded();
        console.log(" Scrolled to cancellation terms (data-testid=termsAndConditions).");
    }

    async fillCard(card, voucher = null) {
        console.log(' fill_card started');

        if (voucher) {
            console.log(` Adding gift voucher with serial: ${voucher.serial}`);
            await bookingLocators.addGiftVoucherButton(this.page).click();
            await bookingLocators.voucherSerialInput(this.page).click();
            await bookingLocators.voucherSerialInput(this.page).fill(voucher.serial);
            await bookingLocators.addVoucherButton(this.page).click();
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
        const frameLocators = this.page.frameLocator(bookingLocators.iframeSelector);
        const iframeCount = await this.page.locator(bookingLocators.iframeSelector).count();
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

        const completeButton = this.page.getByRole('button', { name: /complete|book|submit/i }).first();
        await completeButton.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await completeButton.click();
    }

    async verifyMembershipSummary(membership, billingDate = null) {
        if (billingDate === null) {
            const today = new Date();
            billingDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });
        await bookingLocators.membershipText(this.page, membership.name).click();

        const container = bookingLocators.membershipContainer(this.page);
        await container.getByText(membership.name).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership name is visible: ${membership.name}`);

        await container.getByText(`Monthly fee of €${membership.recurringFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified monthly fee is visible: €${membership.recurringFee.toFixed(2)}`);

        await container.getByText(`Sign up fee of €${membership.signupFee.toFixed(2)}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified sign-up fee is visible: €${membership.signupFee.toFixed(2)}`);

        await container.getByText("Active").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified membership status is 'Active'");

        await container.getByText(`€${membership.recurringFee.toFixed(2)} per month`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified 'per month' €${membership.recurringFee.toFixed(2)} text is visible`);

        await container.getByText(`Member since ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified membership start date is visible: ${billingDate}`);

        await container.getByText(`Next billing date is ${billingDate}`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified next billing date is visible: ${billingDate}`);

        await container.getByText("No card found for this membership").waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(" Verified billing method text is visible (card ending in ...)");

        await this.page.getByText(`€${membership.creditAmount.toFixed(2)} Credit On Services And Products`).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified credit is visible: €${membership.creditAmount.toFixed(2)} Credit On Services`);

        await this.page.getByText(`${membership.discountAmount}% Discount on Services`, { exact: true }).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        console.log(` Verified service discount is visible: ${membership.discountAmount}% Discount on Services`);
    }

    async verifyMembershipFromLoyalty(membership, billingDate = null) {
        if (billingDate === null) {
            const today = new Date();
            billingDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        await bookingLocators.loyaltyButton(this.page).click();

        await bookingLocators.clientMembershipBanner(this.page, membership.name).click();

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

    async verifyMembershipFrozenVisible(membership) {
        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });

        const activeMembershipItem = bookingLocators.activeMembershipsItem(this.page, membership.name);
        await activeMembershipItem.waitFor({ state: 'hidden', timeout: getTimeout('ELEMENT_VISIBLE') });

        await bookingLocators.usedTabLocator(this.page).waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
        await bookingLocators.usedTabLocator(this.page).click();
        await this.page.waitForTimeout(500);

        const frozenMembershipItem = bookingLocators.frozenMembershipItem(this.page, membership.name);
        await frozenMembershipItem.waitFor({ state: 'visible', timeout: getTimeout('ELEMENT_VISIBLE') });
    }

    async cancelMembershipAndVerify(membership) {
        console.log(` Cancelling membership '${membership.name}' and verifying...`);

        await this.page.goto(this.clientMembershipUrl, { waitUntil: 'domcontentloaded' });

        for (const tab of [
            bookingLocators.membershipsActiveTab(this.page),
            bookingLocators.membershipsActiveTabServices(this.page),
            bookingLocators.membershipsActiveTabSegment(this.page),
        ]) {
            try {
                await tab.waitFor({ state: 'visible', timeout: 3000 });
                await tab.click();
                break;
            } catch (e) {
                continue;
            }
        }

        const membershipTile = bookingLocators.membershipText(this.page, membership.name).first();
        await membershipTile.click();

        const cancelMembershipButton = bookingLocators.cancelMembershipButton(this.page).first();
        await expect(cancelMembershipButton).toBeVisible({ timeout: 10000 });
        await cancelMembershipButton.click();

        await this.page.waitForTimeout(500);
        const cancelMembershipConfirmButton = bookingLocators.cancelMembershipButton(this.page).nth(1);
        await cancelMembershipConfirmButton.waitFor({ state: 'visible', timeout: 3000 });
        await cancelMembershipConfirmButton.click();

        const goToMembershipButton = bookingLocators.goToMembershipButton(this.page).first();
        await expect(goToMembershipButton).toBeVisible({ timeout: 10000 });
        await goToMembershipButton.click();

        await expect(bookingLocators.membershipContainer(this.page).getByText(membership.name).first()).toBeVisible({ timeout: 10000 });

        const statusCancelled = bookingLocators.membershipContainer(this.page).locator(
            "xpath=(.//*[normalize-space()='Cancelled' or normalize-space()='Canceled'])[1]"
        ).first();
        await expect(statusCancelled).toBeVisible({ timeout: 10000 });

        console.log(` Verified membership '${membership.name}' is Cancelled.`);
    }

    async purchaseCourseFromList(course) {
        console.log(`📚 Purchasing course from list: ${course.name}`);
        await bookingLocators.buyCoursesButton(this.page).click();

        const courseLocator = bookingLocators.coursePurchaseRoot(this.page).filter({
            has: bookingLocators.coursePurchaseName(this.page).filter({ hasText: course.name })
        }).filter({
            has: bookingLocators.coursePurchaseCategory(this.page).filter({ hasText: course.categoryName })
        });

        await courseLocator.locator(bookingLocators.coursePurchaseButton).click();
        console.log(`✅ Course selected and purchase initiated: ${course.name}`);
    }

    async payWithVoucher(voucher, card) {
        console.log(`🎟️ Applying voucher with serial: ${voucher.serial}`);
        await bookingLocators.addGiftVoucherButton(this.page).click();
        await bookingLocators.voucherSerialInput(this.page).fill(voucher.serial);
        await bookingLocators.addVoucherButton(this.page).click();
        console.log('✅ Voucher submitted');

        await this.page.waitForTimeout(1000);
        let fillCard = false;

        const iframeElements = this.page.locator(bookingLocators.iframeSelector);
        const iframeCount = await iframeElements.count();
        for (let i = 0; i < iframeCount; i++) {
            const frame = this.page.frameLocator(bookingLocators.iframeSelector).nth(i);
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
                const frame = this.page.frameLocator(bookingLocators.iframeSelector).nth(idx);
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

        await expect(bookingLocators.completeBookingButton(this.page)).toBeEnabled({ timeout: 5000 });
        await bookingLocators.completeBookingButton(this.page).click();
    }

    async bookAServiceFromCourses(staff, course, service) {
        console.log(`📅 Booking service '${service.name}' from course: ${course.name}`);
        await bookingLocators.successCloseButton(this.page).click();
        await bookingLocators.skipFeedbackButton(this.page).click();
        await bookingLocators.membershipText(this.page, course.name).click();

        await this.selectStaffAndTime(staff, service);
        await bookingLocators.completeBookingButton(this.page).click();
        console.log(`✅ Booking completed for service: ${service.name}`);
    }

    async verifyCourseUsedVisible(course) {
        console.log(`🔍 Verifying course '${course.name}' is marked as Used`);
        await this.page.goto(this.clientCoursesUrl, { waitUntil: 'domcontentloaded' });

        const activeCourseItem = bookingLocators.activeCoursesItem(this.page, course.name);
        await expect(activeCourseItem).not.toBeVisible({ timeout: 10000 });

        await bookingLocators.usedTabLocator(this.page).waitFor({ state: 'visible', timeout: 10000 });
        await this.page.reload();
        await bookingLocators.usedTabLocator(this.page).click();

        const usedCourseItem = bookingLocators.usedCoursesItem(this.page, course.name);
        await expect(usedCourseItem).toBeVisible({ timeout: 10000 });

        console.log(`✅ Course '${course.name}' verified as Used`);
    }

    async buyMembershipOnline(membership) {
        console.log(`💳 Buying membership online: ${membership.name}`);

        await bookingLocators.buyMembershipButton(this.page).click();

        const membershipLocator = bookingLocators.membershipPurchaseLocator(this.page, membership.name);
        await membershipLocator.click();

        await bookingLocators.buyMembershipDetailsButton(this.page).click();

        console.log(`✅ Membership selected: ${membership.name}`);
    }

    async scrollAndAcceptMembershipDisclaimer() {
        const disclaimer = bookingLocators.membershipDisclaimer(this.page);
        const isVisible = await disclaimer.isVisible().catch(() => false);
        if (isVisible) {
            await disclaimer.scrollIntoViewIfNeeded();
            await bookingLocators.acceptDisclaimerCheckbox(this.page).click();
        }
    }

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
        const iframeCount = await this.page.locator(bookingLocators.iframeSelector).count();
        for (let idx = 0; idx < iframeCount; idx++) {
            const frame = this.page.frameLocator(bookingLocators.iframeSelector).nth(idx);
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

        await expect(bookingLocators.completeBookingButton(this.page)).toBeEnabled({ timeout: 5000 });
        await bookingLocators.completeBookingButton(this.page).click();

        console.log('✅ Card details filled for membership');
    }
}
