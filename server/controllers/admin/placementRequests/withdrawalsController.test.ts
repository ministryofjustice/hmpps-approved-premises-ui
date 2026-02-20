import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import { PlacementRequestService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/admin'
import applyPaths from '../../../paths/apply'
import WithdrawalsController from './withdrawalsController'
import { ErrorWithData } from '../../../utils/errors'
import { cas1PlacementRequestDetailFactory } from '../../../testutils/factories'
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
  const flash = jest.fn()

  const placementRequestService = createMock<PlacementRequestService>({})

  let withdrawalsController: WithdrawalsController

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(placementRequestService)
    request = createMock<Request>({
      session: { user: { permissions: ['cas1_view_cru_dashboard'] } },
      user: { token },
      flash,
    })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    const placementApplicationId = 'some-id'
    const errorsAndUserInput = createMock<ErrorsAndUserInput>()
    const applicationId = 'some-other-id'

    const placementApplicationWithdrawalReasonsReturnValue = 'reasons' as unknown as ReturnType<
      typeof placementApplicationWithdrawalReasons
    >

    beforeEach(() => {
      ;(
        placementApplicationWithdrawalReasons as jest.MockedFn<typeof placementApplicationWithdrawalReasons>
      ).mockReturnValue(placementApplicationWithdrawalReasonsReturnValue)
      request.params.placementRequestId = placementApplicationId
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
    })

    it('renders the template', async () => {
      when(flash).calledWith('applicationId').mockReturnValue([applicationId])

      await withdrawalsController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        placementRequestId: request.params.placementRequestId,
        errors: errorsAndUserInput.errors,
        applicationId,
        errorSummary: errorsAndUserInput.errorSummary,
        withdrawalReasonsRadioItems: placementApplicationWithdrawalReasonsReturnValue,
      })
      expect(placementApplicationWithdrawalReasons).toHaveBeenCalledWith(request.session.user)
      expect(flash).toHaveBeenCalledWith('applicationId')
    })

    it('populates the applicationID with an empty string if the flash is empty', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      when(flash).calledWith('applicationId').mockReturnValue(undefined)

      await withdrawalsController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/withdrawals/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        placementRequestId: request.params.placementRequestId,
        errors: errorsAndUserInput.errors,
        applicationId: '',
        errorSummary: errorsAndUserInput.errorSummary,
        withdrawalReasonsRadioItems: placementApplicationWithdrawalReasonsReturnValue,
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'
    const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
      applicationId,
      withdrawalReason: 'AlternativeProvisionIdentified',
      duration: 22,
      expectedArrival: '2024-01-01',
    })

    beforeEach(() => {
      request.params.placementRequestId = applicationId
      request.body = {
        reason: placementRequestDetail.withdrawalReason,
      }
    })

    it('calls the service method, redirects to the CRU dashboard and shows a confirmation message', async () => {
      const withdrawalMessageContent = 'some message'

      ;(withdrawalMessage as jest.MockedFn<typeof withdrawalMessage>).mockReturnValue(withdrawalMessageContent)
      placementRequestService.withdraw.mockResolvedValue(placementRequestDetail)

      await withdrawalsController.create()(request, response, next)

      expect(placementRequestService.withdraw).toHaveBeenCalledWith(
        token,
        applicationId,
        placementRequestDetail.withdrawalReason,
      )
      expect(response.redirect).toHaveBeenCalledWith(paths.admin.cruDashboard.index({}))
      expect(request.flash).toHaveBeenCalledWith('success', withdrawalMessageContent)
      expect(withdrawalMessage).toHaveBeenCalledWith(
        placementRequestDetail.authorisedPlacementPeriod.duration,
        placementRequestDetail.authorisedPlacementPeriod.arrival,
      )
    })

    it('redirects with errors if the API returns an error', async () => {
      const err = new Error()

      placementRequestService.withdraw.mockImplementation(() => {
        throw err
      })

      await withdrawalsController.create()(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.admin.placementRequests.withdrawal.new({ placementRequestId: request.params.placementRequestId }),
      )
    })

    it('redirects with errors if reason is blank', async () => {
      const indexRequest = {
        ...request,
        body: { ...request.body, reason: undefined },
        params: { placementRequestId: applicationId },
      }

      await withdrawalsController.create()(indexRequest, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        indexRequest,
        response,
        new ErrorWithData({}),
        paths.admin.placementRequests.withdrawal.new({ placementRequestId: request.params.placementRequestId }),
      )

      const errorData = (catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        'invalid-params': [{ propertyName: `$.reason`, errorType: 'empty' }],
      })
    })

    describe('when the user does not have view CRU dashboard permissions', () => {
      beforeEach(() => {
        request.session.user.permissions = []
      })

      it('redirects to the applications dashboard', async () => {
        placementRequestService.withdraw.mockResolvedValue(placementRequestDetail)

        await withdrawalsController.create()(request, response, next)

        expect(placementRequestService.withdraw).toHaveBeenCalledWith(
          token,
          applicationId,
          placementRequestDetail.withdrawalReason,
        )
        expect(response.redirect).toHaveBeenCalledWith(applyPaths.applications.index({}))
      })
    })
  })
})
