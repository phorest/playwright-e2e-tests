# Utility Functions

This module contains reusable utility functions for test automation.

## Date Utilities (`date.utils.js`)

### Basic Date Functions

```javascript
import { getCurrentDate, getCurrentDatePlusOne, getFutureDate } from '../../../support/utils/date.utils.js';

// Get current date (today)
const today = getCurrentDate(); // "2024-01-15"

// Get tomorrow's date
const tomorrow = getCurrentDatePlusOne(); // "2024-01-16"

// Get future date (one year from now)
const future = getFutureDate(); // "2025-01-15"
```

### Advanced Date Functions

```javascript
import { getDateWithOffset, getDateWithYearOffset } from '../../../support/utils/date.utils.js';

// Get date with day offset
const nextWeek = getDateWithOffset(7); // 7 days from now
const lastWeek = getDateWithOffset(-7); // 7 days ago

// Get date with year offset
const nextYear = getDateWithYearOffset(1); // 1 year from now
const lastYear = getDateWithYearOffset(-1); // 1 year ago
```

### Voucher-Specific Functions

```javascript
import { getVoucherDates, generateVoucherTestData } from '../../../support/utils/date.utils.js';

// Get common voucher dates
const { issueDate, expiryDate, tomorrowDate } = getVoucherDates();

// Generate complete test data
const { serialNumber, issueDate, expiryDate } = generateVoucherTestData();
```

### Serial Number Generation

```javascript
import { generateSerialNumber } from '../../../support/utils/date.utils.js';

// Generate unique serial number
const serial = generateSerialNumber(); // "1705123456789"

// Generate with prefix
const prefixedSerial = generateSerialNumber("VOUCHER-"); // "VOUCHER-1705123456789"
```

## Usage Examples

### Basic Test Setup

```javascript
import { generateVoucherTestData } from '../../../support/utils/date.utils.js';

test('My test', async ({ page }) => {
  // Generate all test data at once
  const { serialNumber, issueDate, expiryDate } = generateVoucherTestData();
  
  // Use in test
  await page.fill('#serial', serialNumber);
  await page.fill('#issue-date', issueDate);
});
```

### Custom Date Calculations

```javascript
import { getDateWithOffset, getCurrentDate } from '../../../support/utils/date.utils.js';

test('My test', async ({ page }) => {
  const today = getCurrentDate();
  const nextWeek = getDateWithOffset(7);
  const lastMonth = getDateWithOffset(-30);
  
  // Use dates in test
});
```

## Benefits

- **Consistency**: All date functions return YYYY-MM-DD format
- **Reusability**: Use across multiple test files
- **Maintainability**: Centralized date logic
- **Flexibility**: Support for various date calculations
- **Type Safety**: Clear function signatures and documentation

## Date Format

All date functions return dates in **YYYY-MM-DD** format for consistency with:
- API requests
- Database operations
- Form inputs
- Test assertions

## Error Handling

All date functions are pure functions with no side effects:
- No network calls
- No file system operations
- No external dependencies
- Deterministic results
