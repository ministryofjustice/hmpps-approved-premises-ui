import { test } from '../test'
import { visitDashboard } from '../steps/apply'
import { signIn } from '../steps/signIn'
import { OutOfServiceBedsPage } from '../pages/manage/outOfServiceBedsPage'

test.describe.configure({ mode: 'parallel' })

test('View all out of service beds', async ({ page, cruMember }) => {
  // Given I am signed in as a CRU Member
  await signIn(page, cruMember)

  // And I am on the dashboard page
  const dashboard = await visitDashboard(page)

  // And I click the 'View out of service beds' tile
  dashboard.clickOutOfServiceBeds()

  // Then I am taken to the out of service beds page
  await OutOfServiceBedsPage.initialize(page, 'Out of service beds')
})
