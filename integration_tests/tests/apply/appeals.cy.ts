import AppealsNewPage from '../../pages/apply/appeals/new'
import { appealFactory, applicationFactory, newAppealFactory, personFactory } from '../../../server/testutils/factories'
import { ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import AppealsShowPage from '../../pages/apply/appeals/show'
import applicationDocument from '../../fixtures/applicationDocument.json'
import { signIn } from '../signIn'

context('Appeals', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as an appeals manager
    signIn('appeals_manager')
  })

  it('should create an appeal', () => {
    // Given there is an application
    const person = personFactory.build()
    const application = applicationFactory.build({
      person,
      status: 'rejected',
      document: applicationDocument,
    })
    const appeal = appealFactory.build()

    cy.task('stubApplicationGet', { application })
    cy.task('stubAppealCreate', { applicationId: application.id, appeal })

    // And I visit the application page
    let showPage = ShowPage.visit(application)

    // And I lodge an appeal
    showPage.clickOpenActionsMenu()
    showPage.clickAppealLink()

    // Then I should be on the appeals page
    const appealsPage = Page.verifyOnPage(AppealsNewPage, application)

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
    })
  })

  it('should show error messages for missed fields', () => {
    // Given there is an application
    const person = personFactory.build()
    const application = applicationFactory.build({ person, status: 'submitted' })

    cy.task('stubApplicationGet', { application })
    cy.task('stubAppealErrors', {
      applicationId: application.id,
      params: ['appealDate', 'appealDetail', 'decision', 'decisionDetail'],
    })

    // And I visit the appeals page
    const appealsPage = AppealsNewPage.visit(application)

    // And I click submit
    appealsPage.clickSubmit()

    // Then I should see the error messages
    appealsPage.shouldShowErrorMessagesForFields(['appealDate', 'appealDetail', 'decision', 'decisionDetail'])
  })

  it('should show an appeal', function test() {
    // Given I have completed an application
    const person = personFactory.build()
    const application = applicationFactory.build({ person, status: 'rejected' })
    const appeal = appealFactory.build()

    cy.task('stubApplicationGet', { application })
    cy.task('stubAppeals', { applicationId: application.id, appeal })

    // And I visit the Appeal page
    const appealPage = AppealsShowPage.visit(application, appeal)

    // Then I see the Appeal page
    appealPage.shouldShowAppealDetails(appeal)
  })
})
