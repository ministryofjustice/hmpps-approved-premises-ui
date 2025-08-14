import { ApprovedPremisesUser } from '@approved-premises/api'
import { AND, GIVEN, THEN, WHEN } from '../../helpers'
import ListPage from '../../pages/tasks/listPage'

import {
  apAreaFactory,
  cruManagementAreaFactory,
  taskFactory,
  userSummaryFactory,
} from '../../../server/testutils/factories'
import { restrictedPersonSummaryTaskFactory } from '../../../server/testutils/factories/task'
import { restrictedPersonSummaryAssessmentTaskFactory } from '../../../server/testutils/factories/assessmentTask'
import paths from '../../../server/paths/tasks'
import { fullPersonSummaryFactory } from '../../../server/testutils/factories/person'
import { signIn } from '../signIn'

context('Task Allocation', () => {
  const users = userSummaryFactory.buildList(5)
  const apArea = apAreaFactory.build()
  const additionalArea = apAreaFactory.build()
  const cruManagementAreas = cruManagementAreaFactory.buildList(5)
  const user: Partial<ApprovedPremisesUser> = {
    apArea,
    cruManagementArea: cruManagementAreas[0],
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserSummaryList', { users, roles: ['assessor', 'appeals_manager'] })
    cy.task('stubApAreaReferenceData', { apArea, additionalAreas: [additionalArea] })
    cy.task('stubCruManagementAreaReferenceData', { cruManagementAreas })
  })

  it('returns unauthorised if user does not have the cas1 view manage task permission', () => {
    GIVEN('I am signed in as an applicant with the correct AP area')
    signIn('applicant', { apArea })

    const path = paths.tasks.index({})
    cy.request({ url: path, failOnStatusCode: false }).should(response => {
      expect(response.status).to.eq(401)
    })
  })

  it('shows a list of tasks for LAO', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const allocatedTasks = restrictedPersonSummaryTaskFactory.buildList(5)
    const unallocatedTasks = restrictedPersonSummaryTaskFactory.buildList(5, { allocatedToStaffMember: undefined })
    const completedTasks = restrictedPersonSummaryAssessmentTaskFactory.buildList(5)

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: [...unallocatedTasks],
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: [...completedTasks],
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      isCompleted: 'true',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasks)
    listPage.shouldContainHeaderLinks(allocatedTasks)

    AND('I should see the allocated to user select option')
    listPage.shouldShowAllocatedToUserFilter()

    AND('the tasks that are unallocated')
    listPage.clickTab('Unallocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasks)
    listPage.shouldContainHeaderLinks(unallocatedTasks)

    AND('I should not see the allocated to user select option')
    listPage.shouldNotShowAllocatedToUserFilter()

    AND('the tasks that are completed')
    listPage.clickTab('Completed')
    listPage.shouldShowCompletedTasks(completedTasks)
    listPage.shouldContainHeaderLinks(completedTasks)
  })

  it('shows a list of tasks', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const allocatedTasks = taskFactory.buildList(1, { personSummary: fullPersonSummaryFactory.build() })
    const unallocatedTasks = taskFactory.buildList(1, {
      allocatedToStaffMember: undefined,
      personSummary: fullPersonSummaryFactory.build(),
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: [...unallocatedTasks],
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasks)

    AND('I should see the allocated to user select option')
    listPage.shouldShowAllocatedToUserFilter()

    AND('the tasks that are unallocated')
    listPage.clickTab('Unallocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasks)

    AND('I should not see the allocated to user select option')
    listPage.shouldNotShowAllocatedToUserFilter()
  })

  it('supports pagination', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const allocatedTasksPage1 = restrictedPersonSummaryTaskFactory.buildList(10)
    const allocatedTasksPage2 = restrictedPersonSummaryTaskFactory.buildList(10)
    const allocatedTasksPage9 = restrictedPersonSummaryTaskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksPage1,
      allocatedFilter: 'allocated',
      page: '1',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksPage2,
      allocatedFilter: 'allocated',
      page: '2',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksPage9,
      allocatedFilter: 'allocated',
      page: '9',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasksPage1)
    WHEN('I click next')
    listPage.clickNext()

    THEN('the API should have received a request for the next page')
    cy.task('verifyTasksRequests', { page: '2', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    AND('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasksPage2)

    WHEN('I click on a page number')
    listPage.clickPageNumber('9')

    THEN('the API should have received a request for the that page number')
    cy.task('verifyTasksRequests', { page: '9', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    AND('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasksPage9)
  })

  it('supports sorting', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const sortFields = ['dueAt', 'person', 'allocatedTo', 'expectedArrivalDate', 'apType']
    const tasks = restrictedPersonSummaryTaskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      tasks,
      allocatedFilter: 'allocated',
      sortDirection: 'asc',
      sortBy: 'createdAt',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    sortFields.forEach(sortField => {
      cy.task('stubGetAllTasks', {
        tasks,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        sortBy: sortField,
        cruManagementAreaId: cruManagementAreas[0].id,
      })

      cy.task('stubGetAllTasks', {
        tasks,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
        cruManagementAreaId: cruManagementAreas[0].id,
      })
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(tasks)

    sortFields.forEach(sortField => {
      WHEN('I sort by the sortField in ascending order')
      listPage.clickSortBy(sortField)

      THEN('the dashboard should be sorted by the sortField in ascending order')
      listPage.shouldBeSortedByField(sortField, 'ascending')

      WHEN('I sort by the sortField in descending order')
      listPage.clickSortBy(sortField)

      THEN('the dashboard should be sorted by the sortField in ascending order')
      listPage.shouldBeSortedByField(sortField, 'descending')

      AND('the API should have received a request for the correct sort order')
      cy.task('verifyTasksRequests', {
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })
  })

  const filterOptions = {
    area: {
      apiKey: 'cruManagamentAreaId',
      value: cruManagementAreas[0].id,
    },
    allocatedToUserId: {
      apiKey: 'allocatedToUserId',
      value: users[0].id,
    },
    requiredQualification: {
      apiKey: 'requiredQualification',
      value: 'emergency',
    },
    crnOrName: {
      apiKey: 'crnOrName',
      value: 'CRN123',
      type: 'input',
    },
  }

  Object.keys(filterOptions).forEach(key => {
    it(`allows filter by ${key}`, () => {
      GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
      signIn('cru_member', user)

      const allocatedTasks = restrictedPersonSummaryTaskFactory.buildList(10)
      const allocatedTasksFiltered = restrictedPersonSummaryTaskFactory.buildList(1)

      cy.task('stubGetAllTasks', {
        tasks: allocatedTasks,
        allocatedFilter: 'allocated',
        page: '1',
        cruManagementAreaId: cruManagementAreas[0].id,
      })

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      THEN('I should see the tasks that are allocated')
      listPage.shouldShowAllocatedTasks(allocatedTasks)

      WHEN('I filter by region')
      cy.task('stubGetAllTasks', {
        tasks: allocatedTasksFiltered,
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        cruManagementAreaId: cruManagementAreas[0].id,

        [filterOptions[key].apiKey]: filterOptions[key].value,
      })

      if (filterOptions[key].type === 'input') {
        listPage.clearAndCompleteTextInputById(key, filterOptions[key].value)
      } else {
        listPage.searchBy(key, filterOptions[key].value)
      }
      listPage.clickApplyFilter()

      THEN('the page should show the results')
      listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)
    })
  })

  it('maintains filter on tab change', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const allocatedTasks = restrictedPersonSummaryTaskFactory.buildList(10)
    const allocatedTasksFiltered = restrictedPersonSummaryTaskFactory.buildList(1)

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowAllocatedTasks(allocatedTasks)

    WHEN('I filter by CRU Management area')
    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[1].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[1].id,
    })

    listPage.searchBy('area', cruManagementAreas[1].id)
    listPage.clickApplyFilter()

    THEN('the page should show the results')
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)

    AND('click on unallocated tab')
    listPage.clickTab('Unallocated')

    THEN('the page should keep the area filter')
    listPage.shouldHaveSelectText('area', cruManagementAreas[1].name)
  })

  it('retains the unallocated filter when applying other filters', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const unallocatedTasks = restrictedPersonSummaryTaskFactory.buildList(10, { allocatedToStaffMember: undefined })
    const unallocatedTasksFiltered = restrictedPersonSummaryTaskFactory.buildList(1, {
      allocatedToStaffMember: undefined,
    })

    cy.task('stubGetAllTasks', {
      tasks: unallocatedTasks,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    GIVEN('I am on the tasks dashboard filtering by the unallocated tab')
    const listPage = ListPage.visit('allocatedFilter=unallocated&activeTab=unallocated')

    THEN('I should see the tasks that are allocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasks)

    WHEN('I filter by region')
    cy.task('stubGetAllTasks', {
      tasks: unallocatedTasksFiltered,
      allocatedFilter: 'unallocated',
      page: '1',
      sortDirection: 'asc',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    listPage.searchBy('area', cruManagementAreas[0].id)
    listPage.clickApplyFilter()

    THEN('the status filter should be retained and allocated results should be shown')
    listPage.shouldHaveActiveTab('Unallocated')
    listPage.shouldShowUnallocatedTasks(unallocatedTasksFiltered)
  })

  it('defaults to user area but allows filter by all areas', () => {
    GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
    signIn('cru_member', user)

    const allocatedTasks = restrictedPersonSummaryTaskFactory.buildList(1)
    const allocatedTasksFiltered = restrictedPersonSummaryTaskFactory.buildList(10)
    const allocatedTasksFilteredPage2 = restrictedPersonSummaryTaskFactory.buildList(10)

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasks,
      allocatedFilter: 'allocated',
      page: '1',
      cruManagementAreaId: cruManagementAreas[0].id,
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      page: '1',
      cruManagementAreaId: '',
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFilteredPage2,
      allocatedFilter: 'allocated',
      page: '2',
      cruManagementAreaId: '',
    })

    cy.task('stubGetAllTasks', {
      tasks: allocatedTasksFiltered,
      allocatedFilter: 'allocated',
      sortDirection: 'asc',
      page: '1',
      sortBy: 'dueAt',
      cruManagementAreaId: '',
    })

    WHEN('I visit the tasks dashboard')
    const listPage = ListPage.visit()

    THEN('I should see the tasks that are allocated to my area')
    listPage.shouldShowAllocatedTasks(allocatedTasks)

    WHEN('I filter by all regions')
    listPage.searchBy('area', 'all')
    listPage.clickApplyFilter()

    THEN('the page should show the results')
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)

    WHEN('I visit the next page')
    listPage.clickNext()

    cy.task('verifyTasksRequests', { page: '2', allocatedFilter: 'allocated' }).then(requests => {
      expect(requests).to.have.length(1)
    })

    THEN('the page should show the results')
    listPage.shouldShowAllocatedTasks(allocatedTasksFilteredPage2)

    WHEN('I sort by the due date at in ascending order')
    listPage.clickSortBy('dueAt')

    THEN('the dashboard should be sorted by the due date')
    listPage.shouldBeSortedByField('dueAt', 'ascending')

    THEN('the page should show the filtered results')
    listPage.shouldShowAllocatedTasks(allocatedTasksFiltered)
  })
  ;(['taskType', 'decision', 'completedAt'] as const).forEach(sortField => {
    it(`supports pending placement requests sorting by ${sortField}`, () => {
      GIVEN('I am signed in as a CRU member with the correct AP area and CRU management area')
      signIn('cru_member', user)

      cy.task('stubGetAllTasks', {
        tasks: [],
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        cruManagementAreaId: cruManagementAreas[0].id,
      })
      const completedTasks = restrictedPersonSummaryAssessmentTaskFactory.buildList(5)
      cy.task('stubGetAllTasks', {
        tasks: [...completedTasks],
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        sortBy: 'createdAt',
        isCompleted: 'true',
        cruManagementAreaId: cruManagementAreas[0].id,
      })
      cy.task('stubGetAllTasks', {
        tasks: [...completedTasks],
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        sortBy: sortField,
        isCompleted: 'true',
        cruManagementAreaId: cruManagementAreas[0].id,
      })
      cy.task('stubGetAllTasks', {
        tasks: [...completedTasks],
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
        isCompleted: 'true',
        cruManagementAreaId: cruManagementAreas[0].id,
      })

      WHEN('I visit the tasks dashboard')
      const listPage = ListPage.visit()

      AND('click the completed tab')
      listPage.clickTab('Completed')

      THEN('I should tasks that are completed')
      listPage.shouldShowCompletedTasks(completedTasks)

      WHEN('I sort by sortField in ascending order')
      listPage.clickSortBy(sortField)

      THEN('the tasks should be sorted by sortField')
      listPage.shouldBeSortedByField(sortField, 'ascending')

      AND('the API should have received a request for the correct sort order')
      cy.task('verifyTasksRequests', {
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'asc',
        sortBy: sortField,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })

      WHEN('I sort by  descending order')
      listPage.clickSortBy(sortField)

      THEN('the tasks should be sorted in descending order')
      listPage.shouldBeSortedByField(sortField, 'descending')

      AND('the API should have received a request for the correct sort order')
      cy.task('verifyTasksRequests', {
        allocatedFilter: 'allocated',
        page: '1',
        sortDirection: 'desc',
        sortBy: sortField,
      }).then(requests => {
        expect(requests).to.have.length(1)
      })
    })
  })
})
