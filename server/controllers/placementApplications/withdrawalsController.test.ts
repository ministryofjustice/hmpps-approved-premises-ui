import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import { PlacementApplicationService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import placementApplicationPaths from '../../paths/placementApplications'
import WithdrawalsController from './withdrawalsController'
import { placementApplicationFactory, placementDatesFactory } from '../../testutils/factories'
import { applicationShowPageTab, placementApplicationWithdrawalReasons } from '../../utils/applications/utils'
import { withdrawalMessage } from '../../utils/placementRequests/utils'

jest.mock('../../utils/validation')
jest.mock('../../utils/placementRequests/utils')
jest.mock('../../utils/applications/utils')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
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

      const placementApplicationWithdrawalReasonsReturnValue = 'reasons' as unknown as ReturnType<
        typeof placementApplicationWithdrawalReasons
      >
      ;(
        placementApplicationWithdrawalReasons as jest.MockedFn<typeof placementApplicationWithdrawalReasons>
      ).mockReturnValue(placementApplicationWithdrawalReasonsReturnValue)

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('placement-applications/withdraw/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        placementApplicationId: placementApplication.id,
        applicationId,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        withdrawalReasonsRadioItems: placementApplicationWithdrawalReasonsReturnValue,
        ...errorsAndUserInput.userInput,
      })
      expect(placementApplicationService.getPlacementApplication).toHaveBeenCalledWith(token, placementApplicationId)
      expect(placementApplicationWithdrawalReasons).toHaveBeenCalledWith(request.session.user)
    })
  })

  describe('create', () => {
    it('calls the service method, redirects to the application screen and shows a confirmation message', async () => {
      const placementApplication = placementApplicationFactory.build({
        applicationId,
        placementDates: [placementDatesFactory.build({ duration: 22, expectedArrival: '2024-02-02' })],
      })
      const withdrawalMessageContent = 'some message'
      request.body.applicationId = applicationId
      request.params.id = placementApplicationId
      request.body.reason = 'DuplicatePlacementRequest'

      placementApplicationService.withdraw.mockResolvedValue(placementApplication)
      ;(withdrawalMessage as jest.MockedFn<typeof withdrawalMessage>).mockReturnValue(withdrawalMessageContent)

      const applicationShowPageTabReturnValue = 'some/tabbed/path'
      ;(applicationShowPageTab as jest.MockedFn<typeof applicationShowPageTab>).mockReturnValue(
        applicationShowPageTabReturnValue,
      )

      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(withdrawalMessage).toHaveBeenCalledWith(
        placementApplication.placementDates[0].duration,
        placementApplication.placementDates[0].expectedArrival,
      )
      expect(placementApplicationService.withdraw).toHaveBeenCalledWith(
        token,
        placementApplicationId,
        request.body.reason,
      )
      expect(response.redirect).toHaveBeenCalledWith(applicationShowPageTabReturnValue)
      expect(applicationShowPageTab).toHaveBeenCalledWith(applicationId, 'placementRequests')
      expect(request.flash).toHaveBeenCalledWith('success', withdrawalMessageContent)
    })

    it('shows a fallback confirmation message if the placement application doesnt have placementDates', async () => {
      const placementApplication = placementApplicationFactory.build({ applicationId, placementDates: [] })

      request.body.applicationId = applicationId
      request.params.id = placementApplicationId
      request.body.reason = 'DuplicatePlacementRequest'

      placementApplicationService.withdraw.mockResolvedValue(placementApplication)
      const requestHandler = withdrawalsController.create()
      await requestHandler(request, response, next)

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
