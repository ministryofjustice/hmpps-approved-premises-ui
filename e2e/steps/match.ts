import { Page } from '@playwright/test'
import { TestOptions } from '@approved-premises/e2e'
import { visitDashboard } from './apply'
import { ConfirmPage, ConfirmationPage, DetailsPage, ListPage, ResultsPage } from '../pages/match'
import { assignPlacementRequestToMe } from './workflow'

export const searchForBed = async (page: Page, personName: string) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickMatch()

  const listPage = new ListPage(page)
  await listPage.clickFirstPlacementRequest(personName)

  const detailsPage = new DetailsPage(page)
  await detailsPage.clickSearch()
}

export const chooseBed = async (page: Page) => {
  const resultsPage = new ResultsPage(page)
  await resultsPage.chooseBed()
}

export const confirmBooking = async (page: Page) => {
  const confirmPage = new ConfirmPage(page)
  await confirmPage.clickConfirm()
}

export const shouldShowBookingConfirmation = async (page: Page) => {
  const confirmationPage = new ConfirmationPage(page)
  await confirmationPage.shouldShowSuccessMessage()
}

export const matchAndBookApplication = async ({ page, person }: { page: Page; person: TestOptions['person'] }) => {
  // Given I visit the Dashboard
  const dashboard = await visitDashboard(page)

  // And I allocate the placement request to myself
  await assignPlacementRequestToMe(dashboard, page, user.name, id)

  // And I search for a bed
  await searchForBed(page, person.name)

  // And I select a matching bed
  await chooseBed(page)

  // And I confirm my booking
  await confirmBooking(page)

  // Then I should bee a confirmation screen
  await shouldShowBookingConfirmation(page)
}
