import test from '../test'

import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'

test('Search project sessions', async ({ page, deliusUser }) => {
  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()
})
