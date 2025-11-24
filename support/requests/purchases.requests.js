import { testData } from "../../testData/colmPaySalonData.js";
import { purchases } from "../graphQL/queries/purchases.query.js";

/**
 * Purchases API request functions
 */
class PurchasesRequests {
  /**
   * Create a new voucher
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {Object} voucherData - Voucher data
   * @returns {Promise<Object>} - Response object
   */

  async retrieveMostRecentPurchase (request, token, filterDate) {
    const securityContext = this._buildSecurityContext();
    
    return await request.post(testData.URL.GRAPHQL_URL, {
      headers: {
        authorization: `Bearer ${token}`,
        "x-memento-security-context": securityContext,
      },
      data: {
      query: purchases.getPurchases,
      variables: {
        first: 20,
       after: 'MA==',
        filterBy: {
          date: filterDate
        }
      }
    }
  });
  }

      /**
   * Build security context string
   * @private
   * @returns {string} - Security context string
   */
  _buildSecurityContext() {
    return (
      testData.PAY_SALON.BUSINESS_ID +
      "|" +
      testData.PAY_SALON.BRANCH_ID +
      "|" +
      testData.PAY_SALON.staff[0].id
    );
  }
}
export default new PurchasesRequests();