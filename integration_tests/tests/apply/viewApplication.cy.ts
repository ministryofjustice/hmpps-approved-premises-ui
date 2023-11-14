import { faker } from '@faker-js/faker/locale/en_GB'

import { ListPage, ShowPage } from '../../pages/apply'
import ConfirmationPage from '../../pages/match/placementApplicationWithdrawalConfirmationPage'
import Page from '../../pages/page'
import { setup } from './setup'
import { timelineEventFactory } from '../../../server/testutils/factories'
import placementApplication from '../../../server/testutils/factories/placementApplication'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import { ApprovedPremisesApplication as Application } from '../../../server/@types/shared'

context('show applications', () => {
  beforeEach(setup)

  it('shows a read-only version of the application', function test() {
    // Given I have completed an application
    const timeline = timelineEventFactory.buildList(10)

    const updatedApplication = { ...this.application, status: 'submitted' }
    cy.task('stubApplicationGet', { application: updatedApplication })
    cy.task('stubApplicationTimeline', { applicationId: updatedApplication.id, timeline })
    cy.task('stubApplications', [updatedApplication])

    // And I visit the list page
    const listPage = ListPage.visit([], [updatedApplication], [])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowInProgressApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, updatedApplication)

    // And I should see the application details
    showPage.shouldNotShowOfflineStatus()
    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()

    // When I click on the 'Timeline' tab
    // Then I should see timeline page
    showPage.clickTimelineTab()
    showPage.shouldShowTimeline(timeline)
  })

  it('links to an assessment when an application has been assessed', function test() {
    // Given I have completed an application
    const application = {
      ...this.application,
      status: 'submitted',
      assessmentDecision: 'accepted',
      assessmentDecisionDate: '2023-01-01',
      assessmentId: faker.string.uuid(),
    }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    // And I visit the list page
    const listPage = ListPage.visit([], [], [application])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowSubmittedApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And I should see details of the assessment
    showPage.shouldShowAssessmentDetails()
  })

  it('should show an offline application', function test() {
    const application = {
      ...this.application,
      type: 'Offline',
      status: undefined,
    }
    cy.task('stubApplicationGet', { application })

    // And I visit the application page
    ShowPage.visit(application)

    // Then I should see a stub application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And the application should show as offline
    showPage.shouldShowOfflineStatus()

    // And I should see the person information
    showPage.shouldShowPersonInformation()
  })

  it('should show placement applications', function test() {
    const { application, placementApplication: releaseFollowingDecisionPlacementApplication } =
      makeReleaseFollowingDecisionPlacementApplication(this.application)
    const rotlPlacementApplication = makeRotlPlacementApplication(application.id)
    const additionalPlacementApplication = makeAdditionalPlacementApplication(application.id)
    const placementApplications = [
      releaseFollowingDecisionPlacementApplication,
      rotlPlacementApplication,
      additionalPlacementApplication,
    ]
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplicationPlacementRequests', {
      applicationId: application.id,
      placementApplications,
    })
    placementApplications.forEach(pa => {
      cy.task('stubPlacementApplication', pa)
      cy.task('stubSubmitPlacementApplicationWithdraw', pa)
    })

    // Given I visit the application page
    ShowPage.visit(application)
    const showPage = Page.verifyOnPage(ShowPage, application)

    // When I click the 'Request a placement' tab
    showPage.clickRequestAPlacementTab()

    // Then I should see the placement requests
    showPage.shouldShowPlacementApplications(placementApplications, application)

    // Given I want to withdraw a placement application
    // When I click 'withdraw'
    showPage.clickWithdraw(placementApplications[0].id)

    // Then I should see the confirmation page
    const confirmationPage = Page.verifyOnPage(ConfirmationPage, application)

    // And be able to confirm withdrawal
    confirmationPage.clickConfirm()

    // And I should see the confirmation message
    showPage.showsWithdrawalConfirmationMessage()
  })
})

const makeReleaseFollowingDecisionPlacementApplication = (application: Application) => {
  let updatedApplication = addResponseToFormArtifact(application, {
    task: 'move-on',
    page: 'placement-duration',
    key: 'duration',
    value: '84',
  })

  updatedApplication = {
    ...updatedApplication,
    status: 'submitted',
    createdByUserId: '',
    assessmentDecision: 'accepted',
    assessmentDecisionDate: '2023-01-01',
    assessmentId: 'low',
  }

  let releaseFollowingDecisionPlacementApplication = placementApplication.build({ applicationId: application.id })

  releaseFollowingDecisionPlacementApplication = addResponseToFormArtifact(
    releaseFollowingDecisionPlacementApplication,
    {
      task: 'request-a-placement',
      page: 'reason-for-placement',
      key: 'reason',
      value: 'release_following_decision',
    },
  )

  releaseFollowingDecisionPlacementApplication = addResponseToFormArtifact(
    releaseFollowingDecisionPlacementApplication,
    {
      task: 'request-a-placement',
      page: 'decision-to-release',
      key: 'decisionToReleaseDate',
      value: '2024-01-01',
    },
  )

  return { application: updatedApplication, placementApplication: releaseFollowingDecisionPlacementApplication }
}

const makeRotlPlacementApplication = (applicationId: string) => {
  let rotlPlacementApplication = placementApplication.build({ applicationId })

  rotlPlacementApplication = addResponseToFormArtifact(rotlPlacementApplication, {
    task: 'request-a-placement',
    page: 'reason-for-placement',
    key: 'reason',
    value: 'rotl',
  })
  rotlPlacementApplication = addResponsesToFormArtifact(rotlPlacementApplication, {
    task: 'request-a-placement',
    page: 'dates-of-placement',
    keyValuePairs: {
      arrivalDate: '2023-01-01',
      durationDays: '20',
      duration: '20',
    },
  })
  return rotlPlacementApplication
}

const makeAdditionalPlacementApplication = (applicationId: string) => {
  let additionalPlacementApplication = placementApplication.build({ applicationId })

  additionalPlacementApplication = addResponseToFormArtifact(additionalPlacementApplication, {
    task: 'request-a-placement',
    page: 'reason-for-placement',
    key: 'reason',
    value: 'additional_placement',
  })

  additionalPlacementApplication = addResponsesToFormArtifact(additionalPlacementApplication, {
    task: 'request-a-placement',
    page: 'additional-placement-details',
    keyValuePairs: {
      arrivalDate: '2024-05-21',
      durationDays: '10',
      duration: '10',
    },
  })

  return additionalPlacementApplication
}
