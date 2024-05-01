import { expect } from '@playwright/test'
import { test } from '../test'

test('feedback banner', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Give us your feedback' }).click()

  await expect(page).toHaveTitle('Satisfaction survey - Approved Premises (AP) also known as CAS1')
})
