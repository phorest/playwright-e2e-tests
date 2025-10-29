/**
 * PurchasePage - JavaScript version of pages/PurchasePage.py
 */

import { getTimeout } from '../config/timeouts.js';

export class PurchasePage {
    constructor(page) {
        this.page = page;
        this._purchaseTab = page.getByRole("link", { name: "Purchase" });
        this._emailInput = page.getByPlaceholder("Email");
        this._hotKeysButton = page.getByRole("button", { name: "Hot Keys" });
        this._membershipsButton = page.locator("//button[.//p[normalize-space()='Memberships']]");

        this._saveButton = page.getByRole("button", { name: "Save" });
        this._noButton = page.getByRole("button", { name: "No", exact: true });
        this._payButton = page.getByRole("button", { name: "Pay" });
        this._cashButton = page.getByRole("button", { name: "Cash", exact: true });
        this._completePaymentButton = page.getByRole("button", { name: "Complete Payment" });
        this._closeButton = page.getByRole("button", { name: "Close", exact: true });
        this._coursesButton = page.getByRole("button", { name: "Courses" });
    }

    /**
     * Purchase membership
     * @param {Membership} membership - Membership to purchase
     * @param {User} user - User purchasing
     * @param {Staff} staff - Staff member
     */
    async purchaseMembership(membership, user, staff) {
        console.log(`Purchasing membership: ${membership.name} for user: ${user.name}`);

        await this._purchaseTab.click();
        await this._emailInput.click();
        await this._emailInput.fill(user.email);

        // Click user button
        console.log(`🔍 Looking for user button with name: ${user.name}`);
        await this.page.getByRole("button", { name: user.name }).click();

        // Click staff button
        console.log(`🔍 Looking for staff button with name: ${staff.name}`);
        // Wait a bit for staff to be available in the UI
        await this.page.waitForTimeout(2000);
        await this.page.getByRole("button", { name: staff.name }).click();

        await this._hotKeysButton.click();
        await this._membershipsButton.click();

        // Click membership radio
        console.log(`🔍 Looking for membership radio with name: ${membership.name}`);
        await this.page.getByRole("radio", { name: membership.name }).click();

        await this._saveButton.click();

        try {
            await this._noButton.waitFor({ state: 'visible', timeout: 1000 });
            await this._noButton.click();
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
        await this._payButton.click();
        await this._cashButton.click();
        await this._completePaymentButton.click();
        await this._closeButton.click();
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

        await this._purchaseTab.click();
        await this._emailInput.click();
        await this._emailInput.fill(user.email);

        await this.page.getByRole('button', { name: user.name }).click();
        await this.page.getByRole('button', { name: staff.name }).click();

        await this._coursesButton.click();

        const categoryButton = this.page.getByRole('button', { name: course.categoryName });
        const courseButton = this.page.getByRole('button', { name: `${course.name} €` });

        const categoryVisible = await categoryButton.isVisible().catch(() => false);
        if (categoryVisible) {
            await categoryButton.click();
        } else {
            await courseButton.click();
        }

        console.log(`✅ Course selected: ${course.name}`);
    }
}
