import { ListPage, StartPage } from '../../pages/apply'

import {
  applicationSummaryFactory,
  personFactory,
  placementApplicationFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import ReasonForPlacementPage from '../../pages/match/placementRequestForm/reasonForPlacement'
import { signIn } from '../signIn'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as an applicant
    signIn('applicant')
  })

  it('shows the dashboard ', () => {
    // Given there are applications in the database
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

  it('shows the dashboard lao', () => {
    // Given there are applications in the database
    const inProgressApplications = applicationSummaryFactory.buildList(1, {
      status: 'started',
      person: personFactory.build({ isRestricted: true }),
    })
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
      // Given there are applications in the database
      const inProgressApplications = applicationSummaryFactory.buildList(5, {
        status: 'started',
        hasRequestsForPlacement: false,
      })
      const requestedFurtherInformationApplications = applicationSummaryFactory.buildList(5, {
        status: 'requestedFurtherInformation',
        hasRequestsForPlacement: false,
      })
      const awaitingPlacementApplications = applicationSummaryFactory.buildList(5, {
        status: 'awaitingPlacement',
        hasRequestsForPlacement: false,
      })
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
