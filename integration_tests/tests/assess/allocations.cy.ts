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

    // Given there are some users in the database
    const users = userFactory.buildList(3)
    const selectedUser = users[0]
    cy.task('stubUsers', { users, roles: ['assessor'], qualifications: ['pipe'] })

    // And there is an allocated assessment
    const application = applicationFactory.build({ isWomensApplication: false, isPipeApplication: true })
    const assessment = assessmentFactory.build({ allocatedToStaffMember: userFactory.build(), application })

    cy.task('stubAssessments', [assessment])
    cy.task('stubAssessment', assessment)
    cy.task('stubApplicationAssessment', { application: assessment.application, assessment })

    // And I am logged in as a workflow manager
    const me = userFactory.build()
    cy.task('stubAuthUser', { roles: ['workflow_manager'], userId: me.id })
    cy.signIn()

    cy.wrap(assessment).as('assessment')
    cy.wrap(application).as('application')
    cy.wrap(users).as('users')
    cy.wrap(selectedUser).as('selectedUser')
  })

  it('allows me to reallocate an assessment', function test() {
    cy.task('stubAllocationCreate', {
      application: this.assessment.application,
      assessment: { ...this.assessment, allocatedToStaffMember: this.selectedUser },
    })

    // When I visit the allocations section
    const allocationsListPage = AllocationsListPage.visit([this.assessment], [])

    // And I click to reallocate the assessment
    allocationsListPage.clickAssessment(this.assessment)

    // Then I should be on the Allocations page for that assessment
    const allocationsPage = Page.verifyOnPage(AllocationsPage, this.assessment)

    // And I should see some information about that assessment
    allocationsPage.shouldShowInformationAboutAssessment()

    // And I should see a list of staff members who can be allocated to that assessment
    allocationsPage.shouldShowUsers(this.users)

    // When I select a new user to allocate the application to
    allocationsPage.selectUser(this.selectedUser)
    allocationsPage.clickSubmit()

    // Then I should be redirected to the index page
    Page.verifyOnPage(AllocationsListPage, [], [])

    // And I should see a confirmation message
    allocationsListPage.shouldShowBanner(`Case has been allocated to ${this.selectedUser.name}`)

    // And the API should have received the correct data
    cy.task('verifyAllocationCreate', this.application).then(requests => {
      // Then the API should have had a clarification note added
      expect(requests).to.have.length(1)
      const body = JSON.parse(requests[0].body)

      expect(body.userId).equal(this.selectedUser.id)
    })
  })

  it('shows an error when I do not select a user', function test() {
    cy.task('stubAllocationErrors', this.application)

    // Given I am on the allocations page
    const allocationsPage = AllocationsPage.visit(this.assessment)

    // And I click submit without selecting a user
    allocationsPage.clickSubmit()

    // Then I should see an error
    allocationsPage.shouldShowErrorMessagesForFields(['userId'])
  })
})
