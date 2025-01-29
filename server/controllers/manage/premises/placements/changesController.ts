import { type Request, RequestHandler, type Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { fetchErrorsAndUserInput } from '../../../../utils/validation'
import { occupancySummary } from '../../../../utils/match'
import paths from '../../../../paths/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'

export default class ChangesController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placement = await this.placementService.getPlacement(token, placementId)
      const capacity = await this.premisesService.getCapacity(token, premisesId, {
        startDate: placement.expectedArrivalDate,
        endDate: placement.expectedDepartureDate,
        excludeSpaceBookingId: placement.id,
      })
      const placeholderDetailsUrl = paths.v2Match.placementRequests.search.dayOccupancy({
        id: placement.requestForPlacementId,
        premisesId,
        date: ':date',
      })

      const bookingCriteria: Array<Cas1SpaceBookingCharacteristic> = filterRoomLevelCriteria(
        placement.requirements.essentialCharacteristics,
      )

      return res.render('manage/premises/placements/changes', {
        pageHeading: 'Change placement dates',
        placement,
        placementSummary: placementOverviewSummary(placement),
        summary: occupancySummary(capacity.capacity, bookingCriteria),
        calendar: occupancyCalendar(capacity.capacity, placeholderDetailsUrl, bookingCriteria),
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}
