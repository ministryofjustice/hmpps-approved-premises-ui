import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import AllocationsController from './allocationsController'
import { TaskService } from '../../services'
import userFactory from '../../testutils/factories/user'
import reallocationFactory from '../../testutils/factories/reallocation'
import { catchValidationErrorOrPropogate } from '../../utils/validation'
import paths from '../../paths/tasks'

jest.mock('../../utils/validation')

describe('AllocationsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const taskService = createMock<TaskService>({})

  let allocationsController: AllocationsController

  beforeEach(() => {
    jest.resetAllMocks()
    allocationsController = new AllocationsController(taskService)
  })

  describe('create', () => {
    beforeEach(() => {
      request.params.id = 'some-uuid'
      request.body.userId = 'some-other-uuid'
      request.user.token = token
    })

    it('should set a flash message and redirect when the API returns correctly', async () => {
      const requestHandler = allocationsController.create()

      const user = userFactory.build({
        name: 'Some User',
      })
      const reallocation = reallocationFactory.build({ user, taskType: 'Assessment' })
      taskService.createAllocation.mockResolvedValue(reallocation)
      request.params.taskType = 'assessment'

      await requestHandler(request, response, next)

      expect(taskService.createAllocation).toHaveBeenCalledWith(
        request.user.token,
        request.params.id,
        request.body.userId,
        request.params.taskType,
      )

      expect(request.flash).toHaveBeenCalledWith('success', `Assessment has been allocated to Some User`)
      expect(response.redirect).toHaveBeenCalledWith(paths.index({}))
    })

    it('should redirect with errors if the API returns an error', async () => {
      const requestHandler = allocationsController.create()

      const err = new Error()

      taskService.createAllocation.mockImplementation(() => {
        throw err
      })

      request.params.taskType = 'assessment'

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.show({ id: request.params.id, taskType: 'assessment' }),
      )
    })
  })
})
