import { assessmentSummaryFactory } from '../../../server/testutils/factories'
import { ListPage } from '../../pages/assess'
import { awaitingAssessmentStatuses } from '../../../server/utils/assessments/utils'

context('List assessments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list assessments', () => {
    // Given I am logged in
    cy.signIn()

    // And I have some assessments
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)
    const awaitingResponseAssessments = assessmentSummaryFactory.buildList(6)
    const completedAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    })
    cy.task('stubAssessments', {
      assessments: awaitingResponseAssessments,
      statuses: ['awaiting_response'],
      sortBy: 'name',
      sortDirection: 'asc',
    })
    cy.task('stubAssessments', {
      assessments: completedAssessments,
      statuses: ['completed'],
      sortBy: 'name',
      sortDirection: 'asc',
    })

    // And I visit the list page
    const listPage = ListPage.visit()

    // Then I should see the awaiting assessments
    listPage.shouldShowAssessments(awaitingAssessments, 'awaiting_assessment')

    // And I click the requested further information tab
    listPage.clickRequestedFurtherInformation()

    // Then I should see the assessments that are awaiting a response
    listPage.shouldShowAssessments(awaitingResponseAssessments, 'awaiting_response')

    // And I click the completed tab
    listPage.clickCompleted()

    // Then I should see the completed assessments
    listPage.shouldShowAssessments(completedAssessments, 'completed')
  })

  it('supports sorting', () => {
    // Given I am logged in
    cy.signIn()

    // And I have some assessments
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    })
    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'desc',
    })

    // And I visit the list page
    const listPage = ListPage.visit()

    // Then I should see the awaiting assessments
    listPage.shouldShowAssessments(awaitingAssessments, 'awaiting_assessment')

    // When I sort by name in ascending order
    listPage.clickSortBy('name')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('name', 'ascending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyAssessmentsRequests', {
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length.greaterThan(0)
    })

    // When I sort by expected arrival in descending order
    listPage.clickSortBy('name')

    // Then the dashboard should be sorted by name in descending order
    listPage.shouldBeSortedByField('name', 'descending')

    // And the API should have received a request for the correct sort order
    cy.task('verifyAssessmentsRequests', {
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })
})
