/**
 * PurchaseService - JavaScript version of pages/PurchasePage.py
 */

import { getTimeout } from '../../config/timeouts.js';
import { purchaseLocators } from '../../locators/purchase/purchase.locators.js';

export class PurchaseService {
    constructor(page) {
        this.page = page;
    }

    /**
     * Purchase membership
     * @param {Membership} membership - Membership to purchase
     * @param {User} user - User purchasing
     * @param {Staff} staff - Staff member
     */
    async purchaseMembership(membership, user, staff) {
        console.log(`Purchasing membership: ${membership.name} for user: ${user.name}`);

        await purchaseLocators.purchaseTab(this.page).click();
        await purchaseLocators.emailInput(this.page).click();
        await purchaseLocators.emailInput(this.page).fill(user.email);

        // Click user button
        console.log(`🔍 Looking for user button with name: ${user.name}`);
        await purchaseLocators.userButton(this.page, user.name).click();

        // Click staff button
        console.log(`🔍 Looking for staff button with name: ${staff.name}`);
        // Wait a bit for staff to be available in the UI
        await this.page.waitForTimeout(2000);
        await purchaseLocators.staffButton(this.page, staff.name).click();

        await purchaseLocators.hotKeysButton(this.page).click();
        await purchaseLocators.membershipsButton(this.page).click();

        // Click membership radio
        console.log(`🔍 Looking for membership radio with name: ${membership.name}`);
        await purchaseLocators.membershipRadio(this.page, membership.name).click();

        await purchaseLocators.saveButton(this.page).click();

        try {
            await purchaseLocators.noButton(this.page).waitFor({ state: 'visible', timeout: 1000 });
            await purchaseLocators.noButton(this.page).click();
        } catch (error) {
            console.log(' No button not visible, skipping...');
        }

        console.log(`Membership saved: ${membership.name}`);
    }

    /**
     * Complete cash payment
     */
    async completeCashPayment() {
        console.log('💳 Completing cash payment...');
        await purchaseLocators.payButton(this.page).click();
        await purchaseLocators.cashButton(this.page).click();
        await purchaseLocators.completePaymentButton(this.page).click();
        await purchaseLocators.closeButton(this.page).click();
        console.log('✅ Cash payment completed');
    }

    /**
     * Purchase course
     * @param {Course} course - Course to purchase
     * @param {User} user - User purchasing
     * @param {Staff} staff - Staff member
     */
    async purchaseCourse(course, user, staff) {
        console.log(`📚 Purchasing course: ${course.name} for ${user.name}`);

        await purchaseLocators.purchaseTab(this.page).click();
        await purchaseLocators.emailInput(this.page).click();
        await purchaseLocators.emailInput(this.page).fill(user.email);

        await purchaseLocators.userButton(this.page, user.name).click();
        await purchaseLocators.staffButton(this.page, staff.name).click();

        await purchaseLocators.coursesButton(this.page).click();

        const categoryButton = purchaseLocators.categoryButton(this.page, course.categoryName);
        const courseButton = purchaseLocators.courseButton(this.page, course.name);

        const categoryVisible = await categoryButton.isVisible().catch(() => false);
        if (categoryVisible) {
            await categoryButton.click();
        } else {
            await courseButton.click();
        }

        console.log(`✅ Course selected: ${course.name}`);
    }
}

