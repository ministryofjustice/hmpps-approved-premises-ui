import type { Request, RequestHandler, Response } from 'express'
import { TabItem } from '@approved-premises/ui'
import { PersonService, PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions, placementKeyDetails } from '../../utils/placements'
import {
  PlacementSubTab,
  ResidentProfileSubTab,
  ResidentProfileTab,
  residentTabItems,
  getResidentHeader,
  tabLabels,
  TabData,
} from '../../utils/resident'

import {
  sentenceLicenceTabController,
  sentenceOffencesTabController,
  sentenceSideNavigation,
} from '../../utils/resident/sentence'
import { riskTabController } from '../../utils/resident/risk'

import { placementPreviousApStaysTabController, placementSideNavigation } from '../../utils/resident/placement'

export default class ResidentProfileController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly personService: PersonService,
  ) {}

  show(activeTab: ResidentProfileTab = 'personal', subTab?: ResidentProfileSubTab): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { crn, placementId },
        user: { token },
      } = req
      const { user } = res.locals
      const includeCancelled = (req.query.includeCancelled as string) === 'true'
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)

      const pageHeading = tabLabels[activeTab].label

      let tabData: TabData = {}
      let sideNavigation: Array<TabItem>
      const placementActions = actions(placement, user)

      if (activeTab === 'sentence') {
        sideNavigation = sentenceSideNavigation(subTab, crn, placementId)

        if (subTab === 'offence') {
          tabData = await sentenceOffencesTabController({ personService: this.personService, crn, token })
        }
        if (subTab === 'licence') {
          tabData = await sentenceLicenceTabController()
        }
      }

      if (activeTab === 'risk') {
        tabData = await riskTabController({ personService: this.personService, crn, token })
      }

      if (activeTab === 'placement') {
        sideNavigation = placementSideNavigation(subTab as PlacementSubTab, crn, placementId)

        if (subTab === 'previous-ap-stays') {
          tabData = await placementPreviousApStaysTabController({
            personService: this.personService,
            token,
            crn,
            placementId,
            includeCancelled,
          })
        }
      }

      return res.render(`manage/resident/residentProfile`, {
        contextKeyDetails: placementKeyDetails(placement),
        crn,
        placement,
        pageHeading,
        user,
        backLink: paths.premises.show({ premisesId: placement.premises.id }),
        tabItems,
        resident: getResidentHeader(placement),
        actions: placementActions ? placementActions[0].items : [],
        activeTab,
        sideNavigation,
        ...tabData,
      })
    }
  }
}
