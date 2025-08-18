import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { ApplicationService, PlacementApplicationService, PlacementRequestService } from '../../services'
import {
  apAreaFactory,
  applicationFactory,
  placementApplicationFactory,
  cas1PlacementRequestDetailFactory,
} from '../../testutils/factories'
import paths from '../../paths/placementApplications'

import { getResponses } from '../../utils/applications/getResponses'
import { placementRequestKeyDetails } from '../../utils/placementRequests/utils'

jest.mock('../../utils/applications/utils')
jest.mock('../../utils/applications/getResponses')
jest.mock('../../utils/getPaginationDetails')
jest.mock('../../config')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'
  const userId = 'user-id'

  const request: DeepMocked<Request> = createMock<Request>({
    user: { token },
  })
  const response: DeepMocked<Response> = createMock<Response>({
    locals: { user: { apArea: apAreaFactory.build(), id: userId } },
  })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const placementApplicationService = createMock<PlacementApplicationService>({})
  const applicationService = createMock<ApplicationService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    placementRequestsController = new PlacementRequestsController(
      placementRequestService,
      placementApplicationService,
      applicationService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show template', async () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)

      const requestHandler = placementRequestsController.show()

      await requestHandler({ ...request, params: { placementRequestId: placementRequestDetail.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/show', {
        pageHeading: 'Matching information',
        placementRequest: placementRequestDetail,
        contextKeyDetails: placementRequestKeyDetails(placementRequestDetail),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })

  describe('create', () => {
    it('should POST to the client and redirect to the first page of the form flow', async () => {
      const applicationId = '123'
      const placementApplication = placementApplicationFactory.build()
      placementApplicationService.create.mockResolvedValue(placementApplication)

      const requestHandler = placementRequestsController.create()

      await requestHandler({ ...request, body: { applicationId } }, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.placementApplications.pages.show({
          id: placementApplication.id,
          task: 'request-a-placement',
          page: 'reason-for-placement',
        }),
      )
      expect(placementApplicationService.create).toHaveBeenCalledWith(token, applicationId)
    })
  })

  describe('submit', () => {
    describe('when confirmation is "1"', () => {
      it('should POST to the service and redirect to the confirmation page', async () => {
        const placementApplication = placementApplicationFactory.build()
        const application = applicationFactory.build()
        placementApplicationService.submit.mockResolvedValue(placementApplication)
        applicationService.findApplication.mockResolvedValue(application)

        const requestHandler = placementRequestsController.submit()

        await requestHandler(
          { ...request, body: { confirmation: '1' }, params: { id: placementApplication.id } },
          response,
          next,
        )

        expect(getResponses).toHaveBeenCalledWith(placementApplication)
        expect(response.render).toHaveBeenCalledWith('placement-applications/confirm', {
          pageHeading: 'Request for placement confirmed',
        })
        expect(placementApplicationService.submit).toHaveBeenCalledWith(token, placementApplication.id, application)
      })
    })

    describe('when confirmation is not "1"', () => {
      it('should POST to the service and redirect to the confirmation page', async () => {
        const placementApplication = placementApplicationFactory.build()
        placementApplicationService.submit.mockResolvedValue(placementApplication)
        const flash = jest.fn()
        const requestHandler = placementRequestsController.submit()

        await requestHandler({ ...request, body: {}, params: { id: placementApplication.id }, flash }, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.placementApplications.pages.show({
            id: placementApplication.id,
            task: 'request-a-placement',
            page: 'check-your-answers',
          }),
        )
        expect(flash).toHaveBeenCalledWith('errors', {
          confirmation: {
            attributes: { 'data-cy-error-confirmation': true },
            text: 'You must confirm that the information you have provided is correct',
          },
        })
      })
    })
  })
})
