/**
 * CardBuilder
 */

import { Card } from '../models/Card.js';

export class CardBuilder {
  constructor() {
    this._number = null;
    this._expiry = null;
    this._cvc = null;
    this._country = null;
    this._zip = null;
  }

  /**
   * Set card number
   * @param {string} number - Card number
   * @returns {CardBuilder} Builder instance
   */
  withNumber(number) {
    this._number = number;
    return this;
  }

  /**
   * Set expiry
   * @param {string} expiry - Expiry
   * @returns {CardBuilder} Builder instance
   */
  withExpiry(expiry) {
    this._expiry = expiry;
    return this;
  }

  /**
   * Set CVC
   * @param {string} cvc - CVC
   * @returns {CardBuilder} Builder instance
   */
  withCvc(cvc) {
    this._cvc = cvc;
    return this;
  }

  /**
   * Set country
   * @param {string} country - Country
   * @returns {CardBuilder} Builder instance
   */
  withCountry(country) {
    this._country = country;
    return this;
  }

  /**
   * Set ZIP
   * @param {string} zip - ZIP
   * @returns {CardBuilder} Builder instance
   */
  withZip(zip) {
    this._zip = zip;
    return this;
  }

  /**
   * Set card with test data
   * @returns {CardBuilder} Builder instance
   */
  withTestData() {
    this._number = "4242 4242 4242 4242";
    this._expiry = "12 / 34";
    this._cvc = "123";
    this._country = "PL";
    this._zip = "60601";
    return this;
  }

  /**
   * Build the Card instance
   * @returns {Card} Card instance
   */
  build() {
    if (this._number === null) throw new Error("Card number not set");
    if (this._expiry === null) throw new Error("Expiry not set");
    if (this._cvc === null) throw new Error("CVC not set");
    if (this._country === null) throw new Error("Country not set");
    if (this._zip === null) throw new Error("ZIP not set");

    return new Card(
      this._number,
      this._expiry,
      this._cvc,
      this._country,
      this._zip
    );
  }
}
