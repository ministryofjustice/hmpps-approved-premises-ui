import { ListPage } from '../../pages/apply'

import Page from '../../pages/page'
import WithdrawApplicationPage from '../../pages/apply/withdrawApplicationPage'
import { setup } from './setup'
import { applicationSummaryFactory } from '../../../server/testutils/factories'

context('Withdraw Application', () => {
  beforeEach(setup)

  it('allows me to withdraw an in progress application', function test() {
    // Given I have completed an application
    const inProgressApplication = applicationSummaryFactory.build({
      id: this.application.id,
      status: 'started',
      createdByUserId: '123',
      submittedAt: undefined,
    })
    cy.task('stubApplicationGet', { application: this.application })
    cy.task('stubApplications', [inProgressApplication])
    cy.task('stubApplicationWithdrawn', { applicationId: inProgressApplication.id })
    cy.task('stubWithdrawables', { applicationId: inProgressApplication.id, withdrawables: [] })

    // And I visit the list page
    const listPage = ListPage.visit([inProgressApplication], [], [])

    // When I click 'Withdraw' on an application
    listPage.clickWithdraw()

    // Then I should see the withdraw confirmation page
    const withdrawConfirmationPage = Page.verifyOnPage(WithdrawApplicationPage)

    // When I choose a reason and click submit
    withdrawConfirmationPage.completeForm()
    withdrawConfirmationPage.clickSubmit()

    // Then I should see the list page and be shown confirmation of the withdrawal
    listPage.showsWithdrawalConfirmationMessage()

    // And the API should have marked the application as withdrawn
    cy.task('verifyApplicationWithdrawn', { applicationId: inProgressApplication.id }).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body.reason).equal('alternative_identified_placement_no_longer_required')
    })
  })
})
