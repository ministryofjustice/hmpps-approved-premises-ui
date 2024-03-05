import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { PlacementRequestService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/admin'
import WithdrawalsController from './withdrawalsController'
import { ErrorWithData } from '../../../utils/errors'
import { placementRequestDetailFactory } from '../../../testutils/factories'
import { withdrawalMessage } from '../../../utils/placementRequests/utils'
import { placementApplicationWithdrawalReasons } from '../../../utils/applications/utils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/placementRequests/utils')
jest.mock('../../../utils/applications/utils')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = jest.fn()

  const placementRequestService = createMock<PlacementRequestService>({})

  let withdrawalsController: WithdrawalsController

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(placementRequestService)
    request = createMock<Request>({ session: { user: { roles: ['workflow_manager'] } }, user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the template', async () => {
      const applicationId = 'some-id'
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId

      const placementApplicationWithdrawalReasonsReturnValue = 'reasons' as unknown as ReturnType<
        typeof placementApplicationWithdrawalReasons
      >
      ;(
        placementApplicationWithdrawalReasons as jest.MockedFn<typeof placementApplicationWithdrawalReasons>
      ).mockReturnValue(placementApplicationWithdrawalReasonsReturnValue)

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        id: request.params.id,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        withdrawalReasonsRadioItems: placementApplicationWithdrawalReasonsReturnValue,
      })
      expect(placementApplicationWithdrawalReasons).toHaveBeenCalledWith(request.session.user.roles)
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'
    const placementRequestDetail = placementRequestDetailFactory.build({
      applicationId,
      withdrawalReason: 'AlternativeProvisionIdentified',
      duration: 22,
      expectedArrival: '2024-01-01',
    })

    beforeEach(() => {
      request.params.id = applicationId
      request.body = {
        reason: placementRequestDetail.withdrawalReason,
      }
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      const withdrawalMessageContent = 'some message'
      const requestHandler = withdrawalsController.create()

      ;(withdrawalMessage as jest.MockedFn<typeof withdrawalMessage>).mockReturnValue(withdrawalMessageContent)
      placementRequestService.withdraw.mockResolvedValue(placementRequestDetail)

      await requestHandler(request, response, next)

      expect(placementRequestService.withdraw).toHaveBeenCalledWith(
        token,
        applicationId,
        placementRequestDetail.withdrawalReason,
      )
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.placementRequests.index({}))
      expect(request.flash).toHaveBeenCalledWith('success', withdrawalMessageContent)
      expect(withdrawalMessage).toHaveBeenCalledWith(
        placementRequestDetail.duration,
        placementRequestDetail.expectedArrival,
      )
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

      await requestHandler(
        { ...request, body: { ...request.body, reason: undefined }, params: { id: applicationId } },
        response,
        next,
      )

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
