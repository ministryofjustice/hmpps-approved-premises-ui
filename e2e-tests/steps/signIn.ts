import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'

export default async (page: Page, user: { username: string; password: string }): Promise<HomePage> => {
  const homePage = new HomePage(page)
  await homePage.visit()
  await page.getByLabel('Username').fill(user.username)

  // Don't enter password via user input to prevent it being logged in the report
  await page.getByLabel('Password').evaluate((input: HTMLInputElement, password: string) => {
    /* eslint no-param-reassign: "off" */
    input.value = password
  }, user.password)

  await page.getByRole('button', { name: 'Sign in' }).click()
  await homePage.expect.toBeOnThePage()
  return homePage
}
