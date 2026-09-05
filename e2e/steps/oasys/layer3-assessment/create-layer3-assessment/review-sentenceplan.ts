import { Page } from '@playwright/test'

const selectWrappingOption = async (page: Page, id: string, option: string) => {
  await page.locator(`#${id}`).click()
  await page.locator(`#${id}-menu`).getByRole('option', { name: option, exact: true }).click()
}

export const completeReviewSentencePlan = async (page: Page) => {
  await page.getByRole('link', { name: 'Sentence Plan Service', exact: true }).click()
  await page.getByRole('button', { name: 'Open Sentence Plan Service' }).click()

  await page.locator('#confirm_privacy').check()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await page.getByRole('button', { name: 'Create goal' }).click()

  await page.locator('#area_of_need').check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  await page.locator('#goal_title').fill('Find suitable accommodation')
  await page.locator('#is_related_to_other_areas-2').check()
  await page.locator('#can_start_now').check()
  await page.locator('#target_date_option').check()
  await page.getByRole('button', { name: 'Add Steps' }).click()

  await selectWrappingOption(page, 'step_actor_0', 'Probation practitioner')
  await page.locator('#step_description_0').fill('Support the person to find suitable accommodation')
  await selectWrappingOption(page, 'step_status_0', 'In progress')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('button', { name: 'Agree plan' }).click()
  await page.getByRole('radio', { name: 'Yes, I agree' }).check()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('button', { name: 'Return to OASys' }).click()
}
