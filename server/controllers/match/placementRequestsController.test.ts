import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { GroupedPlacementRequests } from '@approved-premises/ui'
import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService } from '../../services'
import { personFactory, placementRequestFactory } from '../../testutils/factories'

describe('PlacementRequestsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})

  let placementRequestsController: PlacementRequestsController

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestsController = new PlacementRequestsController(placementRequestService)
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
})
