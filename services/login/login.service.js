/**
 * LoginService
 */

import { getActiveEnv } from '../../config/runtime.js';
import { turnOnAllFeatureFlagsAndReturnToAppointmentScreen } from '../../helpers/helpers.js';
import { SettingsService } from '../settings/settings.service.js';
import { loginLocators } from '../../locators/login/login.locators.js';

export class LoginService {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Login with email and password
   * @param {string} email - Email
   * @param {string} password - Password
   */
  async login(email, password) {
    await this.page.goto("/");
    await this.page.fill(loginLocators.emailInput, email);
    await this.page.fill(loginLocators.passwordInput, password);
    await this.page.click(loginLocators.signInButton);
  }

  /**
   * Go to homepage after login and return booking link
   * @returns {string} Booking link
   */
  async goToHomepageAfterLogin() {
    const env = getActiveEnv();
    if (env.enableFeatureFlags || env.name === "dev") {
      try {
        await turnOnAllFeatureFlagsAndReturnToAppointmentScreen(this.page);
      } catch (error) {
        console.log(`[${env.name.toUpperCase()}][feature-flags] (reason: ${error.message})`);
      }
    } else {
      console.log(`[${env.name.toUpperCase()}] feature flags disabled.`);
    }

    const settingsService = new SettingsService(this.page);
    return await settingsService.copyOnlineBookingLink();
  }
}

// Default export for backward compatibility
export default LoginService;

