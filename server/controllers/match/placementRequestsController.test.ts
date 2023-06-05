import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { GroupedPlacementRequests } from '@approved-premises/ui'
import PlacementRequestsController from './placementRequestsController'

import { PlacementApplicationService, PlacementRequestService } from '../../services'
import { personFactory, placementApplicationFactory, placementRequestFactory } from '../../testutils/factories'
import paths from '../../paths/placementApplications'
import { getResponses } from '../../utils/applications/utils'

jest.mock('../../utils/applications/utils')

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const placementApplicationService = createMock<PlacementApplicationService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestsController = new PlacementRequestsController(placementRequestService, placementApplicationService)
  })

  describe('index', () => {
    it('should render the placement requests template', async () => {
      const placementRequests = createMock<GroupedPlacementRequests>()

      placementRequestService.getAll.mockResolvedValue(placementRequests)

      const requestHandler = placementRequestsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/index', {
        pageHeading: 'My Cases',
        placementRequests,
      })
      expect(placementRequestService.getAll).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    it('should render the show template', async () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequest = placementRequestFactory.build({ person })

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequest)

      const requestHandler = placementRequestsController.show()

      await requestHandler({ ...request, params: { id: placementRequest.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/show', {
        pageHeading: 'Matching information for John Wayne',
        placementRequest,
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequest.id)
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
        placementApplicationService.submit.mockResolvedValue(placementApplication)

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
