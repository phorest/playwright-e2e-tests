export const testData = {
  URL: {
    BASE_URL: "https://my-dev.phorest.com",
    API_URL: "http://dev.phorest.com",
    API_GATEWAY_URL: "https://api-gateway-dev.phorest.com",
    GRAPHQL_URL: "https://api-gateway-dev.phorest.com/api-facade/graphql",
    TOKEN_URL: "https://api-gateway-dev.phorest.com/auth/oauth/token",
  },
  PAY_SALON: {
    ACCOUNT_ID: 47403,
    BUSINESS_ID: "x5Hz3_8G-PeOF3GeGcT-oQ",
    BRANCH_ID: "h6x5cwGfZwHmyoHPpS9Qkw",
    TERMINAL_ID: "tmr_F1ZwQgcHzZY0X5",
    STRIPE_KEY: process.env.UK_SECRET_KEY,
    staff: [
      {
        name: "Jamie Regressionson",
        email: "jamie.regressionson@test.com",
        id: "O_3NytW6aUzwU4LVs9MWSw",
      },
    ],
  },
};
