import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PlacementRequestService } from '../../../services'
import { personFactory, placementRequestDetailFactory } from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})

  let occupancyViewController: OccupancyViewController

  beforeEach(() => {
    jest.resetAllMocks()
    occupancyViewController = new OccupancyViewController(placementRequestService)
  })

  describe('view', () => {
    it('should render the occupancy view template', async () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequestDetail = placementRequestDetailFactory.build({ person })
      const startDate = '2024-07-26'
      const durationDays = '40'
      const premisesName = 'Hope House'
      const premisesId = 'abc123'
      const apType = 'esap'

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)

      const query = {
        startDate,
        durationDays,
        premisesName,
        premisesId,
        apType,
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest: placementRequestDetail,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })
})
