import type { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
import { PlacementRequestService } from '../../../services'

interface NewRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; premisesName: string; premisesId: string; apType: ApType }
}

export default class {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  view(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const { startDate, durationDays, premisesName, premisesId, apType } = req.query

      res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
      })
    }
  }
}
