import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { Task } from '@approved-premises/api'
import { when } from 'jest-when'
import { ErrorsAndUserInput, PaginatedResponse } from '@approved-premises/ui'
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
    const paginationDetails = {
      hrefPrefix: paths.tasks.index({}),
      pageNumber: 1,
    }

    beforeEach(() => {
      when(cruManagementAreaService.getCruManagementAreas).calledWith(token).mockResolvedValue(cruManagementAreas)
      when(taskService.getAll).calledWith(expect.anything()).mockResolvedValue(paginatedResponse)
      when(userService.getUserList).calledWith(token, ['assessor', 'appeals_manager']).mockResolvedValue(users)
      when(getPaginationDetails as jest.Mock)
        .calledWith(request, paths.tasks.index({}), expect.anything())
        .mockReturnValue(paginationDetails)

      response.locals.user = user
    })

    it('should render the tasks template with the users CRU management area filtered by default', async () => {
      const requestHandler = tasksController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        taskHeader: tasksTableHeader('allocated', 'createdAt', 'asc', paginationDetails.hrefPrefix),
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
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        allocatedFilter: 'allocated',
        token,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        page: 1,
        cruManagementAreaId: cruManagementArea.id,
        taskTypes: ['PlacementApplication', 'Assessment'],
        requiredQualification: null,
        isCompleted: false,
      })
    })

    it('should handle request parameters correctly', async () => {
      const paramPaginationDetails = {
        hrefPrefix: paths.tasks.index({}),
        pageNumber: 1,
        sortBy: 'name',
        sortDirection: 'desc',
      }
      const cruManagementAreaId = '1234'
      const allocatedFilter = 'unallocated'
      const allocatedToUserId = '123'
      const requiredQualification = 'emergency'
      const crnOrName = 'ABC123'
      const activeTab = 'unallocated'

      const requestHandler = tasksController.index()
      const unallocatedRequest = {
        ...request,
        query: {
          activeTab,
          allocatedFilter,
          area: cruManagementAreaId,
          allocatedToUserId,
          requiredQualification,
          crnOrName,
        },
      }

      when(getPaginationDetails as jest.Mock)
        .calledWith(unallocatedRequest, paths.tasks.index({}), {
          activeTab,
          allocatedFilter,
          area: cruManagementAreaId,
          allocatedToUserId,
          requiredQualification,
          crnOrName,
        })
        .mockReturnValue(paramPaginationDetails)

      await requestHandler(unallocatedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        taskHeader: tasksTableHeader('unallocated', 'createdAt', 'asc', paginationDetails.hrefPrefix),
        taskRows: tasksTableRows(tasks, 'unallocated', true),
        allocatedFilter,
        cruManagementAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        cruManagementArea: cruManagementAreaId,
        users,
        allocatedToUserId,
        userQualificationSelectOptions: userQualificationsSelectOptions(requiredQualification),
        crnOrName,
        activeTab,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(unallocatedRequest, paths.tasks.index({}), {
        activeTab,
        allocatedFilter,
        area: cruManagementAreaId,
        allocatedToUserId,
        requiredQualification,
        crnOrName,
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        allocatedFilter,
        token,
        sortBy: paramPaginationDetails.sortBy,
        sortDirection: paramPaginationDetails.sortDirection,
        page: paramPaginationDetails.pageNumber,
        cruManagementAreaId,
        taskTypes: ['PlacementApplication', 'Assessment'],
        allocatedToUserId,
        requiredQualification,
        crnOrName,
        isCompleted: false,
      })
    })

    it('should not send an area query if the  if the query is "all"', async () => {
      const paramPaginationDetails = {
        hrefPrefix: paths.tasks.index({}),
        pageNumber: 1,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        allocatedFilter: 'allocated',
      }

      const requestHandler = tasksController.index()
      const requestWithQuery = { ...request, query: { area: 'all' } }

      when(getPaginationDetails as jest.Mock)
        .calledWith(requestWithQuery, paths.tasks.index({}), {
          activeTab: 'allocated',
          allocatedFilter: 'allocated',
          area: 'all',
          requiredQualification: null,
        })
        .mockReturnValue(paramPaginationDetails)

      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        taskHeader: tasksTableHeader('allocated', 'createdAt', 'asc', paginationDetails.hrefPrefix),
        taskRows: tasksTableRows(tasks, 'allocated', true),
        allocatedFilter: paramPaginationDetails.allocatedFilter,
        cruManagementAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        cruManagementArea: 'all',
        users,
        userQualificationSelectOptions: userQualificationsSelectOptions(null),
        activeTab: 'allocated',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(requestWithQuery, paths.tasks.index({}), {
        activeTab: 'allocated',
        allocatedFilter: 'allocated',
        area: 'all',
        requiredQualification: null,
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        allocatedFilter: paramPaginationDetails.allocatedFilter,
        token,
        sortBy: paramPaginationDetails.sortBy,
        sortDirection: paramPaginationDetails.sortDirection,
        page: paramPaginationDetails.pageNumber,
        cruManagementAreaId: '',
        taskTypes: ['PlacementApplication', 'Assessment'],
        requiredQualification: null,
        isCompleted: false,
      })
    })

    it('should send isCompleted true for completed tab', async () => {
      const paramPaginationDetails = {
        hrefPrefix: paths.tasks.index({}),
        pageNumber: 1,
        sortBy: 'name',
        sortDirection: 'desc',
        activeTab: 'completed',
      }
      const cruManagementAreaId = '1234'
      const allocatedFilter = 'unallocated'
      const allocatedToUserId = '123'
      const requiredQualification = 'emergency'
      const crnOrName = 'ABC123'
      const activeTab = 'completed'

      const requestHandler = tasksController.index()
      const unallocatedRequest = {
        ...request,
        query: {
          activeTab,
          allocatedFilter,
          area: cruManagementAreaId,
          allocatedToUserId,
          requiredQualification,
          crnOrName,
        },
      }

      when(getPaginationDetails as jest.Mock)
        .calledWith(unallocatedRequest, paths.tasks.index({}), {
          activeTab,
          allocatedFilter,
          area: cruManagementAreaId,
          allocatedToUserId,
          requiredQualification,
          crnOrName,
        })
        .mockReturnValue(paramPaginationDetails)

      await requestHandler(unallocatedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        taskHeader: tasksTableHeader(activeTab, 'createdAt', 'asc', paginationDetails.hrefPrefix),
        taskRows: tasksTableRows(tasks, activeTab, true),
        allocatedFilter,
        cruManagementAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        cruManagementArea: cruManagementAreaId,
        users,
        allocatedToUserId,
        userQualificationSelectOptions: userQualificationsSelectOptions(requiredQualification),
        crnOrName,
        activeTab,
      })

      expect(getPaginationDetails).toHaveBeenCalledWith(unallocatedRequest, paths.tasks.index({}), {
        activeTab,
        allocatedFilter,
        area: cruManagementAreaId,
        allocatedToUserId,
        requiredQualification,
        crnOrName,
      })

      expect(taskService.getAll).toHaveBeenCalledWith({
        allocatedFilter,
        token,
        sortBy: paramPaginationDetails.sortBy,
        sortDirection: paramPaginationDetails.sortDirection,
        page: paramPaginationDetails.pageNumber,
        cruManagementAreaId,
        taskTypes: ['PlacementApplication', 'Assessment'],
        allocatedToUserId,
        requiredQualification,
        crnOrName,
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

    beforeEach(() => {
      cruManagementAreaService.getCruManagementAreas.mockResolvedValue(cruManagementAreas)
      taskService.find.mockResolvedValue(taskWrapper)
      applicationService.findApplication.mockResolvedValue(application)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
    })

    it('fetches the application and a list of qualified users', async () => {
      const requestHandler = tasksController.show()
      request.params.taskType = 'placement-request'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Request for Placement`,
        application,
        task: taskWrapper.task,
        users: taskWrapper.users,
        errors: {},
        errorSummary: [],
        cruManagementAreas,
        cruManagementAreaId: '',
        qualification: '',
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType, {
        cruManagementAreaId: '',
      })
      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, task.applicationId)
    })

    it('fetches the application and a list of qualified users for Placement Application task', async () => {
      const placementApplication = taskFactory.build({ taskType: 'PlacementApplication' })
      const placementApplicationTaskWrapper = taskWrapperFactory.build({ task: placementApplication })
      taskService.find.mockResolvedValue(placementApplicationTaskWrapper)
      const requestHandler = tasksController.show()
      request.params.taskType = 'placement-request'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Request for Placement`,
        application,
        task: placementApplicationTaskWrapper.task,
        users: placementApplicationTaskWrapper.users,
        errors: {},
        errorSummary: [],
        cruManagementAreas,
        cruManagementAreaId: '',
        qualification: '',
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType, {
        cruManagementAreaId: '',
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = tasksController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Request for Placement`,
        application,
        task: taskWrapper.task,
        users: taskWrapper.users,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        cruManagementAreas,
        cruManagementAreaId: '',
        qualification: '',
        ...errorsAndUserInput.userInput,
      })
    })

    it('should handle params and query parameters correctly', async () => {
      const params = { id: 'task-id', taskType: 'placement-request' }
      const userFilters = { cruManagementAreaId: 'some-id', qualification: 'esap' }
      const requestWithQuery = { ...request, params, query: userFilters }
      const requestHandler = tasksController.show()
      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Request for Placement`,
        application,
        errors: {},
        errorSummary: [],
        task: taskWrapper.task,
        users: taskWrapper.users,
        cruManagementAreas,
        cruManagementAreaId: userFilters.cruManagementAreaId,
        qualification: userFilters.qualification,
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, params.id, params.taskType, userFilters)
    })
  })
})
