import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { PlacementRequestService, PremisesService } from '../../../services'
import { cas1PremiseCapacityFactory, personFactory, placementRequestDetailFactory } from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'
import {
  filterOutAPTypes,
  occupancySummary,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
} from '../../../utils/match'

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})

  let occupancyViewController: OccupancyViewController

  beforeEach(() => {
    jest.resetAllMocks()
    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)
  })

  describe('view', () => {
    it('should render the occupancy view template', async () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequestDetail = placementRequestDetailFactory.build({ person })
      const bedCount = 30
      const premiseCapacity = cas1PremiseCapacityFactory.build({ premise: { bedCount } })
      const startDate = '2024-07-26'
      const durationDays = '40'
      const premisesName = 'Hope House'
      const premisesId = 'abc123'
      const apType = 'esap'

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
      premisesService.getCapacity.mockResolvedValue(premiseCapacity)

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
        matchingDetailsSummaryList: occupancyViewSummaryListForMatchingDetails(
          premiseCapacity.premise.bedCount,
          placementDates(startDate, durationDays),
          placementRequestDetail,
          filterOutAPTypes(placementRequestDetail.essentialCriteria),
        ),
        occupancySummaryHtml: occupancySummary(premiseCapacity),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })
})
