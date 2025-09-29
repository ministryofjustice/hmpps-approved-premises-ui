import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { ApplicationService, SessionService } from '../../../services'
import {
  addErrorMessageToFlash,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'

import paths from '../../../paths/apply'
import WithdrawalsController from './withdrawalsController'
import { applicationFactory, withdrawableFactory } from '../../../testutils/factories'
import withdrawablesFactory from '../../../testutils/factories/withdrawablesFactory'
import { applicationKeyDetails } from '../../../utils/applications/helpers'

jest.mock('../../../utils/validation')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'
  const applicationId = 'some-id'
  const referrer = 'referrer/path'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const sessionService = createMock<SessionService>()
  sessionService.getPageBackLink.mockReturnValue(referrer)
  const application = applicationFactory.build()

  const defaultRenderParameters = {
    pageHeading: 'What do you want to withdraw?',
    id: applicationId,
    contextKeyDetails: applicationKeyDetails(application),
    backLink: referrer,
  }

  let withdrawalsController: WithdrawalsController

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(applicationService, sessionService)
    applicationService.findApplication.mockResolvedValue(application)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('new', () => {
    describe('if there is a selectedWithdrawableType', () => {
      it('redirects to the withdrawables show page', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const selectedWithdrawableType = 'booking'
        const withdrawable = withdrawableFactory.buildList(1)
        const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })
        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

        const requestHandler = withdrawalsController.new()

        await requestHandler(
          {
            ...request,
            params: { id: applicationId },
            body: { selectedWithdrawableType },
          },
          response,
          next,
        )

        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.redirect).toHaveBeenCalledWith(
          302,
          `${paths.applications.withdrawables.show({ id: applicationId })}?selectedWithdrawableType=${selectedWithdrawableType}`,
        )
      })

      it('uses the selectedWithdrawableType from the query if there isnt one in the body', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const selectedWithdrawableType = 'booking'
        const withdrawable = withdrawableFactory.buildList(1)
        const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

        const requestHandler = withdrawalsController.new()

        await requestHandler(
          {
            ...request,
            params: { id: applicationId },
            body: { selectedWithdrawableType: '' },
            query: { selectedWithdrawableType },
          },
          response,
          next,
        )

        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.redirect).toHaveBeenCalledWith(
          302,
          `${paths.applications.withdrawables.show({ id: applicationId })}?selectedWithdrawableType=${selectedWithdrawableType}`,
        )
      })
    })

    describe('and no selectedWithdrawableType', () => {
      it('renders the select withdrawable view', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const withdrawable = withdrawableFactory.buildList(1)
        const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

        const requestHandler = withdrawalsController.new()
        const thisRequest = { ...request, params: { id: applicationId } }
        await requestHandler(thisRequest, response, next)

        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/new', {
          ...defaultRenderParameters,
          withdrawables: withdrawables.withdrawables,
          notes: withdrawables.notes,
        })
        expect(sessionService.getPageBackLink).toHaveBeenCalledWith('/applications/:id/withdrawals/new', thisRequest, [
          '/admin/placement-requests/:placementRequestId',
          '/applications/:id',
          '/applications',
        ])
      })
    })
  })

  describe('if there are no withdrawables', () => {
    it('renders the withdrawals type template', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      request.params.id = applicationId
      const withdrawables = withdrawablesFactory.build({ withdrawables: [] })
      applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/withdrawables/new', {
        ...defaultRenderParameters,
        withdrawables: withdrawables.withdrawables,
        notes: withdrawables.notes,
      })
    })
  })

  describe('if the selectedWithdrawalType is application', () => {
    it('renders the withdrawals reasons template', async () => {
      const withdrawable = withdrawableFactory.buildList(1)
      const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)
      applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)
      request.params.id = applicationId
      request.body.selectedWithdrawableType = 'application'

      const requestHandler = withdrawalsController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/withdrawals/new', {
        pageHeading: 'Do you want to withdraw this application?',
        applicationId,
        contextKeyDetails: applicationKeyDetails(application),
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    beforeEach(() => {
      request.params.id = applicationId
      request.body.reason = 'other'
      request.body.otherReason = 'Some other reason'
    })

    it('calls the service method, redirects to the index screen and shows a confirmation message', async () => {
      const requestHandler = withdrawalsController.create()

      await requestHandler(request, response, next)

      expect(applicationService.withdraw).toHaveBeenCalledWith(token, applicationId, {
        reason: 'other',
        otherReason: 'Some other reason',
      })
      expect(response.redirect).toHaveBeenCalledWith(paths.applications.index({}))
      expect(request.flash).toHaveBeenCalledWith('success', 'Application withdrawn')
    })

    it('redirects to the "new" method with an error if "other" is the selected reason but no "otherReason" is supplied', async () => {
      const requestHandler = withdrawalsController.create()

      await requestHandler(
        { ...request, params: { id: applicationId }, body: { reason: 'other', otherReason: '' } },
        response,
        next,
      )

      expect(applicationService.withdraw).not.toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(
        `${paths.applications.withdraw.new({ id: request.params.id })}?selectedWithdrawableType=application`,
      )
      expect(addErrorMessageToFlash).toHaveBeenCalledWith(
        {
          ...request,
          body: { otherReason: '', reason: 'other' },
          params: { id: 'some-id' },
          user: { token: 'SOME_TOKEN' },
        },
        'Enter a reason for withdrawing the application',
        'otherReason',
      )
    })

    it('redirects with errors if the API returns an error', async () => {
      const requestHandler = withdrawalsController.create()

      const err = new Error()

      applicationService.withdraw.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.applications.withdraw.new({ id: request.params.id }),
      )
    })
  })
})
