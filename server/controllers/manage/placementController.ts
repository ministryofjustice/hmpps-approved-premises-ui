import type { Request, RequestHandler, Response } from 'express'
import { PremisesService } from '../../services'

import { DateFormats } from '../../utils/dateUtils'
import { getBackLink } from '../../utils/placements'

export default class PlacementController {
  constructor(private readonly premisesService: PremisesService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const referrer = req.headers.referer
      const { user } = res.locals

      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

      const backLink = getBackLink(req.headers.referer, premisesId)
      const pageHeading = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`

      return res.render(`manage/premises/placements/show`, { placement, pageHeading, referrer, user, backLink })
    }
  }
}
