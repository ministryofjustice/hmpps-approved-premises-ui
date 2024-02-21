import {
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

context('Withdrawals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Given I am logged in
    signIn(['workflow_manager'])
  })

  it('withdraws a placement request', () => {
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
    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementRequestWithdrawable, placementApplicationWithdrawable, placementWithdrawable],
    })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationGet', { application })
    cy.task('stubPlacementRequest', placementRequest)
    cy.task('stubPlacementRequestWithdrawal', placementRequest)
    cy.task('stubApAreaReferenceData')
    cy.task('stubPlacementRequestsDashboard', { placementRequests: [placementRequest], status: 'notMatched' })

    // Given I am on the list page
    const listPage = ListPage.visit([application], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    // Then I am asked what I want to withdraw
    const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

    // And I am shown the correct withdrawables
    newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement'])
    newWithdrawalPage.shouldNotShowWithdrawableTypes(['application'])

    // When I select 'placementRequest'
    newWithdrawalPage.selectType('placementRequest')
    newWithdrawalPage.clickSubmit()

    // Then I am shown a list of placement requests that can be withdrawn
    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
    selectWithdrawablePage.veryifyLink(placementRequest.id, 'placement_request')
    selectWithdrawablePage.shouldShowWithdrawables([placementRequestWithdrawable, placementApplicationWithdrawable])
    selectWithdrawablePage.shouldNotShowWithdrawables([placementWithdrawable])

    // When I select a placement request
    selectWithdrawablePage.selectWithdrawable(placementRequest.id)
    selectWithdrawablePage.clickSubmit()

    // Then I should see the withdrawal confirmation page
    const confirmationPage = Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)

    // And be able to state a reason
    const withdrawalReason = 'DuplicatePlacementRequest'
    confirmationPage.selectReason(withdrawalReason)
    confirmationPage.clickConfirm()

    // Then I am taken to the confirmation page
    Page.verifyOnPage(PrListPage)
  })

  it('withdraws a placement application', () => {
    const application = applicationSummaryFactory.build()
    const placementApplication = placementApplicationFactory.build({ applicationId: application.id })
    const placementApplicationWithdrawable = withdrawableFactory.build({
      type: 'placement_application',
      id: placementApplication.id,
    })
    const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })

    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementApplicationWithdrawable, applicationWithdrawable],
    })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationGet', { application })
    cy.task('stubPlacementApplication', placementApplication)

    // Given I am on the list page
    const listPage = ListPage.visit([application], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    // Then I am asked what I want to withdraw
    const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

    // And I am shown the correct withdrawables
    newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'application'])
    newWithdrawalPage.shouldNotShowWithdrawableTypes(['placement'])

    // When I select 'placementRequest'
    newWithdrawalPage.selectType('placementRequest')
    newWithdrawalPage.clickSubmit()

    // Then I am shown a list of placement applications that can be withdrawn
    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
    selectWithdrawablePage.shouldShowWithdrawables([placementApplicationWithdrawable])
    selectWithdrawablePage.shouldNotShowWithdrawables([applicationWithdrawable])

    // When I select a placement application
    selectWithdrawablePage.selectWithdrawable(placementApplication.id)
    selectWithdrawablePage.clickSubmit()

    // Then I am taken to the confirmation page
    Page.verifyOnPage(PlacementApplicationWithdrawalConfirmationPage)
  })

  it('withdraws an application', () => {
    const application = applicationSummaryFactory.build()

    const applicationWithdrawable = withdrawableFactory.build({
      type: 'application',
    })

    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [applicationWithdrawable],
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

    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementWithdrawable, placementApplicationWithdrawable, applicationWithdrawable],
    })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationGet', { application })
    cy.task('stubBookingFindWithoutPremises', placement)
    cy.task('stubBookingGet', { premisesId: placement.premises.id, booking: placement })
    cy.task('stubCancellationReferenceData')

    // And I visit the list page
    const listPage = ListPage.visit([application], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    // Then I am asked what I want to withdraw
    const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')

    // And I should see the correct withdrawable types
    newWithdrawalPage.shouldShowWithdrawableTypes(['placementRequest', 'placement', 'application'])

    // When I select 'placement'
    newWithdrawalPage.selectType('placement')
    newWithdrawalPage.clickSubmit()

    // Then I am shown a list of placements that can be withdrawn
    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
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
