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
    TIPPING_STAFF_MERCHANT_ACCOUNT_ID:'ma-vMPD7dr16Ikxejrj',
    TIPPING_STAFF_CONNECTED_ACCOUNT_ID:'acct_1S0eC032VIP7a7q6',
    

    // Payment Processing Fees
    SALON_VAT_RATE: 23,
    CARD_PRESENT_FLAT_FEE: 0.22, // Applies to "regular" card brand present transactions
    CARD_PRESENT_PERCENTAGE_FEE: 1.15, // Applies to "regular" card brand present transactions
    AMEX_FLAT_FEE: 0.75, // Applies to AMEX card present transactions
    AMEX_PERCENTAGE_FEE: 2.2, // Applies to AMEX card present transactions
    STORED_CARD_FLAT_FEE: 0.45, // Applies to stored card + VT
    STORED_CARD_PERCENTAGE_FEE: 1.00, // Applies to stored card + VT
    DIRECT_TIPPING_PERCENTAGE_FEE: 10.00, // Applies to direct tipping transactions where tip is paid directly to staff account
    ONLINE_BOOKING_FLAT_FEE: 0.5, // Applies to in-house (stored card + VT) & online
    ONLINE_BOOKING_PERCENTAGE_FEE: 1.1, // Applies to in-house (stored card + VT) & online
    ONLINE_BOOKING_FEE_TIER: 0.8, // Applies to in-house (stored card + VT) & online - this is the minFee amount
    MEMBERSHIP_BILLING_FLAT_FEE: 0.45, // Applies to Membership subscription fee
    MEMBERSHIP_BILLING_PERCENTAGE_FEE: 3.5, // Applies to Membership subscription fee
    NO_SHOW_PRECENTAGE_FEE: 0, // Applies to No-Show/Cancellation protection charges
    NO_SHOW_FLAT_FEE: 0, // Applies to No-Show/Cancellation protection charges
    ONLINE_RETAIL_FLAT_FEE: 0.25, // Applies to OGV/EComm transactions
    ONLINE_RETAIL_PERCENTAGE_FEE: 2.9, // Applies to OGV/EComm transactions
    KLARNA_FLAT_FEE: 0.3, /// Applies to transactions using Klarna as a payment method
    KLARNA_PERCENTAGE_FEE: 6.0, // Applies to transactions using Klarna as a payment method
    
    // Online Booking Threshold Value - the amount over which online booking flat fee and percentage fee values will be charged, otherwise the fee tier amount will be charged
    ONLINE_BOOKING_FLAT_PERCENTAGE_THRESHOLD: 50.01,

    staff: [
      {
        // Tipping Staff
        name: "Rachel Testings",
        email: "r.testings@gmail.com",
        id: "c3Bh2MepzG8J88YE6bV1aQ",
      },
    ],
  },
};