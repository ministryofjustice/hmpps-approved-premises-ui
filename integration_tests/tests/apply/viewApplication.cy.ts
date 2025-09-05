import { faker } from '@faker-js/faker/locale/en_GB'

import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { ListPage, NotesConfirmationPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './setup'
import {
  applicationFactory,
  assessmentFactory,
  cas1TimelineEventFactory,
  noteFactory,
  placementApplicationFactory,
  requestForPlacementFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'
import { defaultUserId } from '../../mockApis/auth'
import paths from '../../../server/paths/api'
import { withdrawPlacementRequestOrApplication } from '../../support/helpers'
import applicationDocument from '../../fixtures/applicationDocument.json'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('show applications', () => {
  beforeEach(setup)

  it('shows a read-only version of the application', function test() {
    GIVEN('I have completed an application')
    const timeline = cas1TimelineEventFactory.buildList(10)

    const updatedApplication = { ...this.application, status: 'awaitingAssesment', document: applicationDocument }
    cy.task('stubApplicationGet', { application: updatedApplication })
    cy.task('stubApplicationTimeline', { applicationId: updatedApplication.id, timeline })
    cy.task('stubApplications', [updatedApplication])

    AND('I visit the list page')
    const listPage = ListPage.visit([], [updatedApplication], [])

    WHEN('I click on`the Submitted tab')
    listPage.clickSubmittedTab()

    THEN('I should see my application')
    listPage.shouldShowInProgressApplications()

    WHEN('I click`on my application')
    listPage.clickApplication(this.application)

    THEN('I should see a read-only version of the application')
    const showPage = Page.verifyOnPage(ShowPage, updatedApplication)

    AND('I should see the application details')
    showPage.shouldNotShowOfflineStatus()
    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()

    showPage.clickOpenActionsMenu()
    showPage.shouldHaveWithdrawalLink()

    WHEN(`I click on the 'Timeline' tab`)
    showPage.clickTimelineTab()

    THEN('I should see timeline page')
    showPage.shouldShowApplicationTimeline(timeline)
  })

  it('shows a read-only version of an unsubmitted withdrawn application', function test() {
    GIVEN('I have a withdrawn unsubmitted application')
    const assessmentDecision = assessmentFactory.build({ decision: 'accepted' })
    const updatedApplication = {
      ...this.application,
      status: 'withdrawn',
      document: undefined,
      assessmentDecision: assessmentDecision.decision,
      assessmentDecisionDate: assessmentDecision.createdAt,
      assessmentId: assessmentDecision.id,
    }
    cy.task('stubApplicationGet', { application: updatedApplication })

    THEN('I should see a read-only version of the application')
    const showPage = ShowPage.visit(updatedApplication, 'application')

    AND(`I should see a 'Withdrawn application' status tag`)
    showPage.shouldShowStatusTag('withdrawn')

    AND('I should see a link to the assessment with guidance')
    showPage.shouldShowAssessmentDetails()

    AND('I should see the application details')
    showPage.shouldShowResponsesForUnsubmittedWithdrawnApplication()

    WHEN(`I click the 'Request for placement' tab`)
    const requestsForPlacement = requestForPlacementFactory.buildList(1, { status: 'request_withdrawn' })
    cy.task('stubApplicationRequestsForPlacement', {
      applicationId: updatedApplication.id,
      requestsForPlacement,
    })
    showPage.clickRequestAPlacementTab()

    THEN(`I do not see the 'Create request for placement' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('shows a read-only version of an expired application', function test() {
    GIVEN('I have an expired application')
    const assessmentDecision = assessmentFactory.build({ decision: 'accepted' })
    const updatedApplication = {
      ...this.application,
      status: 'expired',
      document: undefined,
      assessmentDecision: assessmentDecision.decision,
      assessmentDecisionDate: assessmentDecision.createdAt,
      assessmentId: assessmentDecision.id,
    }
    cy.task('stubApplicationGet', { application: updatedApplication })

    THEN('I should see a read-only version of the application')
    const showPage = ShowPage.visit(updatedApplication, 'application')

    AND(`I should see an 'Expired application' status tag`)
    showPage.shouldShowStatusTag('expired')

    AND('I should see a link to the assessment with guidance')
    showPage.shouldShowAssessmentDetails(true)

    WHEN(`I click the 'Request for placement' tab`)
    cy.task('stubApplicationRequestsForPlacement', {
      applicationId: updatedApplication.id,
      requestsForPlacement: [],
    })
    showPage.clickRequestAPlacementTab()

    THEN(`I do not see the 'Create request for placement' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('links to an assessment when an application has been assessed', function test() {
    GIVEN('I have completed an application')
    const application = {
      ...this.application,
      status: 'awaitingAssesment',
      assessmentDecision: 'accepted',
      assessmentDecisionDate: '2023-01-01',
      assessmentId: faker.string.uuid(),
      document: applicationDocument,
    }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    AND('I visit the list page')
    const listPage = ListPage.visit([], [], [application])

    WHEN('I click on the Submitted tab')
    listPage.clickSubmittedTab()

    THEN('I should see my application')
    listPage.shouldShowSubmittedApplications()

    WHEN('I clickon my application')
    listPage.clickApplication(this.application)

    THEN('I should see a read-only version of the application')
    const showPage = Page.verifyOnPage(ShowPage, application)

    AND('I should see details of the assessment')
    showPage.shouldShowAssessmentDetails()
  })

  it('should show an offline application', function test() {
    const application = {
      ...this.application,
      type: 'Offline',
      document: undefined,
      status: undefined,
    }
    cy.task('stubApplicationGet', { application })

    AND('I visit the application page')
    ShowPage.visit(application)

    THEN('I should see a stub application')
    const showPage = Page.verifyOnPage(ShowPage, application)

    AND('the application should show as offline')
    showPage.shouldShowOfflineStatus()

    AND('I should see the person information')
    showPage.shouldShowPersonInformation()
  })

  it('should show requests for placement and allow their withdrawal', function test() {
    const application = applicationFactory.build({
      ...this.application,
      status: 'awaitingAssesment',
      createdByUserId: defaultUserId,
    })
    const requestsForPlacement = requestForPlacementFactory.buildList(4)
    const withdrawableRequestForPlacement = requestForPlacementFactory.build({
      canBeDirectlyWithdrawn: true,
      createdByUserId: defaultUserId,
    })
    const placementApplication = placementApplicationFactory.build({
      id: withdrawableRequestForPlacement.id,
      applicationId: application.id,
    })

    const withdrawable = withdrawableFactory.build({
      id: withdrawableRequestForPlacement.id,
      type: 'placement_application',
    })
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplicationRequestsForPlacement', {
      applicationId: application.id,
      requestsForPlacement: [...requestsForPlacement, withdrawableRequestForPlacement],
    })
    const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

    cy.task('stubWithdrawablesWithNotes', {
      applicationId: application.id,
      withdrawables,
    })
    cy.task('stubPlacementApplication', placementApplication)
    cy.task('stubSubmitPlacementApplicationWithdraw', placementApplication)

    GIVEN('I visit the application page')
    ShowPage.visit(this.application)
    const showPage = Page.verifyOnPage(ShowPage, application)

    WHEN(`I click the 'Request a placement' tab`)
    showPage.clickRequestAPlacementTab()

    THEN('I should see the placement requests')
    showPage.shouldShowRequestsForPlacement(requestsForPlacement, application, {
      id: defaultUserId,
    })

    GIVEN('I want to withdraw a placement application')
    WHEN(`I click 'withdraw'`)
    showPage.clickWithdraw(withdrawableRequestForPlacement.id)

    THEN('The placement application should be withdrawn and I should see a banner')
    withdrawPlacementRequestOrApplication(withdrawable, showPage, application.id)

    AND('the API should have been called with the withdrawal reason')
    cy.task('verifyPlacementApplicationWithdrawn', withdrawableRequestForPlacement.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(paths.placementApplications.withdraw({ id: withdrawableRequestForPlacement.id }))

      const body = JSON.parse(requests[0].body)

      expect(body.reason).to.equal('DuplicatePlacementRequest')
    })
  })

  it('should allow me to add a note to an application', function test() {
    const application = {
      ...this.application,
      status: 'awaitingAssesment',
    }

    const timeline = cas1TimelineEventFactory.buildList(10)
    const note = noteFactory.build()
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline })
    cy.task('stubApplicationNote', { applicationId: application.id, note })

    // Given I am on the timeline page of the application view
    const showPage = ShowPage.visit(application, 'timeline')

    WHEN('I enter a note`into the text box')
    showPage.enterNote(note)
    showPage.clickAddNote()

    const noteAsTimelineEvent = cas1TimelineEventFactory.build({
      content: note.note,
      createdBySummary: note.createdByUser,
      id: 'some-id',
      occurredAt: note.createdAt,
      type: 'application_timeline_note',
    })

    const updatedTimeline = [...timeline, noteAsTimelineEvent]
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline: updatedTimeline })

    THEN('I should see a confirmation page')
    const confirmationPage = Page.verifyOnPage(NotesConfirmationPage, application)

    confirmationPage.shouldShowNote(note)

    WHEN(`I click 'Confirm'`)
    confirmationPage.clickConfirm()

    THEN('I should see a flash confirming the note has been added')
    showPage.showsNoteAddedConfirmationMessage()

    AND('I should see the note in the timeline')
    showPage.shouldShowApplicationTimeline(updatedTimeline)

    AND('the API should have been called with the new note')
    cy.task('verifyApplicationNoteAdded', { id: application.id }).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(paths.applications.addNote({ id: application.id }))

      const body = JSON.parse(requests[0].body)
      expect(body).to.have.keys('note')
    })
  })
})
