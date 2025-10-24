/**
 * Date Utility Functions
 * 
 * This module provides reusable date calculation functions for test data generation.
 * All functions return dates in YYYY-MM-DD format for consistent API usage.
 */

/**
 * Get current date (today) in YYYY-MM-DD format
 * @returns {string} Current date as YYYY-MM-DD string
 */
export const getCurrentDate = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

/**
 * Get current date plus one day (tomorrow) in YYYY-MM-DD format
 * @returns {string} Tomorrow's date as YYYY-MM-DD string
 */
export const getCurrentDatePlusOne = () => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 1
  )
    .toJSON()
    .slice(0, 10);
};

/**
 * Get future date (one year from now) in YYYY-MM-DD format
 * @returns {string} Future date as YYYY-MM-DD string
 */
export const getFutureDate = () => {
  return new Date(
    new Date().getFullYear() + 1,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

/**
 * Get date with specified offset from current date
 * @param {number} daysOffset - Number of days to add/subtract from current date
 * @returns {string} Date as YYYY-MM-DD string
 */
export const getDateWithOffset = (daysOffset) => {
  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + daysOffset
  )
    .toJSON()
    .slice(0, 10);
};

/**
 * Get date with specified year offset from current date
 * @param {number} yearsOffset - Number of years to add/subtract from current date
 * @returns {string} Date as YYYY-MM-DD string
 */
export const getDateWithYearOffset = (yearsOffset) => {
  return new Date(
    new Date().getFullYear() + yearsOffset,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toJSON()
    .slice(0, 10);
};

/**
 * Pre-calculate common dates for voucher creation
 * @returns {Object} Object containing common date values
 */
export const getVoucherDates = () => {
  return {
    issueDate: getCurrentDate(),
    expiryDate: getFutureDate(),
    tomorrowDate: getCurrentDatePlusOne(),
  };
};

/**
 * Generate unique serial number using timestamp
 * @param {string} prefix - Optional prefix for the serial number
 * @returns {string} Unique serial number
 */
export const generateSerialNumber = (prefix = "") => {
  return prefix + String(Date.now());
};

/**
 * Generate test data for voucher creation
 * @returns {Object} Test data object with dates and serial number
 */
export const generateVoucherTestData = () => {
  return {
    serialNumber: generateSerialNumber(),
    issueDate: getCurrentDatePlusOne(),
    expiryDate: getFutureDate(),
  };
};
