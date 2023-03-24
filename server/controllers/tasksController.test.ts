import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import TasksController from './tasksController'
import taskFactory from '../testutils/factories/task'
import { groupByAllocation } from '../utils/tasks'
import { ApplicationService, TaskService, UserService } from '../services'
import { getQualificationsForApplication } from '../utils/applications/getQualificationsForApplication'
import userFactory from '../testutils/factories/user'
import applicationFactory from '../testutils/factories/application'
import { fetchErrorsAndUserInput } from '../utils/validation'
import { ErrorsAndUserInput } from '../@types/ui'

jest.mock('../utils/applications/getQualificationsForApplication')
jest.mock('../utils/validation')

describe('TasksController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})
  const taskService = createMock<TaskService>({})
  const userService = createMock<UserService>({})

  let tasksController: TasksController

  beforeEach(() => {
    jest.resetAllMocks()
    tasksController = new TasksController(taskService, applicationService, userService)
  })

  describe('index', () => {
    it('should render the tasks template', async () => {
      const tasks = taskFactory.buildList(1)
      taskService.getAll.mockResolvedValue(tasks)

      const requestHandler = tasksController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Tasks',
        tasks: groupByAllocation(tasks),
      })
      expect(taskService.getAll).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    const task = taskFactory.build({ taskType: 'PlacementRequest' })
    const application = applicationFactory.build()
    const users = userFactory.buildList(3)
    const qualifications = ['foo', 'bar']

    beforeEach(() => {
      taskService.find.mockResolvedValue(task)
      applicationService.findApplication.mockResolvedValue(application)
      userService.getUsers.mockResolvedValue(users)
      ;(getQualificationsForApplication as jest.Mock).mockReturnValue(qualifications)
    })

    it('fetches the application and a list of qualified users', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = tasksController.show()
      request.params.taskType = 'placement-request'

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Placement Request`,
        application,
        task,
        users,
        errors: {},
        errorSummary: [],
      })

      expect(taskService.find).toHaveBeenCalledWith(request.user.token, request.params.id, request.params.taskType)
      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, request.params.id)
      expect(userService.getUsers).toHaveBeenCalledWith(request.user.token, ['assessor'], qualifications)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = tasksController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/show', {
        pageHeading: `Reallocate Placement Request`,
        application,
        task,
        users,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
