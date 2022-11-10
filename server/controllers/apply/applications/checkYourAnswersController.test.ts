import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { SummaryListItem } from '@approved-premises/ui'

import CheckYourAnswersController from './checkYourAnswersController'
import { ApplicationService } from '../../../services'
import { sections } from '../../../form-pages/apply'

import applicationFactory from '../../../testutils/factories/application'

jest.mock('../../../utils/validation')

describe('checkYourAnswersController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})

  let checkYourAnswersController: CheckYourAnswersController

  beforeEach(() => {
    checkYourAnswersController = new CheckYourAnswersController(applicationService)
  })

  describe('show', () => {
    const application = applicationFactory.build({})
    const summaryListItems = createMock<Record<string, Array<SummaryListItem>>>()

    beforeEach(() => {
      request.params = {
        id: 'some-uuid',
      }

      applicationService.findApplication.mockResolvedValue(application)
      applicationService.getResponsesAsSummaryListItems.mockReturnValue(summaryListItems)
    })

    it('renders the check your answers page with the responses', async () => {
      const requestHandler = checkYourAnswersController.show()

      await requestHandler(request, response, next)

      expect(applicationService.findApplication).toHaveBeenCalledWith(request.user.token, 'some-uuid')
      expect(applicationService.getResponsesAsSummaryListItems).toHaveBeenCalledWith(application)

      expect(response.render).toHaveBeenCalledWith(`applications/check-your-answers`, {
        pageHeading: 'Check your answers',
        sections,
        application,
        summaryListItems,
      })
    })
  })
})
