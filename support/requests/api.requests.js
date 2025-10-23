/**
 * Common API Request Utilities
 * 
 * This module provides reusable functions for GraphQL API requests
 * including client management, voucher operations, and error handling.
 */

import { testData } from "../../testData/salonData.js";
import { client } from "../graphQL/queries/client.query.js";
import { voucher } from "../graphQL/queries/voucher.query.js";

class ApiRequests {
  /**
   * Get common headers for GraphQL requests
   * @param {string} token - Authentication token
   * @returns {Object} Headers object
   */
  getHeaders(token) {
    return {
      authorization: `Bearer ${token}`,
      "x-memento-security-context":
        testData.IRELAND_SALON.BUSINESS_ID +
        "|" +
        testData.IRELAND_SALON.BRANCH_ID +
        "|" +
        testData.IRELAND_SALON.staff[0].id,
    };
  }

  /**
   * Execute GraphQL request with error handling
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {string} query - GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Response data
   */
  async executeGraphQLRequest(request, token, query, variables = {}) {
    try {
      const response = await request.post(testData.URL.GRAPHQL_URL, {
        headers: this.getHeaders(token),
        data: {
          query,
          variables,
        },
      });

      // Verify response status
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      // Parse and validate response
      const responseData = await response.json();
      
      if (responseData.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(responseData.errors)}`);
      }

      return responseData;
    } catch (error) {
      console.error("❌ GraphQL request failed:", error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Create a new client via GraphQL API
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {Object} clientData - Client data object
   * @returns {Promise<Object>} Created client data
   */
  async createClient(request, token, clientData) {
    try {
      console.log("🔄 Creating client...");
      
      const responseData = await this.executeGraphQLRequest(
        request,
        token,
        client.createClient,
        { input: clientData }
      );

      // Validate response structure
      if (!responseData.data?.createClient?.client?.id) {
        throw new Error("Client creation failed - no ID returned in response");
      }

      const clientInfo = {
        id: responseData.data.createClient.client.id,
        firstName: responseData.data.createClient.client.firstName,
        lastName: responseData.data.createClient.client.lastName,
        email: responseData.data.createClient.client.email,
        mobile: responseData.data.createClient.client.mobile,
      };

      console.log(`✅ Created client: ${clientInfo.firstName} ${clientInfo.lastName} (ID: ${clientInfo.id})`);
      return clientInfo;
    } catch (error) {
      console.error("❌ Failed to create client:", error);
      throw error;
    }
  }

  /**
   * Forget/delete a client via GraphQL API
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {string} clientId - Client ID to forget
   * @returns {Promise<boolean>} Success status
   */
  async forgetClient(request, token, clientId) {
    try {
      console.log(`🔄 Forgetting client: ${clientId}`);
      
      const responseData = await this.executeGraphQLRequest(
        request,
        token,
        client.forgetClient,
        { clientId }
      );

      // Debug: Log the full response structure
      console.log("🔍 Forget client response data:", JSON.stringify(responseData, null, 2));

      // The forgetClient mutation returns a boolean value directly
      const forgetResult = responseData.data?.forgetClient;
      
      // Check if the operation was successful (returns true)
      if (forgetResult === true) {
        console.log(`✅ Successfully forgot client: ${clientId}`);
        return true;
      }

      // If the result is false, the operation failed
      if (forgetResult === false) {
        console.error(`❌ Client forget operation returned false for client: ${clientId}`);
        return false;
      }

      // Handle null/undefined responses (might indicate success in some APIs)
      if (forgetResult === null || forgetResult === undefined) {
        console.log(`✅ Client forget operation completed (null response) for: ${clientId}`);
        return true;
      }

      // If we get here, the response structure is unexpected
      console.warn(`⚠️ Unexpected forget client response:`, forgetResult);
      console.log(`✅ Assuming success for client: ${clientId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to forget client ${clientId}:`, error);
      // Don't throw error for cleanup operations - just log and return false
      return false;
    }
  }

  /**
   * Create a new voucher via GraphQL API
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {Object} voucherData - Voucher data object
   * @returns {Promise<Object>} Created voucher data
   */
  async createVoucher(request, token, voucherData) {
    try {
      console.log("🔄 Creating voucher...");
      
      const responseData = await this.executeGraphQLRequest(
        request,
        token,
        voucher.createVoucher,
        { input: voucherData }
      );

      // Validate response structure
      if (!responseData.data?.createVoucher?.voucher?.id) {
        throw new Error("Voucher creation failed - no ID returned in response");
      }

      const voucherInfo = {
        id: responseData.data.createVoucher.voucher.id,
        serial: responseData.data.createVoucher.voucher.serial,
        originalBalance: responseData.data.createVoucher.voucher.originalBalance,
        remainingBalance: responseData.data.createVoucher.voucher.remainingBalance,
        issueDate: responseData.data.createVoucher.voucher.issueDate,
        expiryDate: responseData.data.createVoucher.voucher.expiryDate,
      };

      console.log(`✅ Created voucher: ${voucherInfo.serial} (ID: ${voucherInfo.id})`);
      return voucherInfo;
    } catch (error) {
      console.error("❌ Failed to create voucher:", error);
      throw error;
    }
  }

  /**
   * Get client by ID via GraphQL API
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {string} clientId - Client ID to retrieve
   * @returns {Promise<Object>} Client data
   */
  async getClient(request, token, clientId) {
    try {
      console.log(`🔄 Retrieving client: ${clientId}`);
      
      const responseData = await this.executeGraphQLRequest(
        request,
        token,
        client.getClient,
        { clientId }
      );

      // Validate response structure
      if (!responseData.data?.getClient?.client?.id) {
        throw new Error("Client retrieval failed - no client data returned");
      }

      const clientInfo = {
        id: responseData.data.getClient.client.id,
        firstName: responseData.data.getClient.client.firstName,
        lastName: responseData.data.getClient.client.lastName,
        email: responseData.data.getClient.client.email,
        mobile: responseData.data.getClient.client.mobile,
      };

      console.log(`✅ Retrieved client: ${clientInfo.firstName} ${clientInfo.lastName} (ID: ${clientInfo.id})`);
      return clientInfo;
    } catch (error) {
      console.error("❌ Failed to retrieve client:", error);
      throw error;
    }
  }

  /**
   * Create a test client with standard data
   * @param {Object} request - Playwright request object
   * @param {string} token - Authentication token
   * @param {string} firstName - Client first name
   * @param {string} lastName - Client last name
   * @param {string} email - Client email
   * @param {string} mobile - Client mobile number
   * @returns {Promise<Object>} Created client data
   */
  async createTestClient(request, token, firstName = "TestUser", lastName = "Voucher", email = "test@test.com", mobile = "0897656433") {
    const clientData = {
      firstName,
      lastName,
      email,
      mobile,
      marketingEmailOptout: true,
      marketingSmsOptout: true,
      referringClientId: null,
      clientSourceId: null,
      preferredStaffId: null,
      linkedClientId: null,
      awardReferralPoints: false,
      address: {},
      marketingOptinAnswered: false,
    };

    return await this.createClient(request, token, clientData);
  }
}

// Export singleton instance
export default new ApiRequests();
