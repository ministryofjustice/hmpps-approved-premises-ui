import { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'

import AppealService from '../../services/appealService'
import AppealsController from './appealsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { AppealDecision } from '../../@types/shared'
import { ApplicationService } from '../../services'
import { applicationFactory } from '../../testutils/factories'

jest.mock('../../utils/validation')

describe('AppealsController', () => {
  const token = 'SOME_TOKEN'
  const application = applicationFactory.build()

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const appealService = createMock<AppealService>({})
  const applicationService = createMock<ApplicationService>({})
  const appealsController = new AppealsController(appealService, applicationService)

  beforeEach(() => {
    jest.resetAllMocks()
    ;(applicationService.findApplication as jest.Mock).mockResolvedValue(application)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const requestHandler = appealsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = {
        id: 'applicationId',
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/appeals/new', {
        applicationId: 'applicationId',
        application,
        pageHeading: 'Approved Premises Application',
        errors: {},
        errorSummary: [],
      })
      expect(applicationService.findApplication).toHaveBeenCalledWith(token, request.params.id)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const requestHandler = appealsController.new()

      request.params = {
        id: 'applicationId',
      }

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/appeals/new', {
        applicationId: 'applicationId',
        application,
        pageHeading: 'Approved Premises Application',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it.each([
      ['accepted', 'Assessment reopened'],
      ['rejected', 'Appeal marked as rejected'],
    ])(
      'creates an appeal and redirects back to the application page',
      async (decision: AppealDecision, flashMessage: string) => {
        const requestHandler = appealsController.create()

        const req = createMock<Request>({
          user: { token },
          params: { id: 'applicationId' },
          body: {
            'appealDate-year': 2022,
            'appealDate-month': 12,
            'appealDate-day': 11,
            appeal: {
              appealDetail: 'detail',
              reviewer: 'reviewer',
              decisionDetail: 'decisionDetail',
              decision,
            },
          },
        })

        await requestHandler(req, response, next)

        const expectedAppeal = {
          ...req.body.appeal,
          appealDate: '2022-12-11',
        }

        expect(response.redirect).toHaveBeenCalledWith(paths.applications.show({ id: req.params.id }))

        expect(req.flash).toHaveBeenCalledWith('success', flashMessage)
        expect(appealService.createAppeal).toHaveBeenCalledWith(token, req.params.id, expectedAppeal)
      },
    )

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = appealsController.create()

      request.params = {
        id: 'applicationId',
      }

      request.body = {
        appeal: {},
      }

      const err = new Error()

      appealService.createAppeal.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.applications.appeals.new({ id: request.params.id }),
      )
    })
  })
})
