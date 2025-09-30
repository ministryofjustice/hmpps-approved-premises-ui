import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'

export default async (page: Page, user: { username: string; password: string }): Promise<HomePage> => {
  const homePage = new HomePage(page)
  await homePage.visit()
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await homePage.expect.toBeOnThePage()
  return homePage
}
