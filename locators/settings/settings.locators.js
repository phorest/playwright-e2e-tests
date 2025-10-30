/**
 * Settings page locators
 */

export const settingsLocators = {
    managerLink: (page) => page.getByRole("link", { name: "Manager" }),
    settingsLink: (page) => page.getByRole("link", { name: "settings-icon Settings" }),
    iframe: (page) => page.frameLocator('iframe[name="iframe-embed"]'),
    onlineLink: (iframe) => iframe.getByRole("link", { name: "Online" }),
    openingLink: (iframe) => iframe.getByRole("link", { name: "Opening Hours" }),
    contactInfo: (iframe) => iframe.getByRole("link", { name: "Contact Info" }),
    copyLinkButton: (iframe) => iframe.getByRole("button", { name: "Copy link" }),
    openingRow: (iframe, day) => iframe.locator("tr.lt-row", { hasText: day }).first(),
    inputField: (iframe, nameAttr) => iframe.locator(`input[name='${nameAttr}']`)
};

