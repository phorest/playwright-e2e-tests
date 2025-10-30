/**
 * test_memberships.spec.js
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

import { BookingService } from '../services/booking/booking.service.js';
import { ClientsService } from '../services/clients/clients.service.js';
import { AppointmentsService } from '../services/appointments/appointments.service.js';
import { MembershipsService } from '../services/memberships/memberships.service.js';
import { PurchaseService } from '../services/purchase/purchase.service.js';
import { VoucherService } from '../services/voucher/voucher.service.js';
import LoginService from '../services/login/login.service.js';

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

    const loginService = new LoginService(page1, getActiveEnv().baseUrl);
    await loginService.login(getActiveEnv().staffEmail, getActiveEnv().staffPassword);
    const bookingLink = await loginService.goToHomepageAfterLogin();

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
    const bookingService = new BookingService(bookingTab);

    await bookingService.verifyContactInfo(contact);
    await bookingService.createAccountFromMyAccount(user);
    await bookingService.verifyRegistrationSuccess();
    await bookingTab.close();

    await page1.bringToFront();

    const voucherService = new VoucherService(page1);
    await voucherService.createVoucherForUser(voucher);

    const membershipsService = new MembershipsService(page1);
    await membershipsService.createCreditMembership(membership);

    const purchaseService = new PurchaseService(page1);
    await purchaseService.purchaseMembership(membership, user, staffObject);
    await purchaseService.completeCashPayment();

    const bookingTab2 = await context.newPage();
    await bookingTab2.goto(bookingLink);
    const bookingService2 = new BookingService(bookingTab2);

    await bookingService2.verifyMembershipSummary(membership);
    await bookingService2.verifyMembershipFromLoyalty(membership);
    await bookingService2.selectServiceAndBook(category);
    await bookingService2.selectStaffAndTime(staffObject);
    await bookingService2.fillCard(card, voucher);

    await page1.bringToFront();
    await membershipsService.billMembershipPayment(membership, user);

    const apptService = new AppointmentsService(page1);
    await apptService.goto();
    await apptService.makeCashPaymentByPhone(user.phone);

    await bookingTab2.bringToFront();
    await freezeClientMembershipByUser(user, token);
    await bookingService2.verifyMembershipFrozenVisible(membership);

    await page1.bringToFront();
    await membershipsService.archiveMembership(membership);

    await apptService.verifyAndUndoPaymentByClientName(user.name);
    await apptService.deleteBookingByPhone(user.phone);

    await unfreezeClientMembershipByUser(user, token);

    await bookingTab2.bringToFront();
    await bookingService2.cancelMembershipAndVerify(membership);
    await cancelClientMembershipByUser(user, token);

    await page1.bringToFront();
    const clientsService = new ClientsService(page1);
    await clientsService.searchForClients(user);
    await clientsService.forgetClient(user);
});
