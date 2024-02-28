import { ListPage, StartPage } from '../../pages/apply'

import { applicationSummaryFactory, placementApplicationFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import ReasonForPlacementPage from '../../pages/match/placementRequestForm/reasonForPlacement'

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

  it('request for placement for my application status awaiting placement ', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      // Given I am logged in
      cy.signIn()

      // And there are applications in the database
      const inProgressApplications = applicationSummaryFactory.buildList(5, { status: 'started' })
      const requestedFurtherInformationApplications = applicationSummaryFactory.buildList(5, {
        status: 'requestedFurtherInformation',
      })
      const awaitingPlacementApplications = applicationSummaryFactory.buildList(5, { status: 'awaitingPlacement' })
      const applicationId = awaitingPlacementApplications[0].id
      cy.task(
        'stubApplications',
        [inProgressApplications, requestedFurtherInformationApplications, awaitingPlacementApplications].flat(),
      )

      // And there is a placement application in the DB
      const placementApplicationId = '123'
      const placementApplication = placementApplicationFactory.build({
        id: placementApplicationId,
        data: placementApplicationData,
        applicationId,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)

      // When I visit the Previous Applications page
      const page = ListPage.visit(
        inProgressApplications,
        awaitingPlacementApplications,
        requestedFurtherInformationApplications,
      )

      // And I click on the submitted tab
      page.clickSubmittedTab()

      // Then I should be able to create a placement
      page.clickRequestForPlacementLink()

      // And I should be on placement request
      ReasonForPlacementPage.visit(placementApplicationId)
    })
  })
})
