import { faker } from '@faker-js/faker/locale/en_GB'

import { ListPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './setup'

context('show applications', () => {
  beforeEach(setup)

  it('shows a read-only version of the application', function test() {
    // Given I have completed an application
    const updatedApplication = { ...this.application, status: 'submitted' }
    cy.task('stubApplicationGet', { application: updatedApplication })
    cy.task('stubApplications', [updatedApplication])

    // And I visit the list page
    const listPage = ListPage.visit([], [updatedApplication], [])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowInProgressApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, updatedApplication)

    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()
  })

  it('links to an assessment when an application has been assessed', function test() {
    // Given I have completed an application
    const application = {
      ...this.application,
      status: 'submitted',
      assessmentDecision: 'accepted',
      assessmentDecisionDate: '2023-01-01',
      assessmentId: faker.string.uuid(),
    }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    // And I visit the list page
    const listPage = ListPage.visit([], [], [application])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowSubmittedApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And I should see details of the assessment
    showPage.shouldShowAssessmentDetails()
  })
})
