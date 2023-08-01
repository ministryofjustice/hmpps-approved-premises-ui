import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { ApplicationService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

import paths from '../../../paths/apply'
import WithdrawalsController from './withdrawalsController'

jest.mock('../../../utils/validation')

describe('withdrawalsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})

  let withdrawalsController: WithdrawalsController

  beforeEach(() => {
    withdrawalsController = new WithdrawalsController(applicationService)
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

      expect(response.render).toHaveBeenCalledWith('applications/withdrawals/new', {
        pageHeading: 'Do you want to withdraw this application?',
        applicationId,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    const applicationId = 'some-id'

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
