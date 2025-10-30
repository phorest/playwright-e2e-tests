/**
 * ContactInfoBuilder
 */

import { ContactInfo } from '../models/ContactInfo.js';

export class ContactInfoBuilder {
  constructor() {
    this._address = "";
    this._phone = "";
    this._email = "";
    this._hours = {};
  }

  /**
   * Set address
   * @param {string} address - Address
   * @returns {ContactInfoBuilder} Builder instance
   */
  withAddress(address) {
    this._address = address;
    return this;
  }

  /**
   * Set phone
   * @param {string} phone - Phone
   * @returns {ContactInfoBuilder} Builder instance
   */
  withPhone(phone) {
    this._phone = phone;
    return this;
  }

  /**
   * Set email
   * @param {string} email - Email
   * @returns {ContactInfoBuilder} Builder instance
   */
  withEmail(email) {
    this._email = email;
    return this;
  }

  /**
   * Set opening hours
   * @param {Object} hoursDict - Opening hours dictionary
   * @returns {ContactInfoBuilder} Builder instance
   */
  withOpeningHours(hoursDict) {
    this._hours = hoursDict;
    return this;
  }

  /**
   * Set contact info with test data
   * @returns {ContactInfoBuilder} Builder instance
   */
  withTestData() {
    this._address = "Thomas Street, Sweetbriar, Clonmel, County Tipperary, E91 A0C2, Ireland";
    this._phone = "3538600000";
    this._email = "mateusz.wlodek@phorest.com";
    this._hours = {
      "Monday": ["12:00 AM", "11:30 PM"],
      "Tuesday": ["12:00 AM", "11:30 PM"],
      "Wednesday": ["12:00 AM", "11:30 PM"],
      "Thursday": ["12:00 AM", "11:30 PM"],
      "Friday": ["12:00 AM", "11:30 PM"],
      "Saturday": ["12:00 AM", "11:30 PM"],
      "Sunday": ["12:00 AM", "11:30 PM"]
    };
    return this;
  }

  /**
   * Build the ContactInfo instance
   * @returns {ContactInfo} ContactInfo instance
   */
  build() {
    return new ContactInfo(this._address, this._phone, this._email, this._hours);
  }
}