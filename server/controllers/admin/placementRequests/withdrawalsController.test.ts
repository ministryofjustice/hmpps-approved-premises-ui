import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PlacementRequestService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/admin'
import WithdrawalsController from './withdrawalsController'
import { ErrorWithData } from '../../../utils/errors'
import { placementRequestDetailFactory } from '../../../testutils/factories'

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
      const placementRequest = placementRequestDetailFactory.build({ applicationId })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)
      request.params.id = applicationId

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this placement request being withdrawn?',
        id: request.params.id,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        applicationId,
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, applicationId)
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'

    beforeEach(() => {
      request.params.id = applicationId
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      request.body.reason = 'DuplicatePlacementRequest'

      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(placementRequestService.withdraw).toHaveBeenCalledWith(token, applicationId, 'DuplicatePlacementRequest')
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

    it('redirects with errors if reason is blank', async () => {
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
        'invalid-params': [{ propertyName: `$.reason`, errorType: 'empty' }],
      })
    })
  })
})
