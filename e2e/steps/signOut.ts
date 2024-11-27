import { Page } from '@playwright/test'

export const signOut = async (page: Page) => {
  await page.getByRole('link', { name: 'Sign out' }).click()
}
