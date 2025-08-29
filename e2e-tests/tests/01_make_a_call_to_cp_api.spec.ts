import { expect } from '@playwright/test'
import test from '../test'

import signIn from '../steps/signIn'

test('make a call to the Community Payback API', async ({ page, deliusUser }) => {
  await signIn(page, deliusUser)
  await expect(page.locator('p').first()).toContainText('"apiName":"hmpps-community-payback-api"')
})
