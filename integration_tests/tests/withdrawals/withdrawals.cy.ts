import { ApprovedPremisesUserPermission } from '@approved-premises/api'
import {
  applicationFactory,
  cas1ApplicationSummaryFactory,
  placementApplicationFactory,
  placementRequestFactory,
  withdrawableFactory,
  cas1SpaceBookingFactory,
} from '../../../server/testutils/factories'

import { ListPage } from '../../pages/apply'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'
import WithdrawApplicationPage from '../../pages/apply/withdrawApplicationPage'
import { CancellationCreatePage } from '../../pages/manage'
import PrListPage from '../../pages/admin/placementApplications/listPage'
import PlacementApplicationWithdrawalConfirmationPage from '../../pages/match/placementApplicationWithdrawalConfirmationPage'
import DashboardPage from '../../pages/apply/dashboard'
import Page from '../../pages/page'
import { signIn } from '../signIn'
import paths from '../../../server/paths/apply'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'
import { roleToPermissions } from '../../../server/utils/users/roles'

context('Withdrawals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCruManagementAreaReferenceData')
  })

  describe('as a CRU user', () => {
    beforeEach(() => {
      cy.log('Given I am signed in as a CRU member')
      signIn('cru_member')
    })

    it('withdraws a placement request, showing all options for withdrawal reason', () =>
      withdrawsAPlacementRequest(roleToPermissions('cru_member')))

    it('withdraws a placement application', () => {
      const application = applicationFactory.build({ status: 'awaitingAssesment' })
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

      cy.log('When I visit the Withdraw page')
      cy.visit(paths.applications.withdraw.new({ id: application.id }))
      cy.log('Then I am asked what I want to withdraw')
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      cy.log('And I am shown the correct withdrawables')
      newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'application'])
      newWithdrawalPage.shouldNotShowWithdrawableTypes(['placement'])

      cy.log('When I select "placementRequest"')
      newWithdrawalPage.selectType('placementRequest')
      newWithdrawalPage.clickSubmit()

      cy.log('Then I am shown a list of placement applications that can be withdrawn')
      const selectWithdrawablePage = new NewWithdrawalPage('Select your request')
      selectWithdrawablePage.shouldShowWithdrawableGuidance('request')
      selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
      selectWithdrawablePage.shouldShowWithdrawables([placementApplicationWithdrawable])
      selectWithdrawablePage.shouldNotShowWithdrawables([applicationWithdrawable])

      cy.log('When I select a placement application')
      selectWithdrawablePage.selectWithdrawable(placementApplication.id)
      selectWithdrawablePage.clickSubmit()

      cy.log('Then I am taken to the confirmation page')
      Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)
    })

    it('withdraws an application', () => {
      const application = cas1ApplicationSummaryFactory.build({
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

      cy.log('Given I am on the list page')
      const listPage = ListPage.visit([application], [], [])

      cy.log('When I click "Withdraw" on an application')
      listPage.clickWithdraw()

      cy.log('Then I am asked what I want to withdraw')
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      cy.log('When I select "application"')
      newWithdrawalPage.selectType('application')
      newWithdrawalPage.clickSubmit()

      cy.log('Then I am taken to the confirmation page')
      Page.verifyOnPage(WithdrawApplicationPage)
    })

    it('withdraws a placement', () => {
      const application = cas1ApplicationSummaryFactory.build()
      const placement = cas1SpaceBookingFactory.build({ applicationId: application.id })
      const placementWithdrawable = withdrawableFactory.build({
        type: 'space_booking',
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
      cy.task('stubSpaceBookingGetWithoutPremises', placement)
      cy.task('stubSpaceBookingShow', placement)
      cy.task('stubCancellationReferenceData')

      cy.log('When I visit the Withdraw page')
      cy.visit(paths.applications.withdraw.new({ id: application.id }))

      cy.log('Then I am asked what I want to withdraw')
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

      cy.log('And I should see the correct withdrawable types')
      newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement', 'application'])

      cy.log('When I select "placement"')
      newWithdrawalPage.selectType('placement')
      newWithdrawalPage.clickSubmit()

      cy.log('Then I am shown a list of placements that can be withdrawn')
      const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
      selectWithdrawablePage.shouldShowWithdrawableGuidance('placement')
      selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
      selectWithdrawablePage.shouldShowWithdrawables([placementWithdrawable])
      selectWithdrawablePage.shouldNotShowWithdrawables([placementApplicationWithdrawable, applicationWithdrawable])
      selectWithdrawablePage.veryifyLink(placement.id, 'space_booking')

      cy.log('When I select a placement')
      selectWithdrawablePage.selectWithdrawable(placement.id)
      selectWithdrawablePage.clickSubmit()

      cy.log('Then I am taken to the confirmation page')
      Page.verifyOnPage(CancellationCreatePage)
    })
  })

  describe('as a non-CRU user', () => {
    beforeEach(() => {
      cy.log('Given I am signed in as an applicant')
      signIn('applicant')
    })

    it('withdraws a placement request, showing all options for withdrawal reason excluding those relating to lack of capacity', () =>
      withdrawsAPlacementRequest(roleToPermissions('applicant')))

    it('shows a warning message if there are no withdrawables', () => {
      const application = cas1ApplicationSummaryFactory.build({
        status: 'started',
        hasRequestsForPlacement: false,
      })

      const withdrawables = withdrawablesFactory.build({
        withdrawables: [],
      })

      cy.task('stubWithdrawablesWithNotes', {
        applicationId: application.id,
        withdrawables,
      })
      cy.task('stubApplications', [application])
      cy.task('stubApplicationGet', { application })

      cy.log('Given I am on the list page')
      const listPage = ListPage.visit([application], [], [])

      cy.log('When I click "Withdraw" on an application')
      listPage.clickWithdraw()

      cy.log('Then I am asked what I want to withdraw')
      const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')
      newWithdrawalPage.checkForBackButton(paths.applications.index({}))

      newWithdrawalPage.shouldShowNoWithdrawablesGuidance()
    })
  })
})

const withdrawsAPlacementRequest = (permissions: Array<ApprovedPremisesUserPermission>) => {
  const application = cas1ApplicationSummaryFactory.build()
  const placementRequest = placementRequestFactory.build({ applicationId: application.id })
  const placementRequestWithdrawable = withdrawableFactory.build({
    type: 'placement_request',
    id: placementRequest.id,
  })
  const placementApplicationWithdrawable = withdrawableFactory.build({
    type: 'placement_application',
  })
  const placementWithdrawable = withdrawableFactory.build({
    type: 'space_booking',
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

  cy.log('When I visit the Withdraw page')
  cy.visit(paths.applications.withdraw.new({ id: application.id }))

  cy.log('Then I am asked what I want to withdraw')
  const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

  cy.log('And I am shown the correct withdrawables')
  newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement'])
  newWithdrawalPage.shouldNotShowWithdrawableTypes(['application'])

  cy.log('When I select "placementRequest"')
  newWithdrawalPage.selectType('placementRequest')
  newWithdrawalPage.clickSubmit()

  cy.log('Then I am shown a list of placement requests that can be withdrawn')
  const selectWithdrawablePage = new NewWithdrawalPage('Select your request')
  selectWithdrawablePage.shouldShowWithdrawableGuidance('request')
  selectWithdrawablePage.checkForBackButton(paths.applications.withdraw.new({ id: application.id }))
  selectWithdrawablePage.veryifyLink(placementRequest.id, 'placement_request')
  selectWithdrawablePage.shouldShowWithdrawables([placementRequestWithdrawable, placementApplicationWithdrawable])
  selectWithdrawablePage.shouldNotShowWithdrawables([placementWithdrawable])

  cy.log('When I select a placement request')
  selectWithdrawablePage.selectWithdrawable(placementRequest.id)
  selectWithdrawablePage.clickSubmit()

  cy.log('Then I should see the withdrawal confirmation page')
  const confirmationPage = Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)

  // With the appropriate withdrawal reasons for my role(s)
  if (permissions.includes('cas1_view_cru_dashboard')) {
    confirmationPage.shouldShowAllReasons()
  } else {
    confirmationPage.shouldShowReasonsUnrelatedToCapacity()
  }

  cy.log('And be able to state a reason')
  const withdrawalReason = 'DuplicatePlacementRequest'
  confirmationPage.selectReason(withdrawalReason)
  confirmationPage.clickConfirm()

  cy.log('Then I am taken to the dashboard')
  let successPage: Page
  if (permissions.includes('cas1_view_cru_dashboard')) {
    successPage = Page.verifyOnPage(PrListPage)
  } else {
    successPage = Page.verifyOnPage(DashboardPage)
  }

  cy.log('And I see a confirmation')
  successPage.shouldShowBanner('withdrawn successfully', { exact: false })
}
