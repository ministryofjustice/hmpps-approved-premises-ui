import { ApprovedPremisesUserRole } from '@approved-premises/api'
import {
  applicationFactory,
  applicationSummaryFactory,
  bookingFactory,
  placementApplicationFactory,
  placementRequestFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'

import { ListPage } from '../../pages/apply'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'
import WithdrawApplicationPage from '../../pages/apply/withdrawApplicationPage'
import { CancellationCreatePage } from '../../pages/manage'
import PrListPage from '../../pages/admin/placementApplications/listPage'
import PlacementApplicationWithdrawalConfirmationPage from '../../pages/match/placementApplicationWithdrawalConfirmationPage'
import Page from '../../pages/page'
import { signIn } from '../signIn'
import paths from '../../../server/paths/apply'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('Withdrawals', () => {
  describe('as a CRU user', () => {
    const userRoles: Array<ApprovedPremisesUserRole> = ['workflow_manager']

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      // Given I am logged in
      signIn(userRoles)
    })

    it('withdraws a placement request, showing all options for withdrawal reason', () =>
      withdrawsAPlacementRequest(userRoles))

    it('withdraws a placement application', () => {
      const application = applicationFactory.build({ status: 'submitted' })
      const placementApplication = placementApplicationFactory.build({ applicationId: application.id })
      const placementApplicationWithdrawable = withdrawableFactory.build({
        type: 'placement_application',
        id: placementApplication.id,
      })
      const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
      const withdrawables = withdrawablesFactory.build({
        withdrawables: [placementApplicationWithdrawable, applicationWithdrawable],
      })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: application.id,
        withdrawables,
      })
      cy.task('stubPlacementApplication', placementApplication)

      // When I visit the Withdraw page
      cy.visit(paths.applications.withdraw.new({ id: application.id }))
      // Then I am asked what I want to withdraw
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      // And I am shown the correct withdrawables
      newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'application'])
      newWithdrawalPage.shouldNotShowWithdrawableTypes(['placement'])

      // When I select 'placementRequest'
      newWithdrawalPage.selectType('placementRequest')
      newWithdrawalPage.clickSubmit()

      // Then I am shown a list of placement applications that can be withdrawn
      const selectWithdrawablePage = new NewWithdrawalPage('Select your request')
      selectWithdrawablePage.shouldShowWithdrawableGuidance('request')
      selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
      selectWithdrawablePage.shouldShowWithdrawables([placementApplicationWithdrawable])
      selectWithdrawablePage.shouldNotShowWithdrawables([applicationWithdrawable])

      // When I select a placement application
      selectWithdrawablePage.selectWithdrawable(placementApplication.id)
      selectWithdrawablePage.clickSubmit()

      // Then I am taken to the confirmation page
      Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)
    })

    it('withdraws an application', () => {
      const application = applicationSummaryFactory.build({
        hasRequestsForPlacement: false,
        status: 'started',
      })

      const applicationWithdrawable = withdrawableFactory.build({
        type: 'application',
      })
      const withdrawables = withdrawablesFactory.build({ withdrawables: [applicationWithdrawable] })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: application.id,
        withdrawables,
      })
      cy.task('stubApplications', [application])
      cy.task('stubApplicationGet', { application })

      // Given I am on the list page
      const listPage = ListPage.visit([application], [], [])

      // When I click 'Withdraw' on an application
      listPage.clickWithdraw()

      // Then I am asked what I want to withdraw
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      // When I select 'application'
      newWithdrawalPage.selectType('application')
      newWithdrawalPage.clickSubmit()

      // Then I am taken to the confirmation page
      Page.verifyOnPage(WithdrawApplicationPage)
    })

    it('withdraws a placement', () => {
      const application = applicationSummaryFactory.build()
      const placement = bookingFactory.build({ applicationId: application.id })
      const placementWithdrawable = withdrawableFactory.build({
        type: 'booking',
        id: placement.id,
      })
      const placementApplicationWithdrawable = withdrawableFactory.build({
        type: 'placement_application',
      })
      const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
      const withdrawables = withdrawablesFactory.build({
        withdrawables: [placementWithdrawable, placementApplicationWithdrawable, applicationWithdrawable],
      })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: application.id,
        withdrawables,
      })
      cy.task('stubApplications', [application])
      cy.task('stubApplicationGet', { application })
      cy.task('stubBookingFindWithoutPremises', placement)
      cy.task('stubBookingGet', { premisesId: placement.premises.id, booking: placement })
      cy.task('stubCancellationReferenceData')

      // When I visit the Withdraw page
      cy.visit(paths.applications.withdraw.new({ id: application.id }))

      // Then I am asked what I want to withdraw
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      // And I should see the correct withdrawable types
      newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement', 'application'])

      // When I select 'placement'
      newWithdrawalPage.selectType('placement')
      newWithdrawalPage.clickSubmit()

      // Then I am shown a list of placements that can be withdrawn
      const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
      selectWithdrawablePage.shouldShowWithdrawableGuidance('placement')
      selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
      selectWithdrawablePage.shouldShowWithdrawables([placementWithdrawable])
      selectWithdrawablePage.shouldNotShowWithdrawables([placementApplicationWithdrawable, applicationWithdrawable])
      selectWithdrawablePage.veryifyLink(placement.id, 'booking')

      // When I select a placement
      selectWithdrawablePage.selectWithdrawable(placement.id)
      selectWithdrawablePage.clickSubmit()

      // Then I am taken to the confirmation page
      Page.verifyOnPage(CancellationCreatePage)
    })
  })

  describe('as a non-CRU user', () => {
    const userRoles: Array<ApprovedPremisesUserRole> = ['applicant']
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      // Given I am logged in
      signIn(userRoles)
    })

    it('withdraws a placement request, showing all options for withdrawal reason excluding those relating to lack of capacity', () =>
      withdrawsAPlacementRequest(userRoles))

    it('shows a warning message if there are no withdrawables', () => {
      const application = applicationSummaryFactory.build({
        status: 'started',
        hasRequestsForPlacement: false,
      })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: application.id,
        withdrawables: [],
      })
      cy.task('stubApplications', [application])
      cy.task('stubApplicationGet', { application })

      // Given I am on the list page
      const listPage = ListPage.visit([application], [], [])

      // When I click 'Withdraw' on an application
      listPage.clickWithdraw()

      // Then I am asked what I want to withdraw
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')
      newWithdrawalPage.checkForBackButton(paths.applications.index({}))

      newWithdrawalPage.shouldShowNoWithdrawablesGuidance()
    })
  })
})

const withdrawsAPlacementRequest = (userRoles: Array<ApprovedPremisesUserRole>) => {
  const application = applicationSummaryFactory.build()
  const placementRequest = placementRequestFactory.build({ applicationId: application.id })
  const placementRequestWithdrawable = withdrawableFactory.build({
    type: 'placement_request',
    id: placementRequest.id,
  })
  const placementApplicationWithdrawable = withdrawableFactory.build({
    type: 'placement_application',
  })
  const placementWithdrawable = withdrawableFactory.build({
    type: 'booking',
  })
  const withdrawables = withdrawablesFactory.build({
    withdrawables: [placementRequestWithdrawable, placementApplicationWithdrawable, placementWithdrawable],
  })
  cy.task('stubWithdrawablesWithNotes', {
    applicationId: application.id,
    withdrawables,
  })
  cy.task('stubApplications', [application])
  cy.task('stubApplicationGet', { application })
  cy.task('stubPlacementRequest', placementRequest)
  cy.task('stubPlacementRequestWithdrawal', placementRequest)
  cy.task('stubApAreaReferenceData')
  cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequest], status: 'notMatched' })

  // When I visit the Withdraw page
  cy.visit(paths.applications.withdraw.new({ id: application.id }))

  // Then I am asked what I want to withdraw
  const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

  // And I am shown the correct withdrawables
  newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement'])
  newWithdrawalPage.shouldNotShowWithdrawableTypes(['application'])

  // When I select 'placementRequest'
  newWithdrawalPage.selectType('placementRequest')
  newWithdrawalPage.clickSubmit()

  // Then I am shown a list of placement requests that can be withdrawn
  const selectWithdrawablePage = new NewWithdrawalPage('Select your request')
  selectWithdrawablePage.shouldShowWithdrawableGuidance('request')
  selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
  selectWithdrawablePage.veryifyLink(placementRequest.id, 'placement_request')
  selectWithdrawablePage.shouldShowWithdrawables([placementRequestWithdrawable, placementApplicationWithdrawable])
  selectWithdrawablePage.shouldNotShowWithdrawables([placementWithdrawable])

  // When I select a placement request
  selectWithdrawablePage.selectWithdrawable(placementRequest.id)
  selectWithdrawablePage.clickSubmit()

  // Then I should see the withdrawal confirmation page
  const confirmationPage = Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)

  // With the appropriate withdrawal reasons for my role(s)
  if (userRoles.includes('workflow_manager')) {
    confirmationPage.shouldShowAllReasons()
  } else {
    confirmationPage.shouldShowReasonsUnrelatedToCapacity()
  }

  // And be able to state a reason
  const withdrawalReason = 'DuplicatePlacementRequest'
  confirmationPage.selectReason(withdrawalReason)
  confirmationPage.clickConfirm()

  // Then I am taken to the confirmation page
  Page.verifyOnPage(PrListPage)
}
