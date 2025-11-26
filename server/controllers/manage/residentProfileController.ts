import type { Request, RequestHandler, Response } from 'express'
import { PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions, canonicalDates, placementKeyDetails } from '../../utils/placements'
import { ResidentProfileTab, residentTabItems, getResidentHeader } from '../../utils/resident'

export default class ResidentProfileController {
  constructor(private readonly placementService: PlacementService) {}

  show(activeTab: ResidentProfileTab = 'personal'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, placementId } = req.params
      const { user } = res.locals
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)
      const { arrivalDate, departureDate } = canonicalDates(placement)
      const pageHeading = 'Manage a resident'

      const placementActions = actions(placement, user)

      const resident = getResidentHeader(placement)

      return res.render(`manage/resident/residentProfile`, {
        contextKeyDetails: placementKeyDetails(placement),
        arrivalDate,
        departureDate,
        crn,
        placement,
        pageHeading,
        user,
        backLink: paths.premises.show({ premisesId: placement.premises.id }),
        tabItems,
        resident,
        actions: placementActions ? placementActions[0].items : [],
        activeTab,
        showTitle: true,
      })
    }
  }
}
