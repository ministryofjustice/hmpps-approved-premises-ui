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
  sentenceSideNavigation,
} from '../../utils/resident/sentence'
import { riskTabController } from '../../utils/resident/risk'

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
        tabData = await riskTabController({ personService: this.personService, crn, token, personRisks })
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
