import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { GroupedPlacementRequests } from '@approved-premises/ui'
import PlacementRequestsController from './placementRequestsController'

import { PlacementApplicationService, PlacementRequestService } from '../../services'
import { personFactory, placementApplicationFactory, placementRequestFactory } from '../../testutils/factories'
import paths from '../../paths/placementApplications'

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
})
