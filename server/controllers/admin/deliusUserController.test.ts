import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import DeliusUserController from './deliusUserController'
import { UserService } from '../../services'
import { userFactory } from '../../testutils/factories'
import paths from '../../paths/admin'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import { ErrorsAndUserInput } from '../../@types/ui'

jest.createMockFromModule('../../services/userService')
jest.mock('../../utils/validation')

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
      ;(fetchErrorsAndUserInput as jest.MockedFunction<typeof fetchErrorsAndUserInput>).mockReturnValue({
        errors: {},
        errorSummary: [],
        userInput: {},
      })

      const requestHandler = deliusUserController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/users/new', {
        pageHeading: 'Find a new user',
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = deliusUserController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/users/new', {
        pageHeading: 'Find a new user',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
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

    it('sends an error to the flash if the API returns a 404', async () => {
      const err = { data: {}, status: 404 }
      userService.searchDelius.mockImplementation(() => {
        throw err
      })
      request.body.username = 'SOME_USERNAME'
      const requestHandler = deliusUserController.search()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.admin.userManagement.new({}))
      expect(addErrorMessageToFlash).toHaveBeenCalledWith(
        request,
        'User not found. Enter the NDelius username as appears on NDelius',
        'username',
      )
    })
  })
})
