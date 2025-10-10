import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import { ListPage, NotesConfirmationPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './viewSetup'
import {
  cas1TimelineEventFactory,
  noteFactory,
  placementApplicationFactory,
  requestForPlacementFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'
import { defaultUserId } from '../../mockApis/auth'
import paths from '../../../server/paths/api'
import { withdrawPlacementRequestOrApplication } from '../../support/helpers'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('show applications', () => {
  it('shows an application awaiting assessment', function test() {
    GIVEN('I have completed an application')
    const { application, timeline, applicationSummary } = setup({ application: { status: 'awaitingAssesment' } })

    WHEN('I visit the list page')
    const listPage = ListPage.visit([], [applicationSummary], [])

    WHEN('I click on`the Submitted tab')
    listPage.clickSubmittedTab()

    THEN('I should see my application')
    listPage.shouldShowInProgressApplications()

    WHEN('I click on my application')
    listPage.clickApplication(application)

    THEN('I should see a read-only version of the application')
    const showPage = Page.verifyOnPage(ShowPage, application)

    AND('I should see the application details')
    showPage.shouldNotShowOfflineStatus()
    showPage.shouldShowPersonInformation()
    showPage.shouldShowApplication()

    showPage.clickOpenActionsMenu()
    showPage.shouldHaveWithdrawalLink()

    WHEN(`I click on the 'Timeline' tab`)
    showPage.clickTimelineTab()

    THEN('I should see timeline page')
    showPage.shouldShowApplicationTimeline(timeline)
  })

  it('shows an application assessed as suitable', function test() {
    GIVEN('I have an application assessed as suitable')
    const { application, assessment } = setup({ application: { status: 'awaitingPlacement' } })

    AND('I visit the list page')
    const listPage = ListPage.visit([], [], [{ ...application, hasRequestsForPlacement: false, isWithdrawn: false }])

    WHEN('I click on the Submitted tab')
    listPage.clickSubmittedTab()

    THEN('I should see my application')
    listPage.shouldShowSubmittedApplications()

    WHEN('I click on my application')
    listPage.clickApplication(application)

    THEN('I should see the application view page')
    const showPage = Page.verifyOnPage(ShowPage, application)

    AND('I should see details of the application')
    showPage.shouldShowApplication()

    AND('I should see details of the assessment')
    showPage.shouldShowAssessmentDetails(assessment)
    showPage.shouldShowAssessedDate()

    AND(`I should see the 'Create placement request' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('shows an application assessed as not suitable', function test() {
    GIVEN('I have an application assessed as not suitable')
    const { application, assessment } = setup({ application: { status: 'rejected' } })

    WHEN('I visit the application view page')
    const showPage = ShowPage.visit(application, 'application')

    AND('I should see details of the application')
    showPage.shouldShowApplication()

    AND('I should see details of the assessment')
    showPage.shouldShowAssessmentDetails(assessment)
    showPage.shouldShowAssessedDate()

    AND(`I should see the 'Create placement request' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('shows a withdrawn application', function test() {
    GIVEN('I have a withdrawn application')
    const { application } = setup({ application: { status: 'withdrawn' } })

    WHEN('I visit the application view page')
    const showPage = ShowPage.visit(application, 'application')

    THEN(`I should see a 'Withdrawn application' status tag`)
    showPage.shouldShowStatusTag('withdrawn')

    AND('I should not see the assessment details')
    showPage.shouldNotShowAssessmentDetails()

    AND('I should see the application details')
    showPage.shouldShowApplication()

    AND(`I should not see the 'Create placement request' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('shows an expired application', function test() {
    GIVEN('I have an expired application')
    const { application } = setup({ application: { status: 'expired' } })

    WHEN('I navigate to the application view page')
    const showPage = ShowPage.visit(application, 'application')

    AND(`I should see an 'Expired application' status tag`)
    showPage.shouldShowStatusTag('expired')

    AND('I should see the assessment details')
    showPage.shouldNotShowAssessmentDetails()

    AND('I should see the application details')
    showPage.shouldShowApplication()

    AND(`I should not see the 'Create placement request' button`)
    showPage.shouldNotShowCreatePlacementButton()
  })

  it('shows an offline application', function test() {
    const { application } = setup({ application: { type: 'Offline', status: undefined, document: undefined } })
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
    const { application } = setup({
      application: { status: 'awaitingAssesment', createdByUserId: defaultUserId },
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
    ShowPage.visit(application)
    const showPage = Page.verifyOnPage(ShowPage, application)

    WHEN(`I click the 'Placement request' tab`)
    showPage.clickLink('Placement request')

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
    const { application } = setup({ application: { status: 'awaitingAssesment' } })

    const timeline = cas1TimelineEventFactory.buildList(10)
    const note = noteFactory.build()
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline })
    cy.task('stubApplicationNote', { applicationId: application.id, note })

    GIVEN('I am on the timeline page of the application view')
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
