import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { SortDirection, Task, TaskSortField } from '@approved-premises/api'
import { ErrorsAndUserInput, ErrorSummary, PaginatedResponse, TaskSearchQualification } from '@approved-premises/ui'
import { faker } from '@faker-js/faker'
import TasksController from './tasksController'
import {
  applicationFactory,
  cruManagementAreaFactory,
  paginatedResponseFactory,
  taskFactory,
  taskWrapperFactory,
  userDetailsFactory,
  userFactory,
} from '../testutils/factories'
import { ApplicationService, CruManagementAreaService, TaskService, UserService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'
import paths from '../paths/tasks'

import { getPaginationDetails } from '../utils/getPaginationDetails'
import { tasksTableHeader, tasksTableRows, userQualificationsSelectOptions } from '../utils/tasks'

jest.mock('../utils/validation')
jest.mock('../utils/getPaginationDetails')

describe('TasksController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})
  const taskService = createMock<TaskService>({})
  const userService: DeepMocked<UserService> = createMock<UserService>({})
  const cruManagementAreaService: DeepMocked<CruManagementAreaService> = createMock<CruManagementAreaService>({})

  let tasksController: TasksController

  beforeEach(() => {
    jest.resetAllMocks()
    tasksController = new TasksController(taskService, applicationService, userService, cruManagementAreaService)
  })

  describe('index', () => {
    const cruManagementArea = cruManagementAreaFactory.build()
    const user = userDetailsFactory.build({ cruManagementArea, permissions: ['cas1_tasks_allocate'] })
    const users = userFactory.buildList(5)
    const tasks = taskFactory.buildList(1)
    const paginatedResponse = paginatedResponseFactory.build({
      data: tasks,
    }) as PaginatedResponse<Task>
    const cruManagementAreas = cruManagementAreaFactory.buildList(3)

    const paginationDetails: {
      hrefPrefix: string
      pageNumber: number
      sortBy: TaskSortField
      sortDirection: SortDirection
    } = {
      hrefPrefix: paths.tasks.index({}),
      pageNumber: 1,
      sortBy: faker.helpers.arrayElement(['person', 'dueAt', 'expectedArrivalDate', 'allocatedTo', 'apType']),
      sortDirection: faker.helpers.arrayElement(['asc', 'desc']),
    }
    const template = 'tasks/index'
    const renderParameters = {
      pageHeading: 'Task Allocation',
      taskHeader: tasksTableHeader(
        'allocated',
        paginationDetails.sortBy,
        paginationDetails.sortDirection,
        paginationDetails.hrefPrefix,
      ),
      taskRows: tasksTableRows(tasks, 'allocated', true),
      allocatedFilter: 'allocated',
      cruManagementAreas,
      pageNumber: Number(paginatedResponse.pageNumber),
      totalPages: Number(paginatedResponse.totalPages),
      hrefPrefix: paginationDetails.hrefPrefix,
      cruManagementArea: cruManagementArea.id,
      userQualificationSelectOptions: userQualificationsSelectOptions(null),
      users,
      activeTab: 'allocated',
    }

    const apiGetAllParameters = {
      allocatedFilter: 'allocated',
      token,
      sortBy: paginationDetails.sortBy,
      sortDirection: paginationDetails.sortDirection,
      page: paginationDetails.pageNumber,
      cruManagementAreaId: cruManagementArea.id,
      taskTypes: ['PlacementApplication', 'Assessment'],
      requiredQualification: null as TaskSearchQualification,
      isCompleted: false,
    }

    beforeEach(() => {
      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)
      taskService.getAll.mockResolvedValue(paginatedResponse)
      userService.getUserList.mockResolvedValue(users)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)

      response.locals.user = user
    })

    it('should render the tasks template with the users CRU management area filtered by default', async () => {
      await tasksController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(template, renderParameters)

      expect(taskService.getAll).toHaveBeenCalledWith(apiGetAllParameters)
    })

    it('should handle request parameters correctly', async () => {
      const query = {
        activeTab: 'unallocated',
        crnOrName: 'ABC123',
        allocatedFilter: 'unallocated',
        area: '1234',
        allocatedToUserId: '123',
        requiredQualification: 'emergency' as TaskSearchQualification,
      }

      const unallocatedRequest = {
        ...request,
        query,
      }

      await tasksController.index()(unallocatedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        ...renderParameters,
        taskHeader: tasksTableHeader(
          'unallocated',
          paginationDetails.sortBy,
          paginationDetails.sortDirection,
          paginationDetails.hrefPrefix,
        ),
        taskRows: tasksTableRows(tasks, 'unallocated', true),

        cruManagementArea: query.area,
        allocatedFilter: query.allocatedFilter,
        allocatedToUserId: query.allocatedToUserId,
        userQualificationSelectOptions: userQualificationsSelectOptions(query.requiredQualification),
        crnOrName: query.crnOrName,
        activeTab: query.activeTab,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(unallocatedRequest, paths.tasks.index({}), query)

      expect(taskService.getAll).toHaveBeenCalledWith({
        ...apiGetAllParameters,
        taskTypes: ['PlacementApplication', 'Assessment'],
        allocatedFilter: query.allocatedFilter,
        requiredQualification: query.requiredQualification,
        cruManagementAreaId: query.area,
        allocatedToUserId: query.allocatedToUserId,
        crnOrName: query.crnOrName,
        isCompleted: false,
      })
    })

    it('should not send an area query if the  if the query is "all"', async () => {
      const requestWithQuery = { ...request, query: { area: 'all' } }

      await tasksController.index()(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith(template, { ...renderParameters, cruManagementArea: 'all' })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.tasks.index({}), {
        activeTab: 'allocated',
        allocatedFilter: 'allocated',
        area: 'all',
        requiredQualification: null,
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        ...apiGetAllParameters,
        cruManagementAreaId: '',
        taskTypes: ['PlacementApplication', 'Assessment'],
        requiredQualification: null,
        isCompleted: false,
      })
    })

    it('should send isCompleted true for completed tab', async () => {
      const activeTab = 'completed'

      const completedRequest = {
        ...request,
        query: {
          activeTab,
        },
      }

      await tasksController.index()(completedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith(template, {
        ...renderParameters,
        activeTab,
        taskHeader: tasksTableHeader(
          activeTab,
          paginationDetails.sortBy,
          paginationDetails.sortDirection,
          paginationDetails.hrefPrefix,
        ),
        taskRows: tasksTableRows(tasks, activeTab, true),
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        ...apiGetAllParameters,
        isCompleted: true,
      })
    })

    it('should not render an allocation link if the user lacks permission', async () => {
      response.locals.user = userDetailsFactory.build({ cruManagementArea, permissions: [] })

      await tasksController.index()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'tasks/index',
        expect.objectContaining({
          taskRows: tasksTableRows(tasks, 'allocated', false),
        }),
      )
    })
  })

  describe('show', () => {
    const task = taskFactory.build({ taskType: 'PlacementApplication' })
    const taskWrapper = taskWrapperFactory.build({ task })
    const application = applicationFactory.build()
    const cruManagementAreas = cruManagementAreaFactory.buildList(3)
    const template = 'tasks/show'
    const expectedRenderParameters = {
      pageHeading: `Reallocate Request for Placement`,
      application,
      task: taskWrapper.task,
      users: taskWrapper.users,
      errors: {},
      errorSummary: [] as Array<ErrorSummary>,
      cruManagementAreas,
      cruManagementAreaId: '',
      qualification: '',
    }

    beforeEach(() => {
      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)
      taskService.find.mockResolvedValue(taskWrapper)
      applicationService.findApplication.mockResolvedValue(application)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
    })

    it('fetches the application and a list of qualified users', async () => {
      request.params.taskType = 'placement-request'

      await tasksController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(template, expectedRenderParameters)

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType, {
        cruManagementAreaId: '',
      })
      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, task.applicationId)
    })

    it('fetches the application and a list of qualified users for Placement Application task', async () => {
      const placementApplication = taskFactory.build({ taskType: 'PlacementApplication' })
      const placementApplicationTaskWrapper = taskWrapperFactory.build({ task: placementApplication })
      taskService.find.mockResolvedValue(placementApplicationTaskWrapper)
      request.params.taskType = 'placement-request'

      await tasksController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(template, {
        ...expectedRenderParameters,
        task: placementApplicationTaskWrapper.task,
        users: placementApplicationTaskWrapper.users,
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType, {
        cruManagementAreaId: '',
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await tasksController.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(template, {
        ...expectedRenderParameters,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('should handle params and query parameters correctly', async () => {
      const params = { id: 'task-id', taskType: 'placement-request' }
      const userFilters = { cruManagementAreaId: 'some-id', qualification: 'esap' }
      const requestWithQuery = { ...request, params, query: userFilters }

      await tasksController.show()(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith(template, {
        ...expectedRenderParameters,
        cruManagementAreaId: userFilters.cruManagementAreaId,
        qualification: userFilters.qualification,
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, params.id, params.taskType, userFilters)
    })
  })
})
