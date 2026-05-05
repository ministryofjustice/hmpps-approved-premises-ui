import { AND, GIVEN, THEN, WHEN } from '../../../helpers'
import { signIn } from '../../signIn'
import { cas1SpaceBookingFactory, caseDetailFactory, risksFactory } from '../../../../server/testutils/factories'
import ResidentProfilePage from '../../../pages/manage/placements/residentProfile'
import PreArrivalTasklist from '../../../pages/manage/placements/residence/preArrivalTasklist'

context('Pre-Arrival', () => {
  const placement = cas1SpaceBookingFactory.upcoming().build()
  const caseDetail = caseDetailFactory.build()
  const personRisks = risksFactory.build({ roshRisks: { status: 'retrieved' }, flags: { status: 'retrieved' } })
  const formData = {}
  const formDataId = `${placement.id}-pre-arrival`

  beforeEach(() => {
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubCaseDetail', { person: placement.person, caseDetail })
    cy.task('stubFindPerson', { person: placement.person })
    cy.task('stubRiskProfile', { person: placement.person, personRisks })
    cy.task('stubFormDataGet', { id: formDataId, data: formData })
    cy.task('stubFormDataUpdate', { id: formDataId })
  })
  it('completes the pre-arrival task list', () => {
    GIVEN('I am signed in as an AP staff member')
    signIn(['future_manager', 'experimental'])

    AND('I am on the placement page')
    const page = ResidentProfilePage.visit(placement, caseDetail)

    WHEN('I click on option to complete the pre-arrival tasklist')
    page.clickAction('Pre-arrival tasks')

    const taskList = new PreArrivalTasklist()

    cy.contains('You have completed 0 of 2 sections.')

    WHEN('I complete the contact resident task')
    taskList.shouldCompleteContactResident(formDataId)

    THEN('The task should show completed')
    cy.contains('You have completed 1 of 2 sections.')

    WHEN('I complete the risk information task')
    taskList.shouldCompleteRinkInformation(formDataId)

    THEN('The task is complete')
    cy.contains('You have completed 2 of 2 sections.')

    WHEN('I edit a page and use save-and-exit')
    taskList.shouldUseSaveAndExit(formDataId)

    THEN('The task is no longer complete')
    cy.contains('You have completed 1 of 2 sections.')
  })

  it('cannot access the pre-arrival task list without experimetal permission', () => {
    GIVEN('I am signed in as an AP staff member without experimental permission')
    signIn(['future_manager'])

    AND('I am on the placement page')
    const page = ResidentProfilePage.visit(placement, caseDetail)

    WHEN('There is no option to complete the pre-arrival tasklist')
    page.actionShouldNotExist('Pre-arrival tasks')

    PreArrivalTasklist.visitUnauthorised(placement)
  })
})
