import { ListPage, StartPage } from '../../pages/apply'

import { applicationSummaryFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the dashboard ', () => {
    // Given I am logged in
    cy.signIn()

    // And there are applications in the database
    const inProgressApplications = applicationSummaryFactory.buildList(5, { status: 'started' })
    const submittedApplications = applicationSummaryFactory.buildList(5, { status: 'submitted' })
    const requestedFurtherInformationApplications = applicationSummaryFactory.buildList(5, {
      status: 'requestedFurtherInformation',
    })
    const awaitingPlacementApplications = applicationSummaryFactory.buildList(5, { status: 'awaitingPlacement' })

    cy.task(
      'stubApplications',
      [
        inProgressApplications,
        submittedApplications,
        requestedFurtherInformationApplications,
        awaitingPlacementApplications,
      ].flat(),
    )

    // When I visit the Previous Applications page
    const page = ListPage.visit(inProgressApplications, submittedApplications, requestedFurtherInformationApplications)

    // Then I should see all of the in progress applications
    page.shouldShowInProgressApplications()

    // And I click on the Further Information Requested tab
    page.clickFurtherInformationRequestedTab()

    // Then I should see the applications where further information has been requested
    page.shouldShowFurtherInformationRequestedApplications()

    // And I click on the submitted tab
    page.clickSubmittedTab()

    // Then I should see the applications that have been submitted
    page.shouldShowSubmittedApplications()

    // And I the button should take me to the application start page
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })
})
