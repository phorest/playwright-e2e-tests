/**
 * test_memberships.spec.js - JavaScript version of tests/test_memberships.py
 */

import { test, expect } from '@playwright/test';
import { setActiveEnv, getActiveEnv } from '../config/runtime.js';
import {
    getAccessTokenFromLocalStorage,
    createStaffUserRest,
    setStaffWorkSchedule,
    archiveStaff,
    getAppointmentIdByStaffName,
    deleteAppointment,
    freezeClientMembershipByUser,
    cancelClientMembershipByUser,
    unfreezeClientMembershipByUser
} from '../api/folder/auth_and_user_utils.js';

import { CardBuilder } from '../builders/CardBuilder.js';
import { MembershipBuilder } from '../builders/MembershipBuilder.js';
import { UserBuilder } from '../builders/UserBuilder.js';
import { CategoryBuilder } from '../builders/CategoryBuilder.js';
import { ContactInfoBuilder } from '../builders/ContactInfoBuilder.js';
import { VoucherBuilder } from '../builders/VoucherBuilder.js';

import { BookingPage } from '../pages/BookingPage.js';
import { ClientsPage } from '../pages/ClientsPage.js';
import { AppointmentsPage } from '../pages/AppointmentsPage.js';
import { MembershipsPage } from '../pages/MembershipsPage.js';
import { PurchasePage } from '../pages/PurchasePage.js';
import { VoucherPage } from '../pages/VoucherPage.js';
import { LoginPage } from '../pages/LoginPage.js';

setActiveEnv('dev');

let testContext = {};

test.afterEach(async () => {
    const { staffObject, token } = testContext;

    if (staffObject && token) {
        const appointmentId = await getAppointmentIdByStaffName(staffObject.name, token).catch(() => null);
        if (appointmentId) {
            await deleteAppointment(appointmentId, token).catch(() => {});
        }
        await archiveStaff(token, staffObject.idForStaffDelete).catch(() => {});
    }

    testContext = {};
});

test('test_memberships', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: getActiveEnv().baseUrl });
    const page1 = await context.newPage();

    const loginPage = new LoginPage(page1, getActiveEnv().baseUrl);
    await loginPage.login(getActiveEnv().staffEmail, getActiveEnv().staffPassword);
    const bookingLink = await loginPage.goToHomepageAfterLogin();

    const token = await getAccessTokenFromLocalStorage(page1);
    const staffObject = await createStaffUserRest(token);
    await setStaffWorkSchedule(token, staffObject.staffId);

    testContext = { staffObject, token };

    const user = new UserBuilder().withTestData().build();
    const category = new CategoryBuilder().withTestData().build();
    const card = new CardBuilder().withTestData().build();
    const contact = new ContactInfoBuilder().withTestData().build();
    const voucher = new VoucherBuilder().forUser(user).build();
    const membership = new MembershipBuilder().withTestData().build();

    const bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    const bookingPage = new BookingPage(bookingTab);

    await bookingPage.verifyContactInfo(contact);
    await bookingPage.createAccountFromMyAccount(user);
    await bookingPage.verifyRegistrationSuccess();
    await bookingTab.close();

    await page1.bringToFront();

    const voucherPage = new VoucherPage(page1);
    await voucherPage.createVoucherForUser(voucher);

    const membershipsPage = new MembershipsPage(page1);
    await membershipsPage.createCreditMembership(membership);

    const purchasePage = new PurchasePage(page1);
    await purchasePage.purchaseMembership(membership, user, staffObject);
    await purchasePage.completeCashPayment();

    const bookingTab2 = await context.newPage();
    await bookingTab2.goto(bookingLink);
    const bookingPage2 = new BookingPage(bookingTab2);

    await bookingPage2.verifyMembershipSummary(membership);
    await bookingPage2.verifyMembershipFromLoyalty(membership);
    await bookingPage2.selectServiceAndBook(category);
    await bookingPage2.selectStaffAndTime(staffObject);
    await bookingPage2.fillCard(card, voucher);

    await page1.bringToFront();
    await membershipsPage.billMembershipPayment(membership, user);

    const appt = new AppointmentsPage(page1);
    await appt.goto();
    await appt.makeCashPaymentByPhone(user.phone);

    await bookingTab2.bringToFront();
    await freezeClientMembershipByUser(user, token);
    await bookingPage2.verifyMembershipFrozenVisible(membership);

    await page1.bringToFront();
    await membershipsPage.archiveMembership(membership);

    await appt.verifyAndUndoPaymentByClientName(user.name);
    await appt.deleteBookingByPhone(user.phone);

    await unfreezeClientMembershipByUser(user, token);

    await bookingTab2.bringToFront();
    await bookingPage2.cancelMembershipAndVerify(membership);
    await cancelClientMembershipByUser(user, token);

    await page1.bringToFront();
    const clients = new ClientsPage(page1);
    await clients.searchForClients(user);
    await clients.forgetClient(user);
});
