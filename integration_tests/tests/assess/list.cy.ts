import { assessmentSummaryFactory, placementApplicationTaskFactory } from '../../../server/testutils/factories'
import { ListPage } from '../../pages/assess'
import { awaitingAssessmentStatuses } from '../../../server/utils/assessments/utils'
import { defaultUserId } from '../../mockApis/auth'
import { signIn } from '../signIn'

context('List assessments', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as an assessor
    signIn('assessor', { id: defaultUserId })
  })

  it('should list assessments', () => {
    // And I have some assessments
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)
    const awaitingResponseAssessments = assessmentSummaryFactory.buildList(6)
    const completedAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
    })
    cy.task('stubAssessments', {
      assessments: awaitingResponseAssessments,
      statuses: ['awaiting_response'],
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
    })
    cy.task('stubAssessments', {
      assessments: completedAssessments,
      statuses: ['completed'],
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
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

  it('should list placement applications', () => {
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
    })
    // And some placement applications exist
    const page1PlacementApplications = placementApplicationTaskFactory.buildList(10)
    const page2PlacementApplications = placementApplicationTaskFactory.buildList(10)
    const page3PlacementApplications = placementApplicationTaskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      types: ['PlacementApplication'],
      tasks: page1PlacementApplications,
      page: '1',
      allocatedToUserId: defaultUserId,
      sortDirection: null,
      sortBy: null,
    })
    cy.task('stubGetAllTasks', {
      types: ['PlacementApplication'],
      tasks: page2PlacementApplications,
      page: '2',
      allocatedToUserId: defaultUserId,
      sortDirection: null,
      sortBy: null,
    })
    cy.task('stubGetAllTasks', {
      types: ['PlacementApplication'],
      tasks: page3PlacementApplications,
      page: '3',
      allocatedToUserId: defaultUserId,
      sortDirection: null,
      sortBy: null,
    })

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()
    listPage.clickRequestsForPlacement()

    // Then I should see the first page of results
    listPage.shouldShowPlacementApplicationTasks(page1PlacementApplications)

    // When I click page 2
    listPage.clickPageNumber('2')

    // Then I should see the second page of results
    listPage.shouldShowPlacementApplicationTasks(page2PlacementApplications)

    // When I click the next page
    listPage.clickNext()

    // Then I should see the third page of results
    listPage.shouldShowPlacementApplicationTasks(page3PlacementApplications)

    // When I sort by name in ascending order
    listPage.clickSortBy('person')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('person', 'ascending')

    // When I sort by name in descending order
    listPage.clickSortBy('person')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('person', 'descending')

    // When I sort by name in ascending order
    listPage.clickSortBy('expectedArrivalDate')

    // Then the dashboard should be sorted by expected arrival
    listPage.shouldBeSortedByField('expectedArrivalDate', 'ascending')
  })

  it('supports sorting', () => {
    // And I have some assessments
    const awaitingAssessments = assessmentSummaryFactory.buildList(6)

    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
    })
    cy.task('stubAssessments', {
      assessments: awaitingAssessments,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'desc',
      page: '1',
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
      page: '1',
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
      page: '1',
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'desc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })
  })

  it('supports pagination', () => {
    const awaitingAssessmentsPage1 = assessmentSummaryFactory.buildList(10)
    const awaitingAssessmentsPage2 = assessmentSummaryFactory.buildList(10)
    const awaitingAssessmentsPage9 = assessmentSummaryFactory.buildList(10)

    cy.task('stubAssessments', {
      assessments: awaitingAssessmentsPage1,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '1',
    })

    cy.task('stubAssessments', {
      assessments: awaitingAssessmentsPage2,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '2',
    })

    cy.task('stubAssessments', {
      assessments: awaitingAssessmentsPage9,
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
      page: '9',
    })

    // And I visit the list page
    const listPage = ListPage.visit()

    // Then I should see the awaiting assessments
    listPage.shouldShowAssessments(awaitingAssessmentsPage1, 'awaiting_assessment')

    // When I click next
    listPage.clickNext()

    // Then the API should have received a request for the next page
    cy.task('verifyAssessmentsRequests', {
      page: '2',
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And I should see the assessments that are allocated
    listPage.shouldShowAssessments(awaitingAssessmentsPage2, 'awaiting_assessment')

    // When I click on a page number
    listPage.clickPageNumber('9')

    // Then the API should have received a request for the that page number
    cy.task('verifyAssessmentsRequests', {
      page: '9',
      statuses: awaitingAssessmentStatuses,
      sortBy: 'name',
      sortDirection: 'asc',
    }).then(requests => {
      expect(requests).to.have.length(1)
    })

    // And I should see the assessments that are allocated
    listPage.shouldShowAssessments(awaitingAssessmentsPage9, 'awaiting_assessment')
  })
})
