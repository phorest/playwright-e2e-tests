# Playwright E2E Tests

E2E test automation project using Playwright for testing web applications.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- Git

### 1. Fork and Clone

1. Fork this repository to your GitHub account
2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/playwright-e2e-tests.git
   cd playwright-e2e-tests
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Required for login tests
staffEmail=your-email@example.com
staffPassword=your-password

# Optional
REVISION_KEY=your-revision-key
apiUsername=your-api-username
apiPassword=your-api-password
MAILOSAURAPIKEY=your-mailosaur-api-key
```

### 4. Install Playwright Browsers

```bash
npx playwright install
```

### 5. Run Tests

```bash
# Run all tests
npm run test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/login.spec.js

# Run tests in debug mode
npx playwright test --debug
```

## 📁 Project Structure

```
playwright-e2e-tests/
├── .github/workflows/     # GitHub Actions CI/CD
├── fixtures/              # Test data and fixtures
├── locators/              # Centralized page locators
├── support/               # Helper functions and utilities
├── testData/              # Test data files
├── tests/                 # Test files
├── playwright.config.js   # Playwright configuration
└── package.json           # Dependencies and scripts
```

## 🧪 Writing Tests

### Test Structure

```javascript
import { test, expect } from '@playwright/test';
import { loginLocators } from '../locators/login/login.locators.js';

test('Test description', async ({ page }) => {
  await page.goto('/');
  // Your test steps here
});
```

### Using Locators

Import and use centralized locators:

```javascript
import { loginLocators } from '../locators/login/login.locators.js';

// Use in tests
await page.locator(loginLocators.emailInput).fill('email@example.com');
```

## 🔧 Configuration

### Playwright Config

The `playwright.config.js` file contains:
- Base URL configuration
- Browser settings
- Test timeouts
- Reporter settings

### GitHub Actions

The project includes GitHub Actions workflow for CI/CD:
- Automatic test execution on push/PR
- Browser installation
- Test report generation

## 📊 Test Reports

After running tests, reports are generated in:
- `playwright-report/` - HTML report
- `test-results/` - Test artifacts

View the HTML report:
```bash
npx playwright show-report
```

## 🐛 Troubleshooting

### Common Issues

1. **Browser not found**: Run `npx playwright install`
2. **Environment variables not loaded**: Check `.env` file exists
3. **Tests timing out**: Increase timeout in `playwright.config.js`

### Debug Mode

Run tests in debug mode to step through:
```bash
npx playwright test --debug
```

## 🤝 Contributing

1. Create a feature branch
2. Write your tests
3. Run tests locally
4. Create a pull request

