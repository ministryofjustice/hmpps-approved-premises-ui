import { StartPage, ListPage } from '../../../cypress_shared/pages/apply'

import applicationFactory from '../../../server/testutils/factories/application'
import risksFactory from '../../../server/testutils/factories/risks'
import Page from '../../../cypress_shared/pages/page'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the dashboard ', () => {
    // Given I am logged in
    cy.signIn()

    // And there are applications in the database
    const applications = applicationFactory.withReleaseDate().buildList(5)
    cy.task('stubApplications', applications)

    // And there are risks for the persons related to these applications
    const risks = risksFactory.buildList(5)
    applications.forEach((application, i) => {
      cy.task('stubPersonRisks', { person: application.person, risks: risks[i] })
    })

    // When I visit the Previous Applications page
    const page = ListPage.visit()

    // Then I should see all of the application summaries listed
    page.shouldShowApplications(applications, risks)

    // And I the button should take me to the application start page
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })
})
