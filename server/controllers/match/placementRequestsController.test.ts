import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { GroupedPlacementRequests } from '@approved-premises/ui'
import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService } from '../../services'

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
})
