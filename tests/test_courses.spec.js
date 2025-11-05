/**
 */

import { test, expect } from '@playwright/test';
import { getActiveEnv } from '../config/runtime.js';
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

import { BookingService } from '../services/booking/booking.service.js';
import { ClientsService } from '../services/clients/clients.service.js';
import { AppointmentsService } from '../services/appointments/appointments.service.js';
import { CoursesService } from '../services/courses/courses.service.js';
import { PurchaseService } from '../services/purchase/purchase.service.js';
import { VoucherService } from '../services/voucher/voucher.service.js';
import LoginService from '../services/login/login.service.js';

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

    const loginService = new LoginService(page1, getActiveEnv().baseUrl);
    await loginService.login(getActiveEnv().staffEmail, getActiveEnv().staffPassword);
    const bookingLink = await loginService.goToHomepageAfterLogin();

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
    let bookingService = new BookingService(bookingTab);

    await bookingService.verifyContactInfo(contact);
    await bookingService.createAccountFromMyAccount(user);
    await bookingService.verifyRegistrationSuccess();
    await bookingTab.close();

    await page1.bringToFront();

    const voucherService = new VoucherService(page1);
    await voucherService.createVoucherForUser(voucher);

    const coursesService = new CoursesService(page1);
    await coursesService.createCourse(course);

    const purchaseService = new PurchaseService(page1);
    await purchaseService.purchaseCourse(course, user, staffObject);

    bookingTab = await context.newPage();
    await bookingTab.goto(bookingLink);
    bookingService = new BookingService(bookingTab);

    await bookingService.purchaseCourseFromList(course);
    await bookingService.payWithVoucher(voucher, card);
    await bookingService.bookAServiceFromCourses(staffObject, course, service);
    await bookingService.verifyCourseUsedVisible(course);

    await page1.bringToFront();
    const apptService = new AppointmentsService(page1);
    await apptService.goto();
    await apptService.deleteBookingByPhone(user.phone);

    const clientsService = new ClientsService(page1);
    await clientsService.searchForClients(user);
    await clientsService.forgetClient(user);
});
