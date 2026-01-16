import type { Request, RequestHandler, Response } from 'express'
import { TabItem } from '@approved-premises/ui'
import { Cas1SpaceBooking, PersonRisks } from '@approved-premises/api'
import { ApplicationService, PersonService, PlacementService } from '../../services'
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
} from '../../utils/resident/sentence'
import { sentenceSideNavigation } from '../../utils/resident/sentenceUtils'
import { riskTabController } from '../../utils/resident/risk'
import { personalSideNavigation } from '../../utils/resident/personalUtils'
import { contactsTabController, personalDetailsTabController } from '../../utils/resident/personal'
import {
  placementSideNavigation,
  placementTabController,
  placementApplicationTabController,
  allApPlacementsTabController,
} from '../../utils/resident/placement'
import { settlePromises } from '../../utils/utils'

export default class ResidentProfileController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly personService: PersonService,
    private readonly applicationService: ApplicationService,
  ) {}

  show(activeTab: ResidentProfileTab = 'personal', subTab?: ResidentProfileSubTab): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { crn, placementId },
        user: { token },
      } = req

      const { user } = res.locals

      const defaultRisks: PersonRisks = {
        crn,
        roshRisks: { status: 'error' },
        mappa: { status: 'error' },
        flags: { status: 'error' },
        tier: { status: 'error' },
      }

      const [placement, personRisks] = await settlePromises<[Cas1SpaceBooking, PersonRisks]>(
        [this.placementService.getPlacement(token, placementId), this.personService.riskProfile(token, crn)],
        [undefined, defaultRisks],
      )

      const tabItems = residentTabItems(placement, activeTab)

      const pageHeading = tabLabels[activeTab].label

      let tabData: TabData = {}
      let sideNavigation: Array<TabItem>
      const placementActions = actions(placement, user)
      const tabParameters = {
        applicationService: this.applicationService,
        personService: this.personService,
        crn,
        token,
        personRisks,
        placement,
      }

      switch (activeTab) {
        case 'personal':
          sideNavigation = personalSideNavigation(subTab, crn, placement.id)
          if (subTab === 'personalDetails') tabData = await personalDetailsTabController(tabParameters)
          if (subTab === 'contacts') tabData = await contactsTabController(tabParameters)
          break
        case 'placement':
          sideNavigation = placementSideNavigation(subTab, crn, placement)
          if (subTab === 'placementDetails') tabData = placementTabController(placement)
          if (subTab === 'application') tabData = await placementApplicationTabController(tabParameters)
          if (subTab === 'allApPlacements') tabData = await allApPlacementsTabController(tabParameters)
          break
        case 'risk':
          tabData = await riskTabController(tabParameters)
          break
        case 'sentence':
          sideNavigation = sentenceSideNavigation(subTab, crn, placementId)
          if (subTab === 'offence') tabData = await sentenceOffencesTabController(tabParameters)
          if (subTab === 'licence') tabData = await sentenceLicenceTabController(tabParameters)
          if (subTab === 'prison') tabData = await sentencePrisonTabController(tabParameters)
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
