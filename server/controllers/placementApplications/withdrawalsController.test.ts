import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import { PlacementApplicationService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import placementApplicationPaths from '../../paths/placementApplications'
import WithdrawalsController from './withdrawalsController'
import { placementApplicationFactory } from '../../testutils/factories'
import { applicationShowPageTab } from '../../utils/applications/utils'

jest.mock('../../utils/validation')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementApplicationService = createMock<PlacementApplicationService>({})

  let withdrawalsController: WithdrawalsController
  const applicationId = 'app-id'
  const placementApplicationId = 'place-app-id'

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(placementApplicationService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const placementApplication = placementApplicationFactory.build({ applicationId })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = placementApplicationId

      placementApplicationService.getPlacementApplication.mockResolvedValue(placementApplication)

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('placement-applications/withdraw/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        placementApplicationId: placementApplication.id,
        applicationId,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
      expect(placementApplicationService.getPlacementApplication).toHaveBeenCalledWith(token, placementApplicationId)
    })
  })

  describe('create', () => {
    it('calls the service method, redirects to the application screen and shows a confirmation message', async () => {
      request.body.applicationId = applicationId
      request.params.id = placementApplicationId
      request.body.reason = 'DuplicatePlacementRequest'
      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(placementApplicationService.withdraw).toHaveBeenCalledWith(
        token,
        placementApplicationId,
        request.body.reason,
      )
      expect(response.redirect).toHaveBeenCalledWith(applicationShowPageTab(applicationId, 'placementRequests'))
      expect(request.flash).toHaveBeenCalledWith('success', 'Placement application withdrawn')
    })

    it('redirects with errors if the API returns an error', async () => {
      request.params.id = placementApplicationId

      const requestHandler = withdrawalsController.create()

      const err = new Error()

      placementApplicationService.withdraw.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        placementApplicationPaths.placementApplications.withdraw.new({ id: placementApplicationId }),
      )
    })
  })
})
