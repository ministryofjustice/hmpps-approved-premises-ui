import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PlacementRequestService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/admin'
import WithdrawalsController from './withdrawalsController'
import { ErrorWithData } from '../../../utils/errors'

jest.mock('../../../utils/validation')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementRequestService = createMock<PlacementRequestService>({})

  let withdrawalsController: WithdrawalsController

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(placementRequestService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const applicationId = 'some-id'
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Are you sure you want to withdraw this placement request?',
        id: request.params.id,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'

    beforeEach(() => {
      request.params.id = applicationId
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      request.body.confirm = 'yes'

      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(placementRequestService.withdraw).toHaveBeenCalledWith(token, applicationId)
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.placementRequests.index({}))
      expect(request.flash).toHaveBeenCalledWith('success', 'Placement request withdrawn successfully')
    })

    it('redirects with errors if the API returns an error', async () => {
      const requestHandler = withdrawalsController.create()

      const err = new Error()

      placementRequestService.withdraw.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.admin.placementRequests.withdrawal.new({ id: request.params.id }),
      )
    })

    it('redirects with errors if confirm is blank', async () => {
      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ErrorWithData({}),
        paths.admin.placementRequests.withdrawal.new({ id: request.params.id }),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        'invalid-params': [{ propertyName: `$.confirm`, errorType: 'empty' }],
      })
    })

    it('redirects to the placement request if confirm is no', async () => {
      request.body.confirm = 'no'

      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(placementRequestService.withdraw).not.toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.placementRequests.show({ id: request.params.id }))
      expect(request.flash).toHaveBeenCalledWith('success', 'Placement request not withdrawn')
    })
  })
})
