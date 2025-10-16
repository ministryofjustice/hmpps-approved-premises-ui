import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { ApplicationService, SessionService } from '../../../services'
import * as validationUtils from '../../../utils/validation'

import { applicationFactory } from '../../../testutils/factories'
import { applicationKeyDetails } from '../../../utils/applications/helpers'
import ExpiryController from './expiryController'
import { getApplicationSummary } from '../../../utils/applications/utils'
import paths from '../../../paths/apply'

describe('expiryController', () => {
  const token = 'SOME_TOKEN'
  const applicationId = 'some-id'
  const referrer = 'referrer/path'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const sessionService = createMock<SessionService>()
  const application = applicationFactory.build()

  const defaultRenderParameters = {
    pageHeading: 'Expire application',
    applicationId,
    contextKeyDetails: applicationKeyDetails(application),
    backLink: referrer,
    summaryRows: getApplicationSummary(application),
  }

  let expiryController: ExpiryController

  beforeEach(() => {
    jest.resetAllMocks()
    expiryController = new ExpiryController(applicationService, sessionService)
    applicationService.findApplication.mockResolvedValue(application)
    sessionService.getPageBackLink.mockReturnValue(referrer)
    request = createMock<Request>({ user: { token }, params: { id: applicationId } })
    response = createMock<Response>({})
  })

  describe('new', () => {
    it('renders the expiry page', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)

      await expiryController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/expiry/new', {
        ...defaultRenderParameters,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
      })
    })
  })

  describe('create', () => {
    it('redirects back to get if no reason supplied', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)

      await expiryController.create()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.applications.expire({ id: applicationId }))
    })

    it('expires the application', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)
      request.body = { reason: 'some reason' }

      await expiryController.create()(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', 'Application marked as expired')
      expect(applicationService.expire).toHaveBeenCalledWith(token, applicationId, request.body)
      expect(response.redirect).toHaveBeenCalledWith(referrer)
    })
  })
})
