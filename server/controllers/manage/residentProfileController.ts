import type { Request, RequestHandler, Response } from 'express'
import { TabItem } from '@approved-premises/ui'
import { PersonService, PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions } from '../../utils/placements'
import {
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
  sentencePrisonTabController,
  sentenceSideNavigation,
} from '../../utils/resident/sentence'
import { riskTabController } from '../../utils/resident/risk'
import { personalSideNavigation, personalDetailsTabController } from '../../utils/resident/personal'
import { placementSideNavigation, placementTabController } from '../../utils/resident/placement'

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

      const [placement, personRisks] = await Promise.all([
        this.placementService.getPlacement(token, placementId),
        this.personService.riskProfile(token, crn),
      ])
      const tabItems = residentTabItems(placement, activeTab)

      const pageHeading = tabLabels[activeTab].label

      let tabData: TabData = {}
      let sideNavigation: Array<TabItem>
      const placementActions = actions(placement, user)
      const tabParameters = { personService: this.personService, crn, token, personRisks, placement }

      switch (activeTab) {
        case 'personal':
          sideNavigation = personalSideNavigation(subTab, crn, placement.id)
          if (subTab === 'personalDetails') tabData = await personalDetailsTabController(tabParameters)
          break
        case 'sentence':
          sideNavigation = sentenceSideNavigation(subTab, crn, placementId)
          if (subTab === 'offence') tabData = await sentenceOffencesTabController(tabParameters)
          if (subTab === 'licence') tabData = await sentenceLicenceTabController()
          if (subTab === 'prison') tabData = await sentencePrisonTabController(tabParameters)
          break
        case 'risk':
          tabData = await riskTabController(tabParameters)
          break
        case 'placement':
          tabData = placementTabController(placement)
          sideNavigation = placementSideNavigation(subTab, crn, placement)
          break
        default:
      }

      return res.render(`manage/resident/residentProfile`, {
        crn,
        placement,
        pageHeading,
        user,
        backLink: paths.premises.show({ premisesId: placement.premises.id }),
        tabItems,
        resident: getResidentHeader(placement, personRisks),
        actions: placementActions ? placementActions[0].items : [],
        activeTab,
        sideNavigation,
        ...tabData,
      })
    }
  }
}
