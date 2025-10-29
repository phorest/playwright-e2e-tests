/**
 * AppointmentBuilder - JavaScript version of builders/AppointmentBuilder.py
 */

import { Appointment } from '../models/Appointment.js';

export class AppointmentBuilder {
  constructor() {
    this._date = null;
    this._time = null;
    this._staff = null;
    this._service = null;
    this._price = null;
  }

  /**
   * Set date
   * @param {Date} date - Date
   * @returns {AppointmentBuilder} Builder instance
   */
  withDate(date) {
    this._date = date;
    return this;
  }

  /**
   * Set time
   * @param {string} time - Time
   * @returns {AppointmentBuilder} Builder instance
   */
  withTime(time) {
    this._time = time;
    return this;
  }

  /**
   * Set staff
   * @param {string} staff - Staff
   * @returns {AppointmentBuilder} Builder instance
   */
  withStaff(staff) {
    this._staff = staff;
    return this;
  }

  /**
   * Set service
   * @param {string} service - Service
   * @returns {AppointmentBuilder} Builder instance
   */
  withService(service) {
    this._service = service;
    return this;
  }

  /**
   * Set price
   * @param {number} price - Price
   * @returns {AppointmentBuilder} Builder instance
   */
  withPrice(price) {
    this._price = price;
    return this;
  }

  /**
   * Build the Appointment instance
   * @returns {Appointment} Appointment instance
   */
  build() {
    if (this._date === null || this._time === null || this._staff === null || this._service === null || this._price === null) {
      throw new Error("AppointmentBuilder: all fields must be set");
    }
    return new Appointment(
      this._date,
      this._time,
      this._staff,
      this._service,
      this._price
    );
  }
}
