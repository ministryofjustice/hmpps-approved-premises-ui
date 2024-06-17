import { expect } from '@playwright/test'
import { test } from '../test'
import { signIn } from '../steps/signIn'

test('feedback banner', async ({ page, userWithoutRoles }) => {
  await signIn(page, userWithoutRoles)

  await page.goto('/')

  await page.getByRole('link', { name: 'Give us your feedback' }).click()

  await expect(page).toHaveTitle('Satisfaction survey - Approved Premises (AP) also known as CAS1')
})
