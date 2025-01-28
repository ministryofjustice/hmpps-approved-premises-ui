import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { PlacementService, PremisesService } from '../../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../testutils/factories'
import ChangesController from './changesController'
import { occupancySummary } from '../../../../utils/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import paths from '../../../../paths/match'

describe('changesController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const premisesService = createMock<PremisesService>()
  const changesController = new ChangesController(placementService, premisesService)

  const premises = cas1PremisesFactory.build()
  const placement = cas1SpaceBookingFactory.upcoming().build({ premises })
  const capacity = cas1PremiseCapacityFactory.build()

  beforeEach(() => {
    jest.clearAllMocks()

    placementService.getPlacement.mockResolvedValue(placement)
    premisesService.getCapacity.mockResolvedValue(capacity)
    request = createMock<Request>({
      user: { token },
      params: { premisesId: premises.id, placementId: placement.id },
      flash: jest.fn(),
    })
  })

  it('renders the change placement screen with current booking setup', async () => {
    const requestHandler = changesController.new()
    await requestHandler(request, response, next)

    const placeholderDetailsUrl = paths.v2Match.placementRequests.search.dayOccupancy({
      id: placement.requestForPlacementId,
      premisesId: premises.id,
      date: ':date',
    })

    expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
    expect(premisesService.getCapacity).toHaveBeenCalledWith(
      token,
      premises.id,
      placement.expectedArrivalDate,
      placement.expectedDepartureDate,
    )
    expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes', {
      pageHeading: 'Change placement dates',
      placement,
      summary: occupancySummary(capacity.capacity, []),
      calendar: occupancyCalendar(capacity.capacity, placeholderDetailsUrl, []),
      errorSummary: [],
      errors: {},
    })
  })
})
