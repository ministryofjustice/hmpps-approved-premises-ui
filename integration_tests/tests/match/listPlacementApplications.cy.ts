import { placementApplicationTaskFactory } from '../../../server/testutils/factories'
import { defaultUserId } from '../../mockApis/auth'
import ListPage from '../../pages/match/listPlacementRequestsPage'

describe('List placement applications', () => {
  it('should list pages of placement applications', () => {
    // Given I am signed in
    cy.signIn()

    // And some placement applications exist
    const page1PlacementApplications = placementApplicationTaskFactory.buildList(10)
    const page2PlacementApplications = placementApplicationTaskFactory.buildList(10)
    const page3PlacementApplications = placementApplicationTaskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: page1PlacementApplications,
      page: '1',
      allocatedToUserId: defaultUserId,
    })
    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: page2PlacementApplications,
      page: '2',
      allocatedToUserId: defaultUserId,
    })
    cy.task('stubGetAllTasks', {
      type: 'PlacementApplication',
      tasks: page3PlacementApplications,
      page: '3',
      allocatedToUserId: defaultUserId,
    })

    // When I visit the placementRequests dashboard
    const listPage = ListPage.visit()

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
  })
})
