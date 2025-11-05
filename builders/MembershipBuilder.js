/**
 * MembershipBuilder
 */

import { Membership } from '../models/Membership.js';
import { v4 as uuidv4 } from 'uuid';

export class MembershipBuilder {
  constructor() {
    this.name = null;
    this.signupFee = null;
    this.recurringFee = null;
    this.valueOfBenefit = null;
    this.discountAfterBenefit = null;
    this.productDiscount = null;
    this.serviceName = null;
    this.creditAmount = null;
    this.discountAmount = null;
    this.recurringServicesNumber = null;
    this.serviceNameShort = null;
  }

  /**
   * Set membership with test data
   * @returns {MembershipBuilder} Builder instance
   */
  withTestData() {
    const uniqueId = uuidv4().substring(0, 8);
    this.name = `Test Membership ${uniqueId}`;
    this.signupFee = Math.round((Math.random() * 20 + 10) * 100) / 100;
    this.recurringFee = Math.round((Math.random() * 15 + 5) * 100) / 100;
    this.valueOfBenefit = Math.round((this.signupFee + Math.random() * 15 + 5) * 100) / 100;
    this.discountAfterBenefit = [10, 20, 30][Math.floor(Math.random() * 3)];
    this.productDiscount = [5, 10, 15][Math.floor(Math.random() * 3)];
    this.creditAmount = Math.round((Math.random() * 15 + 5) * 100) / 100;
    this.serviceName = "Cut + Styling";
    this.discountAmount = 50;
    return this;
  }

  /**
   * Set membership with service data
   * @returns {MembershipBuilder} Builder instance
   */
  withServiceData() {
    const uniqueId = uuidv4().substring(0, 8);
    this.name = `Test Membership Recurring Service${uniqueId}`;
    this.signupFee = Math.round((Math.random() * 20 + 10) * 100) / 100;
    this.recurringFee = Math.round((Math.random() * 15 + 5) * 100) / 100;
    this.valueOfBenefit = Math.round((this.signupFee + Math.random() * 15 + 5) * 100) / 100;
    this.serviceName = "test online €10.00 10min";
    this.serviceNameShort = "test online";
    this.recurringServicesNumber = "10";
    return this;
  }

  /**
   * Build the Membership instance
   * @returns {Membership} Membership instance
   */
  build() {
    return new Membership(
      this.name,
      this.signupFee,
      this.recurringFee,
      this.valueOfBenefit,
      this.discountAfterBenefit,
      this.productDiscount,
      this.serviceName,
      this.serviceNameShort,
      this.creditAmount,
      this.discountAmount,
      this.recurringServicesNumber
    );
  }
}
