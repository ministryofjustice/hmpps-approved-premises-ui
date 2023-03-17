import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import TasksController from './tasksController'
import taskFactory from '../testutils/factories/task'
import { groupByAllocation } from '../utils/tasks'
import { ApplicationService, TaskService, UserService } from '../services'
import { getQualificationsForApplication } from '../utils/applications/getQualificationsForApplication'
import userFactory from '../testutils/factories/user'
import applicationFactory from '../testutils/factories/application'
import assessmentFactory from '../testutils/factories/assessment'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { ErrorsAndUserInput } from '../@types/ui'
import paths from '../paths/tasks'

jest.mock('../utils/applications/getQualificationsForApplication')
jest.mock('../utils/validation')

describe('TasksController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const applicationService = createMock<ApplicationService>({})
  const taskService = createMock<TaskService>({})
  const userService = createMock<UserService>({})

  let tasksController: TasksController

  const token = 'SOME_TOKEN'

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
    })
  })

  describe('show', () => {
    const application = applicationFactory.build()
    const users = userFactory.buildList(3)
    const qualifications = ['foo', 'bar']

    beforeEach(() => {
      applicationService.findApplication.mockResolvedValue(application)
      userService.getUsers.mockResolvedValue(users)
      ;(getQualificationsForApplication as jest.Mock).mockReturnValue(qualifications)
    })

    it('fetches the application and a list of qualified users', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = tasksController.show()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/allocations/show', {
        pageHeading: `Task for allocation`,
        application,
        users,
        errors: {},
        errorSummary: [],
      })

      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, request.params.id)
      expect(userService.getUsers).toHaveBeenCalledWith(request.user.token, ['assessor'], qualifications)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = tasksController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/allocations/show', {
        pageHeading: `Task for allocation`,
        application,
        users,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
