import type { Request, RequestHandler, Response } from 'express'

import { PremisesService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

export default class PlacementController {
  constructor(private readonly premisesService: PremisesService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const referrer = req.headers.referer
      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })
      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      const pageHeading = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`
      return res.render(`manage/premises/placements/show`, { premises, placement, pageHeading, referrer })
    }
  }
}
