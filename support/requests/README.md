# API Request Utilities

This module provides reusable functions for GraphQL API requests, making it easy to interact with the backend API in a consistent and reliable way.

## Usage

### Import the utilities

```javascript
import apiRequests from "../../../support/requests/api.requests.js";
// or
import { apiRequests } from "../../../support/requests/index.js";
```

### Basic Usage

```javascript
// Get authentication token
const token = await generalCommands.getAccessToken(page);

// Create a test client
const clientInfo = await apiRequests.createTestClient(
  request, 
  token, 
  "John", 
  "Doe", 
  "john@example.com", 
  "1234567890"
);

// Create a voucher
const voucherData = {
  clientId: clientInfo.id,
  issueDate: "2024-01-01",
  expiryDate: "2025-01-01",
  serial: "VOUCHER123",
  originalBalance: "100.00",
  remainingBalance: "100.00",
  notes: "Test voucher"
};

const voucherInfo = await apiRequests.createVoucher(request, token, voucherData);

// Cleanup
await apiRequests.forgetClient(request, token, clientInfo.id);
```

## Available Methods

### Client Management

- `createClient(request, token, clientData)` - Create a client with custom data
- `createTestClient(request, token, firstName, lastName, email, mobile)` - Create a test client with standard data
- `getClient(request, token, clientId)` - Retrieve client information
- `forgetClient(request, token, clientId)` - Delete/forget a client

### Voucher Management

- `createVoucher(request, token, voucherData)` - Create a voucher with custom data

### Utility Methods

- `executeGraphQLRequest(request, token, query, variables)` - Execute any GraphQL request
- `getHeaders(token)` - Get common headers for API requests

## Error Handling

All methods include comprehensive error handling:

- HTTP status validation
- GraphQL error detection
- Response structure validation
- Detailed error logging
- Graceful failure handling

## Benefits

- **Reusability**: Use across multiple test files
- **Consistency**: Standardized API interactions
- **Error Handling**: Built-in validation and error reporting
- **Maintainability**: Centralized API logic
- **Debugging**: Comprehensive logging for troubleshooting
