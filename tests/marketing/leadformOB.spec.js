const { test, expect } = require('@playwright/test');

test.describe('Marketing', () => {

  // Validate that user can submit lead form on OB      
  test('Validate that a lead can submit the form on OB', async ({ page }) => {
    const unique = (new Date().getTime()) + '';
    const LeadFirstName = 'Lead' + unique; 
    const LeadLastName = 'Surname' + unique; 
    const MobilePhoneNumber = '0' + unique; 
    const Email = unique + '@gmail.com';
    
    // Wait for the form to load
    const formLoadPromise = page.waitForResponse(response => 
      response.url().includes('/consultations/form') && response.status() === 200
    );
    
    await page.goto('https://dev.phorest.com/salon/testuser-4524/book/consultations/form?lead_source=ONLINE_BOOKING', { timeout: 1000 });
    await formLoadPromise;
    
    // Verify page loaded
    await expect(page.getByText('Request a Call Back')).toBeVisible();
    await page.waitForTimeout(5000);
    
    // Fill in first name
    await page.locator('[data-testid="firstNameInput"]').waitFor({ state: 'visible', timeout: 100 });
    await page.locator('[data-testid="firstNameInput"]').click({ force: true });
    await page.locator('[data-testid="firstNameInput"]').fill(LeadFirstName);
    
    // Fill in last name
    await page.locator('[data-testid="lastNameInput"]').waitFor({ state: 'visible', timeout: 100 });
    await page.locator('[data-testid="lastNameInput"]').click();
    await page.locator('[data-testid="lastNameInput"]').fill(LeadLastName);
    
    // Fill in phone number
    await page.locator('[data-testid="phoneInput"]').waitFor({ state: 'visible', timeout: 100 });
    await page.locator('[data-testid="phoneInput"]').click();
    await page.locator('[data-testid="phoneInput"]').fill(MobilePhoneNumber);
    
    // Fill in email
    await page.locator('[data-testid="emailInput"]').waitFor({ state: 'visible', timeout: 100 });
    await page.locator('[data-testid="emailInput"]').click();
    await page.locator('[data-testid="emailInput"]').fill(Email);
    
    // Select email option (clicking the second image)
    await page.locator('img').nth(1).click();
    
    // Add a note
    await page.locator('[data-testid="noteInput"]').click();
    await page.locator('[data-testid="noteInput"]').fill("Hello, can you tell me more about the packages you offer at your salon?");
    
    // Submit the form
    await page.locator('[data-testid="submitButton"]').click();
    
    // Assert that lead form is submitted and user can see the return button
    await expect(page.locator('[data-testid="goToHomePageButton"]')).toHaveText('Return to Home Page');
  });

});