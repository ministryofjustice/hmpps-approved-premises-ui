import { expect, Page } from '@playwright/test'

export const completeRiskManagementPlan = async (page: Page) => {
  await page.locator('#textarea_RM28').fill('Currently in custody at HMP Moorland')
  await page.locator('#textarea_RM30').fill('Probation officer and prison offender manager')
  await page.locator('#textarea_RM31').fill('Test monitoring and control')
  await page.locator('#textarea_RM32').fill('Test interventions and treatment')
  await page.locator('#textarea_RM33').fill('Test victim safety planning')
  await page.locator('#textarea_RM34').fill('Test contingency plans')
  await page.locator('#textarea_RM35').fill('Test additional comments')
  await page.click('input[value="Save"]')

  // OASys can leave a resource request open after the page has rendered, so wait for the destination rather than "load".
  await page.click('input[value="Next"]', { noWaitAfter: true })
  await expect(page.locator('#contextleft > h3')).toHaveText('Summary Sheet (Layer 3)')
}
