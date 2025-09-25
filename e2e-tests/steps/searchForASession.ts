import { Page } from '@playwright/test'
import TrackProgressPage from '../pages/trackProgressPage'
import HomePage from '../pages/homePage'

export default async (page: Page, homePage: HomePage) => {
  const trackProgressPage = new TrackProgressPage(page)

  await homePage.trackCommunityPaybackProgressLink.click()
  await trackProgressPage.expect.toBeOnThePage()

  await trackProgressPage.completeSearchForm()
  await trackProgressPage.submitForm()
  return trackProgressPage
}
