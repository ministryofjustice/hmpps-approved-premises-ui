import type { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
import { PlacementRequestService, PremisesService } from '../../../services'
import { filterOutAPTypes, occupancyViewSummaryListForMatchingDetails, placementDates } from '../../../utils/match'

interface NewRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; premisesName: string; premisesId: string; apType: ApType }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  view(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const { startDate, durationDays, premisesName, premisesId, apType } = req.query
      const dates = placementDates(startDate, durationDays)
      const [placementRequest, capacity] = await Promise.all([
        this.placementRequestService.getPlacementRequest(req.user.token, req.params.id),
        this.premisesService.getCapacity(req.user.token, premisesId, dates.startDate, dates.endDate),
      ])
      const essentialCharacteristics = filterOutAPTypes(placementRequest.essentialCriteria)
      const matchingDetailsSummaryList = occupancyViewSummaryListForMatchingDetails(
        capacity.premise.bedCount,
        dates,
        placementRequest,
        essentialCharacteristics,
      )
      res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
        matchingDetailsSummaryList,
      })
    }
  }
}
