import { AllocationsListPage } from '../../../cypress_shared/pages/assess'
import AllocationsPage from '../../../cypress_shared/pages/assess/allocationsPage'
import Page from '../../../cypress_shared/pages/page'
import applicationFactory from '../../../server/testutils/factories/application'

import assessmentFactory from '../../../server/testutils/factories/assessment'
import userFactory from '../../../server/testutils/factories/user'

context('Assess', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('allows me to reallocate an assessment', () => {
    // And there is an allocated assessment
    const application = applicationFactory.build({ isWomensApplication: false, isPipeApplication: true })
    const assessment = assessmentFactory.build({ allocatedToStaffMember: userFactory.build(), application })

    cy.task('stubAssessments', [assessment])
    cy.task('stubAssessment', assessment)
    cy.task('stubApplicationAssessment', { application: assessment.application, assessment })

    // Given there are some users in the database
    const users = userFactory.buildList(3)
    cy.task('stubUsers', { users, roles: ['assessor'], qualifications: ['pipe'] })

    // And I am logged in as a workflow manager
    const me = userFactory.build()
    cy.task('stubAuthUser', { roles: ['workflow_manager'], userId: me.id })
    cy.signIn()

    // When I visit the allocations section
    const allocationsListPage = AllocationsListPage.visit([assessment], [])

    // And I click to reallocate the assessment
    allocationsListPage.clickAssessment(assessment)

    // Then I should be on the Allocations page for that assessment
    const allocationsPage = Page.verifyOnPage(AllocationsPage, assessment)

    // And I should see some information about that assessment
    allocationsPage.shouldShowInformationAboutAssessment()

    // And I should see a list of staff members who can be allocated to that assessment
    allocationsPage.shouldShowUsers(users)
  })
})
