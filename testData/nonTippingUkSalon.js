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
    STORED_CARD_FLAT_FEE: 0.75, // Applies to stored card + VT
    STORED_CARD_PERCENTAGE_FEE: 1.26, // Applies to stored card + VT
    
    staff: [
      {
        name: "Jamie Regressionson",
        email: "jamie.regressionson@test.com",
        id: "O_3NytW6aUzwU4LVs9MWSw",
      },
    ],
  },
};
