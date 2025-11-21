import type { Request, RequestHandler, Response } from 'express'
import { PlacementService, SessionService } from '../../services'
import paths from '../../paths/manage'

import { canonicalDates, placementKeyDetails } from '../../utils/placements'
import { ResidentProfileTab, residentTabItems } from '../../utils/resident'

export default class ResidentProfileController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly sessionService: SessionService,
  ) {}

  show(activeTab: ResidentProfileTab = 'personal'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, placementId } = req.params
      const { user } = res.locals
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)
      const backLink = this.sessionService.getPageBackLink(paths.premises.placements.show.pattern, req, [
        paths.premises.show.pattern,
        paths.premises.occupancy.day.pattern,
      ])
      const { arrivalDate, departureDate } = canonicalDates(placement)
      const pageHeading = 'Manage a resident'

      return res.render(`manage/resident/residentProfile`, {
        contextKeyDetails: placementKeyDetails(placement),
        arrivalDate,
        departureDate,
        crn,
        placement,
        pageHeading,
        user,
        backLink,
        tabItems,
        activeTab,
        showTitle: true,
      })
    }
  }
}
