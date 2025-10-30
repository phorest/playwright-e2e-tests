/**
 * StaffBuilder
 */

import { Staff } from '../models/Staff.js';

export class StaffBuilder {
  /**
   * Create test staff
   * @returns {Staff} Test staff
   */
  testStaff() {
    return new Staff("Test");
  }

  /**
   * Create Mateusz staff
   * @returns {Staff} Mateusz staff
   */
  mateuszStaff() {
    return new Staff("Mateusz Owner");
  }
}
