import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('renders orders view table and Polish UI', async ({ page }) => {
    await page.goto('http://localhost:3000/orders-view')
    // Table headers in Polish should be visible
    await expect(page.getByRole('columnheader', { name: 'Numer ogłoszenia' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Historia' })).toBeVisible()
  })
})
