import { expect } from '@playwright/test'
import test from '../test'

import signIn from '../steps/signIn'

test('Search project sessions', async ({ page, deliusUser }) => {
  await signIn(page, deliusUser)
  await expect(page.locator('h1')).toContainText('Community Payback')
  await page.getByRole('link', { name: 'Track progress on Community Payback' }).click()
  await expect(page.locator('h1')).toContainText('Track progress on Community Payback')
})
