export const testData = {
  URL: {
    BASE_URL: "https://my-dev.phorest.com",
    API_URL: "http://dev.phorest.com",
    API_GATEWAY_URL: "https://api-gateway-dev.phorest.com",
    GRAPHQL_URL: "https://api-gateway-dev.phorest.com/api-facade/graphql",
    TOKEN_URL: "https://api-gateway-dev.phorest.com/auth/oauth/token",
  },
  PAY_SALON: {
    STRIPE_KEY: process.env.IE_STRIPE_KEY,
    ACCOUNT_ID: 47404,
    BUSINESS_ID: "xhTWSKHAxsq2j5_txK9gOg",
    BRANCH_ID: "c3Bh2MepzG8J88YE6bV1aQ",
    TERMINAL_ID: "tmr_GKt9KQlzOyzlfD",

    // Stripe Account Details
    SALON_MERCHANT_ACCOUNT_ID: 'ma-MgpDD079KC7dYrpe',
    SALON_CONNECTED_ACCOUNT_ID: 'acct_1PyFcfQTmR91Kbej',

    // Payment Processing Fees
    SALON_VAT_RATE: 23,
    CARD_PRESENT_FLAT_FEE: 0.22, // Applies to "regular" card brand present transactions
    CARD_PRESENT_PERCENTAGE_FEE: 1.15, // Applies to "regular" card brand present transactions
    STORED_CARD_FLAT_FEE: 0.45, // Applies to stored card + VT
    STORED_CARD_PERCENTAGE_FEE: 1.00, // Applies to stored card + VT
    DIRECT_TIPPING_PERCENTAGE_FEE: 10.00, // Applies to direct tipping transactions where tip is paid directly to staff account
    
    staff: [
      {
        name: "Rachel Testings",
        email: "r.testings@gmail.com",
        id: "c3Bh2MepzG8J88YE6bV1aQ",
      },
    ],
  },
};