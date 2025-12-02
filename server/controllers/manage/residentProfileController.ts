import type { Request, RequestHandler, Response } from 'express'
import { Cas1SpaceBooking } from '@approved-premises/api'
import { PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions, placementKeyDetails } from '../../utils/placements'
import {
  PlacementSidebarSection,
  ResidentProfileTab,
  placementSidebarItems,
  placementSidebarLabels,
  getResidentHeader,
  residentTabItems,
  renderPlacementSection,
} from '../../utils/resident'

const getPlacementTabOptions = (
  placement: Cas1SpaceBooking,
  section: PlacementSidebarSection,
): Record<string, unknown> => {
  return {
    sidebarItems: placementSidebarItems(placement, section),
    activeSection: section,
    sectionHeading: placementSidebarLabels[section],
    sectionContent: renderPlacementSection(section),
  }
}

export default class ResidentProfileController {
  constructor(private readonly placementService: PlacementService) {}

  show(activeTab: ResidentProfileTab = 'personal'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, placementId, section } = req.params
      const { user } = res.locals
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)
      const pageHeading = 'Manage a resident'

      const placementActions = actions(placement, user)

      const resident = getResidentHeader(placement)

      const renderOptions: Record<string, unknown> = {
        contextKeyDetails: placementKeyDetails(placement),
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
      }

      if (activeTab === 'placement') {
        const activeSection = (section as PlacementSidebarSection) || 'placement-details'
        Object.assign(renderOptions, getPlacementTabOptions(placement, activeSection))
      }

      return res.render(`manage/resident/tabs/${activeTab}`, renderOptions)
    }
  }
}
