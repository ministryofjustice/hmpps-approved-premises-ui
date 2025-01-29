import { type Request, RequestHandler, type Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { fetchErrorsAndUserInput } from '../../../../utils/validation'
import { occupancySummary } from '../../../../utils/match'
import paths from '../../../../paths/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'

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
      const capacity = await this.premisesService.getCapacity(
        token,
        premisesId,
        placement.expectedArrivalDate,
        placement.expectedDepartureDate,
      )
      const placeholderDetailsUrl = paths.v2Match.placementRequests.search.dayOccupancy({
        id: placement.requestForPlacementId,
        premisesId,
        date: ':date',
      })

      const bookingCriteria: Array<Cas1SpaceBookingCharacteristic> = []

      return res.render('manage/premises/placements/changes', {
        pageHeading: 'Change placement dates',
        placement,
        summary: occupancySummary(capacity.capacity, bookingCriteria),
        calendar: occupancyCalendar(capacity.capacity, placeholderDetailsUrl, bookingCriteria),
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}
