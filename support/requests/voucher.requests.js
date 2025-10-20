import { testData } from "../../testData/salonData.js";
import { voucher } from "../graphQL/queries/voucher.query.js";

/**
 * Voucher API request functions
 */
class VoucherRequests {
  /**
   * Create a new voucher
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {Object} voucherData - Voucher data
   * @returns {Promise<Object>} - Response object
   */
  async createVoucher(request, token, voucherData) {
    const securityContext = this._buildSecurityContext();
    
    return await request.post(testData.URL.GRAPHQL_URL, {
      headers: {
        authorization: `Bearer ${token}`,
        "x-memento-security-context": securityContext,
      },
      data: {
        query: voucher.createVoucher,
        variables: voucherData,
      },
    });
  }

  /**
   * Build security context string
   * @private
   * @returns {string} - Security context string
   */
  _buildSecurityContext() {
    return (
      testData.IRELAND_SALON.BUSINESS_ID +
      "|" +
      testData.IRELAND_SALON.BRANCH_ID +
      "|" +
      testData.IRELAND_SALON.staff[0].id
    );
  }
}

export default new VoucherRequests();
