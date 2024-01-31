import { faker } from '@faker-js/faker/locale/en_GB'

import { ListPage, NotesConfirmationPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './setup'
import { noteFactory, timelineEventFactory, withdrawableFactory } from '../../../server/testutils/factories'
import placementApplication from '../../../server/testutils/factories/placementApplication'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../../server/testutils/addToApplication'
import { ApprovedPremisesApplication as Application, User } from '../../../server/@types/shared'
import { defaultUserId } from '../../mockApis/auth'
import paths from '../../../server/paths/api'
import { withdrawPlacementRequestOrApplication } from '../../support/helpers'

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
      makeReleaseFollowingDecisionPlacementApplication(this.application, defaultUserId)
    const rotlPlacementApplication = makeRotlPlacementApplication(application.id)
    const additionalPlacementApplication = makeAdditionalPlacementApplication(application.id)
    const placementApplications = [
      releaseFollowingDecisionPlacementApplication,
      rotlPlacementApplication,
      additionalPlacementApplication,
    ]

    const withdrawable = withdrawableFactory.build({
      id: releaseFollowingDecisionPlacementApplication.id,
      type: 'placement_application',
    })
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplicationPlacementRequests', {
      applicationId: application.id,
      placementApplications,
    })
    cy.task('stubWithdrawables', { applicationId: application.id, withdrawables: [withdrawable] })
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
    showPage.shouldShowPlacementApplications(placementApplications, application, {
      id: defaultUserId,
    })

    // Given I want to withdraw a placement application
    // When I click 'withdraw'
    showPage.clickWithdraw(placementApplications[0].id)

    withdrawPlacementRequestOrApplication(withdrawable, showPage, {
      isPlacementRequest: false,
    })

    // And the API should have been called with the withdrawal reason
    cy.task('verifyPlacementApplicationWithdrawn', releaseFollowingDecisionPlacementApplication.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(
        paths.placementApplications.withdraw({ id: releaseFollowingDecisionPlacementApplication.id }),
      )

      const body = JSON.parse(requests[0].body)

      expect(body.reason).to.equal('DuplicatePlacementRequest')
    })
  })

  it('should allow me to add a note to an application', function test() {
    const application = {
      ...this.application,
      status: 'submitted',
    }

    const timeline = timelineEventFactory.buildList(10)
    const note = noteFactory.build()
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline })
    cy.task('stubApplicationNote', { applicationId: application.id, note })

    // Given I am on the timeline page of the application view
    const showPage = ShowPage.visit(application, 'timeline')

    // When I enter a note into the text box
    showPage.enterNote(note)
    showPage.clickAddNote()

    const noteAsTimelineEvent = timelineEventFactory.build({
      content: note.note,
      createdBy: note.createdByUser,
      id: 'some-id',
      occurredAt: note.createdAt,
      type: 'application_timeline_note',
    })

    const updatedTimeline = [...timeline, noteAsTimelineEvent]
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline: updatedTimeline })

    // Then I should see a confirmation page
    const confirmationPage = Page.verifyOnPage(NotesConfirmationPage, application)

    confirmationPage.shouldShowNote(note)

    // When I click 'Confirm'
    confirmationPage.clickConfirm()

    // Then I should see a flash confirming the note has been added
    showPage.showsNoteAddedConfirmationMessage()

    // And I should see the note in the timeline
    showPage.shouldShowTimeline(updatedTimeline)

    // And the API should have been called with the new note
    cy.task('verifyApplicationNoteAdded', { id: application.id }).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(paths.applications.addNote({ id: application.id }))

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys('note')
    })
  })
})

const makeReleaseFollowingDecisionPlacementApplication = (application: Application, userId: User['id']) => {
  let updatedApplication = addResponseToFormArtifact(application, {
    task: 'move-on',
    page: 'placement-duration',
    key: 'duration',
    value: '84',
  })

  updatedApplication = {
    ...updatedApplication,
    status: 'submitted',
    createdByUserId: userId,
    assessmentDecision: 'accepted',
    assessmentDecisionDate: '2023-01-01',
    assessmentId: 'low',
  }

  let releaseFollowingDecisionPlacementApplication = placementApplication.build({
    applicationId: application.id,
    createdByUserId: userId,
  })

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
  rotlPlacementApplication = addResponseToFormArtifact(rotlPlacementApplication, {
    task: 'request-a-placement',
    page: 'dates-of-placement',
    key: 'datesOfPlacement',
    value: [
      {
        arrivalDate: '2023-01-01',
        durationDays: '20',
        duration: '20',
      },
      {
        arrivalDate: '2024-01-01',
        durationDays: '10',
        durationWeeks: '1',
        duration: '17',
      },
    ],
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
