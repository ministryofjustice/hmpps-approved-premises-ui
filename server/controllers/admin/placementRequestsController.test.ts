import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import PlacementRequestsController from './placementRequestsController'

import { PlacementRequestService } from '../../services'
import { placementRequestFactory } from '../../testutils/factories'

jest.mock('../../utils/applications/utils')
jest.mock('../../utils/applications/getResponses')

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
      const placementRequests = placementRequestFactory.buildList(2)
      placementRequestService.getDashboard.mockResolvedValue(placementRequests)

      const requestHandler = placementRequestsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('admin/placementRequests/index', {
        pageHeading: 'Placement requests',
        placementRequests,
      })
      expect(placementRequestService.getDashboard).toHaveBeenCalledWith(token)
    })
  })
})
