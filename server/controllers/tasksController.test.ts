import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import TasksController from './tasksController'
import TaskService from '../services/taskService'
import taskFactory from '../testutils/factories/task'
import { groupByAllocation } from '../utils/tasks'

describe('TasksController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const tasksService = createMock<TaskService>({})

  let tasksController: TasksController

  beforeEach(() => {
    jest.resetAllMocks()
    tasksController = new TasksController(tasksService)
  })

  describe('index', () => {
    it('should render the tasks template', async () => {
      const tasks = taskFactory.buildList(1)
      tasksService.getAll.mockResolvedValue(tasks)

      const requestHandler = tasksController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('tasks/index', {
        pageHeading: 'Tasks',
        tasks: groupByAllocation(tasks),
      })
    })
  })
})
