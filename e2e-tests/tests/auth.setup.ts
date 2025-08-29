import { expect } from '@playwright/test'
import test from '../test'

test('signOut', async ({ page }) => {
  await page.goto('/sign-out')
  await expect(page.locator('h1')).toContainText('Sign in')
})
