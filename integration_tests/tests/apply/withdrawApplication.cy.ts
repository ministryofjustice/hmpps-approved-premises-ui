import { ListPage } from '../../pages/apply'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'

import Page from '../../pages/page'
import WithdrawApplicationPage from '../../pages/apply/withdrawApplicationPage'
import { setup } from './setup'
import { applicationSummaryFactory, withdrawableFactory } from '../../../server/testutils/factories'
import { WithdrawalReason } from '../../../server/@types/shared'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('Withdraw Application', () => {
  beforeEach(setup)

  it('allows me to withdraw an in progress application', function test() {
    // Given I have completed an application
    const inProgressApplication = applicationSummaryFactory.build({
      id: this.application.id,
      status: 'started',
      createdByUserId: '123',
      submittedAt: undefined,
      hasRequestsForPlacement: false,
    })
    const withdrawable = withdrawableFactory.build({ type: 'application' })
    cy.task('stubApplicationGet', { application: this.application })
    cy.task('stubApplications', [inProgressApplication])
    cy.task('stubApplicationWithdrawn', { applicationId: inProgressApplication.id })
    const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

    cy.task('stubWithdrawablesWithNotes', { applicationId: inProgressApplication.id, withdrawables })

    const withdrawalReason: WithdrawalReason = 'other'
    const reasonDescription = 'Some reason'

    // And I visit the list page
    const listPage = ListPage.visit([inProgressApplication], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    // Then I should see the withdrawal type page
    const withdrawalTypePage = Page.verifyOnPage(NewWithdrawalPage, 'What do you want to withdraw?')

    // When I select the withdrawal type and click submit
    withdrawalTypePage.selectType('application')
    withdrawalTypePage.clickSubmit()

    // Then I should see the withdraw confirmation page
    const withdrawConfirmationPage = Page.verifyOnPage(WithdrawApplicationPage)

    // When I choose a reason and click submit
    withdrawConfirmationPage.completeForm(withdrawalReason, reasonDescription)
    withdrawConfirmationPage.clickSubmit()

    // Then I should see the list page and be shown confirmation of the withdrawal
    listPage.showsWithdrawalConfirmationMessage()

    // And the API should have marked the application as withdrawn
    cy.task('verifyApplicationWithdrawn', { applicationId: inProgressApplication.id }).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body.reason).equal(withdrawalReason)
      expect(body.otherReason).equal(reasonDescription)
    })
  })
})
