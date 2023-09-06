import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import DeliusUserController from './deliusUserController'
import { UserService } from '../../services'
import { userFactory } from '../../testutils/factories'

jest.createMockFromModule('../../services/userService')

describe('DeliusUserController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let deliusUserController: DeliusUserController
  let userService: DeepMocked<UserService>

  beforeEach(() => {
    userService = createMock<UserService>()
    deliusUserController = new DeliusUserController(userService)
    jest.resetAllMocks()
  })

  describe('new', () => {
    it('renders the search page', async () => {
      const requestHandler = deliusUserController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/users/new', {
        pageHeading: 'Find a new user',
      })
    })
  })

  describe('search', () => {
    it('calls the service method and renders the view with the result', async () => {
      const user = userFactory.build()
      userService.searchDelius.mockResolvedValue(user)

      const requestHandler = deliusUserController.search()

      request.body = { username: 'SOME_USERNAME' }

      await requestHandler(request, response, next)

      expect(userService.searchDelius).toHaveBeenCalledWith(token, 'SOME_USERNAME')
      expect(response.render).toHaveBeenCalledWith('admin/users/confirm', {
        pageHeading: 'Confirm new user',
        user,
      })
    })
  })
})
