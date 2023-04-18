import type { Request, Response, TypedRequestHandler } from 'express'
import { decodeBedSearchResult, placementDates } from '../../../utils/matchUtils'
import { PlacementRequestService } from '../../../services'

interface ConfirmRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; bedSearchResult: string }
}

export default class BookingsController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  confirm(): TypedRequestHandler<Request, Response> {
    return async (req: ConfirmRequest, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const bedSearchResult = decodeBedSearchResult(req.query.bedSearchResult)

      res.render('match/placementRequests/bookings/confirm', {
        pageHeading: 'Confirm booking',
        person: placementRequest.person,
        bedSearchResult,
        dates: placementDates(req.query.startDate, Number(req.query.durationDays)),
      })
    }
  }
}
