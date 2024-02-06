import { appealFactory, applicationFactory, newAppealFactory, personFactory } from '../../../server/testutils/factories'
import { ShowPage } from '../../pages/apply'
import AppealsPage from '../../pages/apply/appeal'
import Page from '../../pages/page'

context('Appeals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser', { roles: ['appeals_manager'] })

    // Given I am logged in
    cy.signIn()
  })

  it('should create an appeal', () => {
    // Given there is an application
    const person = personFactory.build()
    const application = applicationFactory.build({ person, status: 'rejected' })
    const appeal = appealFactory.build()

    cy.task('stubApplicationGet', { application })
    cy.task('stubAppealCreate', { applicationId: application.id, appeal })

    // And I visit the application page
    let showPage = ShowPage.visit(application)

    // And I lodge an appeal
    showPage.clickActions()
    showPage.clickAppealLink()

    // Then I should be on the appeals page
    const appealsPage = Page.verifyOnPage(AppealsPage, application)

    // When I fill in the form with the appeal details
    const newAppeal = newAppealFactory.build()
    appealsPage.completeForm(newAppeal)

    // And I should see a confirmation message
    showPage = Page.verifyOnPage(ShowPage, application)
    showPage.shouldShowBanner('Assessment reopened')

    // And the appeal should have been created
    cy.task('verifyAppealCreated', { applicationId: application.id }).then(requests => {
      expect(requests).to.have.length(1)

      const body = JSON.parse(requests[0].body)

      expect(body.appealDate).equal(newAppeal.appealDate)
      expect(body.appealDetail).equal(newAppeal.appealDetail)
      expect(body.decision).equal(newAppeal.decision)
      expect(body.decisionDetail).equal(newAppeal.decisionDetail)
      expect(body.reviewer).equal(newAppeal.reviewer)
    })
  })

  it('should show error messages for missed fields', () => {
    // Given there is an application
    const person = personFactory.build()
    const application = applicationFactory.build({ person, status: 'submitted' })

    cy.task('stubApplicationGet', { application })
    cy.task('stubAppealErrors', {
      applicationId: application.id,
      params: ['appealDate', 'appealDetail', 'decision', 'decisionDetail', 'reviewer'],
    })

    // And I visit the appeals page
    const appealsPage = AppealsPage.visit(application)

    // And I click submit
    appealsPage.clickSubmit()

    // Then I should see the error messages
    appealsPage.shouldShowErrorMessagesForFields([
      'appealDate',
      'appealDetail',
      'decision',
      'decisionDetail',
      'reviewer',
    ])
  })
})
