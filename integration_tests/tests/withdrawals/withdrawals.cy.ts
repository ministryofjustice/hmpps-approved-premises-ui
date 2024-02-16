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
    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementRequestWithdrawable],
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
    newWithdrawalPage.selectType('placementRequest')
    newWithdrawalPage.clickSubmit()

    // And I am shown a list of placement requests that can be withdrawn
    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
    selectWithdrawablePage.veryifyLink(placementRequest.id, 'placement_request')

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

    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementApplicationWithdrawable],
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
    newWithdrawalPage.selectType('placementRequest')
    newWithdrawalPage.clickSubmit()

    // And I am shown a list of placement applications that can be withdrawn
    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')

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

    cy.task('stubWithdrawables', {
      applicationId: application.id,
      withdrawables: [placementWithdrawable],
    })
    cy.task('stubApplications', [application])
    cy.task('stubApplicationGet', { application })
    cy.task('stubBookingFindWithoutPremises', booking)
    cy.task('stubBookingGet', { premisesId: booking.premises.id, booking })
    cy.task('stubCancellationReferenceData')

    // And I visit the list page
    const listPage = ListPage.visit([application], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    const newWithdrawalPage = new NewWithdrawalPage('What do you want to withdraw?')
    newWithdrawalPage.selectType('placement')
    newWithdrawalPage.clickSubmit()

    const selectWithdrawablePage = new NewWithdrawalPage('Select your placement')
    selectWithdrawablePage.veryifyLink(booking.id, 'booking')
    selectWithdrawablePage.selectWithdrawable(booking.id)
    selectWithdrawablePage.clickSubmit()

    Page.verifyOnPage(CancellationCreatePage)
  })
})
