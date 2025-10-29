/**
 * test_courses.spec.js - JavaScript version of tests/test_courses.py
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
    archiveCourseById,
    getCourseIdByName
} from '../api/folder/auth_and_user_utils.js';

import { CardBuilder } from '../builders/CardBuilder.js';
import { CourseBuilder } from '../builders/CourseBuilder.js';
import { UserBuilder } from '../builders/UserBuilder.js';
import { CategoryBuilder } from '../builders/CategoryBuilder.js';
import { ContactInfoBuilder } from '../builders/ContactInfoBuilder.js';
import { VoucherBuilder } from '../builders/VoucherBuilder.js';

import { BookingPage } from '../pages/BookingPage.js';
import { ClientsPage } from '../pages/ClientsPage.js';
import { AppointmentsPage } from '../pages/AppointmentsPage.js';
import { CoursesPage } from '../pages/CoursesPage.js';
import { PurchasePage } from '../pages/PurchasePage.js';
import { VoucherPage } from '../pages/VoucherPage.js';
import { LoginPage } from '../pages/LoginPage.js';

setActiveEnv('dev');

let testContext = {};

test.afterEach(async () => {
    const { staffObject, token, course } = testContext;

    if (course && token) {
        try {
            const courseId = await getCourseIdByName(course.name, token);
            await archiveCourseById(courseId, token);
        } catch (error) {
            console.log(`[WARN] Course cleanup skipped: ${error.message}`);
        }
    }

    if (staffObject && token) {
        try {
            const appointmentId = await getAppointmentIdByStaffName(staffObject.name, token);
            if (appointmentId) {
                await deleteAppointment(appointmentId, token);
            }
        } catch (error) {
            console.log(`[WARN] Appointment cleanup skipped: ${error.message}`);
        }

        await archiveStaff(token, staffObject.idForStaffDelete).catch(() => {});
    }

    testContext = {};
});

test('test_courses', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: getActiveEnv().baseUrl });
    const page1 = await context.newPage();

    const loginPage = new LoginPage(page1, getActiveEnv().baseUrl);
    await loginPage.login(getActiveEnv().staffEmail, getActiveEnv().staffPassword);
    const bookingLink = await loginPage.goToHomepageAfterLogin();

    const token = await getAccessTokenFromLocalStorage(page1);
    const staffObject = await createStaffUserRest(token);
    await setStaffWorkSchedule(token, staffObject.staffId);

    const user = new UserBuilder().withTestData().build();
    const course = new CourseBuilder().withTestData().build();
    const card = new CardBuilder().withTestData().build();
    const category = new CategoryBuilder().withTestData().build();
    const service = category.services[0];
    const contact = new ContactInfoBuilder().withTestData().build();
    const voucher = new VoucherBuilder().forUser(user).build();

    testContext = { staffObject, token, course };

    let bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    let bookingPage = new BookingPage(bookingTab);

    await bookingPage.verifyContactInfo(contact);
    await bookingPage.createAccountFromMyAccount(user);
    await bookingPage.verifyRegistrationSuccess();
    await bookingTab.close();

    await page1.bringToFront();

    const voucherPage = new VoucherPage(page1);
    await voucherPage.createVoucherForUser(voucher);

    const coursesPage = new CoursesPage(page1);
    await coursesPage.createCourse(course);

    const purchasePage = new PurchasePage(page1);
    await purchasePage.purchaseCourse(course, user, staffObject);

    bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    bookingPage = new BookingPage(bookingTab);

    await bookingPage.purchaseCourseFromList(course);
    await bookingPage.payWithVoucher(voucher, card);
    await bookingPage.bookAServiceFromCourses(staffObject, course, service);
    await bookingPage.verifyCourseUsedVisible(course);

    await page1.bringToFront();
    const apptPage = new AppointmentsPage(page1);
    await apptPage.goto();
    await apptPage.deleteBookingByPhone(user.phone);

    const clientsPage = new ClientsPage(page1);
    await clientsPage.searchForClients(user);
    await clientsPage.forgetClient(user);
});
