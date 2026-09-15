import { ListPage, StartPage } from '../../pages/apply'

import {
  applicationFactory,
  cas1ApplicationSummaryFactory,
  personFactory,
  placementApplicationFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'

import { signIn } from '../signIn'
import CheckSentenceTypePage from '../../pages/match/placementRequestForm/checkSentenceType'
import { defaultUserId } from '../../mockApis/auth'
import applicationDocument from '../../fixtures/applicationDocument.json'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')

    GIVEN('I am signed in as an applicant')
    signIn('applicant')
  })

  it('shows the dashboard ', () => {
    GIVEN('there are applications in the database')
    const inProgressApplications = cas1ApplicationSummaryFactory.buildList(5, { status: 'started' })
    const submittedApplications = cas1ApplicationSummaryFactory.buildList(5, { status: 'awaitingAssesment' })
    const requestedFurtherInformationApplications = cas1ApplicationSummaryFactory.buildList(5, {
      status: 'requestedFurtherInformation',
    })
    const awaitingPlacementApplications = cas1ApplicationSummaryFactory.buildList(5, { status: 'awaitingPlacement' })
    const inactiveApplications = [
      ...cas1ApplicationSummaryFactory.buildList(3, { status: 'expired' }),
      ...cas1ApplicationSummaryFactory.buildList(3, { status: 'withdrawn' }),
    ]

    cy.task(
      'stubApplications',
      [
        inProgressApplications,
        submittedApplications,
        requestedFurtherInformationApplications,
        awaitingPlacementApplications,
        inactiveApplications,
      ].flat(),
    )

    WHEN('I visit the Previous Applications page')
    const page = ListPage.visit(
      inProgressApplications,
      submittedApplications,
      requestedFurtherInformationApplications,
      inactiveApplications,
    )

    THEN('I should see all of the in progress applications')
    page.shouldShowInProgressApplications()

    AND('I click on the Further Information Requested tab')
    page.clickFurtherInformationRequestedTab()

    THEN('I should see the applications where further information has been requested')
    page.shouldShowFurtherInformationRequestedApplications()

    AND('I click on the submitted tab')
    page.clickSubmittedTab()

    THEN('I should see the applications that have been submitted')
    page.shouldShowSubmittedApplications()

    AND('I click on the inactive tab')
    page.clickInactiveTab()

    THEN('I should see the applications that are expired or withdrawn')
    page.shouldShowInactiveApplications()

    AND('I the button should take me to the application start page')
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })

  it('shows the dashboard lao', () => {
    GIVEN('there are applications in the database')
    const inProgressApplications = cas1ApplicationSummaryFactory.buildList(1, {
      status: 'started',
      person: personFactory.build({ isRestricted: true }),
    })
    const submittedApplications = cas1ApplicationSummaryFactory.buildList(5, { status: 'awaitingAssesment' })
    const requestedFurtherInformationApplications = cas1ApplicationSummaryFactory.buildList(5, {
      status: 'requestedFurtherInformation',
    })
    const awaitingPlacementApplications = cas1ApplicationSummaryFactory.buildList(5, { status: 'awaitingPlacement' })

    cy.task(
      'stubApplications',
      [
        inProgressApplications,
        submittedApplications,
        requestedFurtherInformationApplications,
        awaitingPlacementApplications,
      ].flat(),
    )

    WHEN('I visit the Previous Applications page')
    const page = ListPage.visit(inProgressApplications, submittedApplications, requestedFurtherInformationApplications)

    THEN('I should see all of the in progress applications')
    page.shouldShowInProgressApplications()

    AND('I click on the Further Information Requested tab')
    page.clickFurtherInformationRequestedTab()

    THEN('I should see the applications where further information has been requested')
    page.shouldShowFurtherInformationRequestedApplications()

    AND('I click on the submitted tab')
    page.clickSubmittedTab()

    THEN('I should see the applications that have been submitted')
    page.shouldShowSubmittedApplications()

    AND('I the button should take me to the application start page')
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })

  it('request for placement for my application status awaiting placement ', () => {
    cy.fixture('paroleBoardPlacementApplication.json').then(placementApplicationData => {
      GIVEN('there are applications in the database')
      const inProgressApplications = cas1ApplicationSummaryFactory.buildList(5, {
        status: 'started',
        hasRequestsForPlacement: false,
      })
      const requestedFurtherInformationApplications = cas1ApplicationSummaryFactory.buildList(5, {
        status: 'requestedFurtherInformation',
        hasRequestsForPlacement: false,
      })
      const awaitingPlacementApplications = cas1ApplicationSummaryFactory.buildList(5, {
        status: 'awaitingPlacement',
        hasRequestsForPlacement: false,
      })
      const applicationId = awaitingPlacementApplications[0].id
      cy.task(
        'stubApplications',
        [inProgressApplications, requestedFurtherInformationApplications, awaitingPlacementApplications].flat(),
      )
      const completedApplication = applicationFactory.completed('accepted').build({
        id: applicationId,
        createdByUserId: defaultUserId,
        person: personFactory.build(),
        document: applicationDocument,
      })

      AND('there is a placement application in the DB')
      const placementApplication = placementApplicationFactory.build({
        data: placementApplicationData,
        applicationId,
      })
      cy.task('stubCreatePlacementApplication', placementApplication)
      cy.task('stubPlacementApplication', placementApplication)
      cy.task('stubApplicationGet', { application: completedApplication })

      WHEN('I visit the Previous Applications page')
      const page = ListPage.visit(
        inProgressApplications,
        awaitingPlacementApplications,
        requestedFurtherInformationApplications,
      )

      AND('I click on the submitted tab')
      page.clickSubmittedTab()

      THEN('I should be able to create a placement')
      page.clickLink('Create placement request')

      AND('I should be on placement request')
      Page.verifyOnPage(CheckSentenceTypePage, placementApplication.id)
    })
  })
})
