import { expect } from "@playwright/test";
import { Salon } from '../testData/salonData.js';
import fs from 'fs'
import path from 'path'

class generalCommands {
    // Login
    async loginAPI(page, request, staffEmail) {
        const response = await request.post(Salon.TOKEN_URL, {
            data: {
                "grant_type": "basic",
                "client_type": "user",
                "username": staffEmail,
                "password": process.env.staffPassword
            }
        });
        await expect(response.ok()).toBeTruthy();
        await expect(response.status()).toBe(200);
        let responseJSON = await response.json();
        let tokenValue = responseJSON.access_token;

        // Navigate to the page first to establish a proper context
        await page.goto('/');
        
        // Wait for the page to be ready
        await page.waitForLoadState('domcontentloaded');
        
        // Set localStorage in the page context
        await page.evaluate((token) => {
            localStorage.setItem('access-token', token);
        }, tokenValue);

        await this.checkRevisionKey(page);
    }

    async checkRevisionKey(page) {
        const revisionKey = process.env.REVISION_KEY;
        if (!revisionKey) {
            await page.goto('/');
        } else {
            await page.goto(Salon.BASE_URL + '/?revision=' + revisionKey);
        }
    }
    
    async loadFeatureFlags(page) {
        // Read the fixture file
        const fixturePath = path.join(__dirname, '../fixtures/feature_flags.json')
        const featureFlags = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))

        // Turn on each feature flag
        for (const index in featureFlags) {
            //await turnOnFeatureFlag(page, featureFlags[index])
            await page.evaluate((flag) => { window.__LD__.enable(flag) }, featureFlags[index])
        }
    }

}

module.exports = new generalCommands()