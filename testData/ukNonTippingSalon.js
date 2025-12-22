export const testData = {
  URL: {
    BASE_URL: "https://my-dev.phorest.com",
    API_URL: "http://dev.phorest.com",
    API_GATEWAY_URL: "https://api-gateway-dev.phorest.com",
    GRAPHQL_URL: "https://api-gateway-dev.phorest.com/api-facade/graphql",
    TOKEN_URL: "https://api-gateway-dev.phorest.com/auth/oauth/token",
  },
  PAY_SALON: {
    STRIPE_KEY: process.env.UK_STRIPE_KEY,
    ACCOUNT_ID: 47403,
    BUSINESS_ID: "x5Hz3_8G-PeOF3GeGcT-oQ",
    BRANCH_ID: "h6x5cwGfZwHmyoHPpS9Qkw",
    TERMINAL_ID: "tmr_F1ZwQgcHzZY0X5",

    // Stripe Account Details
    SALON_MERCHANT_ACCOUNT_ID: 'ma-ZJAOKP2Gpf2lM1xw',
    SALON_CONNECTED_ACCOUNT_ID: 'acct_1PxsBQQHb23tshN1',

    // Payment Processing Fees
    SALON_VAT_RATE: 23,
    CARD_PRESENT_FLAT_FEE: 0.4, // Applies to "regular" card brand present transactions
    CARD_PRESENT_PERCENTAGE_FEE: 1.75, // Applies to "regular" card brand present transactions
    AMEX_FLAT_FEE: 1, // Applies to AMEX card present transactions
    AMEX_PERCENTAGE_FEE: 3.4448, // Applies to AMEX card present transactions
    STORED_CARD_FLAT_FEE: 0.75, // Applies to stored card + VT
    STORED_CARD_PERCENTAGE_FEE: 1.26, // Applies to stored card + VT
    DIRECT_TIPPING_PERCENTAGE_FEE: 10.00, // Applied to direct tipping transactions where tip is paid directly to staff account
    ONLINE_BOOKING_FLAT_FEE: 0.22, // Applies to in-house (stored card + VT) & online
    ONLINE_BOOKING_PERCENTAGE_FEE: 2, // Applies to in-house (stored card + VT) & online
    ONLINE_BOOKING_FEE_TIER: 0.86, // Applies to in-house (stored card + VT) & online - this is the minFee amount
    MEMBERSHIP_BILLING_FLAT_FEE: 0.65, // Applies to Membership subscription fee
    MEMBERSHIP_BILLING_PERCENTAGE_FEE: 4.55, // Applies to Membership subscription fee
    NO_SHOW_PRECENTAGE_FEE: 0.25, // Applies to No-Show/Cancellation protection charges
    NO_SHOW_FLAT_FEE: 0, // Applies to No-Show/Cancellation protection charges
    ONLINE_RETAIL_FLAT_FEE: 0.5, // Applies to OGV/EComm transactions
    ONLINE_RETAIL_PERCENTAGE_FEE: 2.5091, // Applies to OGV/EComm transactions
    KLARNA_FLAT_FEE: 0.3, /// Applies to transactions using Klarna as a payment method
    KLARNA_PERCENTAGE_FEE: 6.0, // Applies to transactions using Klarna as a payment method

    // Online Booking Threshold Value - the amount over which online booking flat fee and percentage fee values will be charged, otherwise the fee tier amount will be charged
    ONLINE_BOOKING_FLAT_PERCENTAGE_THRESHOLD: 63.5,

    
    staff: [
      {
        name: "Jamie Regressionson",
        email: "jamie.regressionson@test.com",
        id: "O_3NytW6aUzwU4LVs9MWSw",
      },
    ],
  },
};
