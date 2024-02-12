import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { Task } from '@approved-premises/api'
import TasksController from './tasksController'
import {
  apAreaFactory,
  applicationFactory,
  paginatedResponseFactory,
  taskFactory,
  taskWrapperFactory,
  userDetailsFactory,
} from '../testutils/factories'
import { ApAreaService, ApplicationService, TaskService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'
import { ErrorsAndUserInput, PaginatedResponse } from '../@types/ui'
import paths from '../paths/api'

import { getPaginationDetails } from '../utils/getPaginationDetails'

jest.mock('../utils/validation')
jest.mock('../utils/getPaginationDetails')
describe('TasksController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})
  const taskService = createMock<TaskService>({})
  const apAreaService: DeepMocked<ApAreaService> = createMock<ApAreaService>({})

  let tasksController: TasksController

  beforeEach(() => {
    jest.resetAllMocks()
    tasksController = new TasksController(taskService, applicationService, apAreaService)
  })

  describe('index', () => {
    const apArea = apAreaFactory.build()
    const user = userDetailsFactory.build({ apArea })
    const tasks = taskFactory.buildList(1)
    const paginatedResponse = paginatedResponseFactory.build({
      data: tasks,
    }) as PaginatedResponse<Task>
    const apAreas = apAreaFactory.buildList(1)
    const paginationDetails = {
      hrefPrefix: paths.tasks.index({}),
      pageNumber: 1,
    }

    beforeEach(() => {
      response.locals.user = user
      apAreaService.getApAreas.mockResolvedValue(apAreas)
      ;(getPaginationDetails as jest.Mock).mockReturnValue(paginationDetails)
      taskService.getAllReallocatable.mockResolvedValue(paginatedResponse)
    })

    it('should render the tasks template with the users ap area filtered by default', async () => {
      const requestHandler = tasksController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        tasks,
        allocatedFilter: 'allocated',
        apAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        selectedArea: apArea.id,
      })
      expect(taskService.getAllReallocatable).toHaveBeenCalledWith(token, 'allocated', 'createdAt', 'asc', 1, apArea.id)
    })

    it('should handle request parameters correctly', async () => {
      const paramPaginationDetails = {
        hrefPrefix: paths.tasks.index({}),
        pageNumber: 1,
        sortBy: 'name',
        sortDirection: 'desc',
      }

      ;(getPaginationDetails as jest.Mock).mockReturnValue(paramPaginationDetails)
      taskService.getAllReallocatable.mockResolvedValue(paginatedResponse)

      const requestHandler = tasksController.index()

      const unallocatedRequest = { ...request, query: { allocatedFilter: 'unallocated', area: '1234' } }

      await requestHandler(unallocatedRequest, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        tasks,
        allocatedFilter: 'unallocated',
        apAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: paramPaginationDetails.sortBy,
        sortDirection: paramPaginationDetails.sortDirection,
        selectedArea: '1234',
      })
      expect(getPaginationDetails).toHaveBeenCalledWith(unallocatedRequest, paths.tasks.index({}), {
        allocatedFilter: 'unallocated',
        area: '1234',
      })
      expect(taskService.getAllReallocatable).toHaveBeenCalledWith(
        token,
        'unallocated',
        paramPaginationDetails.sortBy,
        paramPaginationDetails.sortDirection,
        1,
        '1234',
      )
    })

    it('should not send an area query if the  if the query is "all"', async () => {
      const requestHandler = tasksController.index()
      const requestWithQuery = { ...request, query: { area: 'all' } }
      await requestHandler(requestWithQuery, response, next)

      expect(taskService.getAllReallocatable).toHaveBeenCalledWith(token, 'allocated', 'createdAt', 'asc', 1, '')

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Task Allocation',
        tasks,
        allocatedFilter: 'allocated',
        apAreas,
        pageNumber: Number(paginatedResponse.pageNumber),
        totalPages: Number(paginatedResponse.totalPages),
        hrefPrefix: paginationDetails.hrefPrefix,
        sortBy: 'createdAt',
        sortDirection: 'asc',
        selectedArea: 'all',
      })
    })
  })

  describe('show', () => {
    const task = taskFactory.build({ taskType: 'PlacementRequest' })
    const taskWrapper = taskWrapperFactory.build({ task })
    const application = applicationFactory.build()
    const apAreas = apAreaFactory.buildList(1)

    beforeEach(() => {
      apAreaService.getApAreas.mockResolvedValue(apAreas)
      taskService.find.mockResolvedValue(taskWrapper)
      applicationService.findApplication.mockResolvedValue(application)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
    })

    it('fetches the application and a list of qualified users', async () => {
      const requestHandler = tasksController.show()
      request.params.taskType = 'placement-request'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Placement Request`,
        application,
        task: taskWrapper.task,
        users: taskWrapper.users,
        errors: {},
        errorSummary: [],
        apAreas,
        apAreaId: '',
        qualification: '',
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType, {
        apAreaId: '',
      })
      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, task.applicationId)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = tasksController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Placement Request`,
        application,
        task: taskWrapper.task,
        users: taskWrapper.users,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        apAreas,
        apAreaId: '',
        qualification: '',
        ...errorsAndUserInput.userInput,
      })
    })

    it('should handle params and query parameters correctly', async () => {
      const params = { id: 'task-id', taskType: 'placement-request' }
      const userFilters = { apAreaId: 'some-id', qualification: 'esap' }
      const requestWithQuery = { ...request, params, query: userFilters }
      const requestHandler = tasksController.show()
      await requestHandler(requestWithQuery, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Placement Request`,
        application,
        errors: {},
        errorSummary: [],
        task: taskWrapper.task,
        users: taskWrapper.users,
        apAreas,
        apAreaId: userFilters.apAreaId,
        qualification: userFilters.qualification,
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, params.id, params.taskType, userFilters)
    })
  })
})
