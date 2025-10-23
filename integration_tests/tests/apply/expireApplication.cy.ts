import { ListPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './viewSetup'
import { GIVEN, AND, WHEN, THEN } from '../../helpers'
import ExpireApplicationPage from '../../pages/apply/expireApplicationPage'

context('Expire Application', () => {
  it('allows me to expire an application', function test() {
    GIVEN('I have completed an application')
    const { application } = setup({ application: { status: 'placementAllocated' } })
    cy.task('stubApplicationExpiry', { applicationId: application.id })

    AND('I visit the submitted tab of the list page')
    const listPage = ListPage.visit([], [], [])
    listPage.clickSubmittedTab()

    WHEN('I visit the details page of an application')
    listPage.clickApplication(application)

    THEN('I am on the application view page')
    const showPage = Page.verifyOnPage(ShowPage, application)

    WHEN('I click on expire application')
    showPage.clickAction('Expire application')

    THEN('I am on the application expiry page')
    const expirePage = Page.verifyOnPage(ExpireApplicationPage, application)

    AND('I can see the details of the application')
    expirePage.verifySummary()

    WHEN('I click "Mark as expired"')
    expirePage.clickButton('Mark as expired')

    THEN('I should see a validation error')
    expirePage.shouldShowErrorMessagesForFields(['reason'], {
      reason: 'Give the reason for expiring this application',
    })

    WHEN('I add a reason and submit')
    expirePage.completeForm()
    expirePage.clickButton('Mark as expired')

    THEN('I should be back on the application view page')
    showPage.checkOnPage()
    showPage.shouldShowBanner('Application marked as expired')

    AND('The expiry endpoint should have been called')
    expirePage.verifyApiCalled()
  })
})
