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
  offenceLicenceTabController,
  offenceOffencesTabController,
  offencePrisonTabController,
} from '../../utils/resident/offence'
import { offenceSideNavigation } from '../../utils/resident/offenceUtils'
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
import {
  drugAndAlcoholTabController,
  healthTabController,
  mentalHealthTabController,
} from '../../utils/resident/health'
import { healthSideNavigation } from '../../utils/resident/healthUtils'
import { riskSideNavigation } from '../../utils/resident/riskUtils'
import { CrnMismatchError } from '../../utils/errors'
import { getPageBackLink } from '../../utils/backlinks'

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

      if (placement.person.crn !== crn) {
        throw new CrnMismatchError()
      }

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
        case 'health':
          sideNavigation = healthSideNavigation(subTab, crn, placement.id)
          if (subTab === 'healthDetails') tabData = await healthTabController(tabParameters)
          if (subTab === 'mentalHealth') tabData = await mentalHealthTabController(tabParameters)
          if (subTab === 'drugAndAlcohol') tabData = await drugAndAlcoholTabController(tabParameters)
          break
        case 'placement':
          sideNavigation = placementSideNavigation(subTab, crn, placement)
          if (subTab === 'placementDetails') tabData = placementTabController(placement)
          if (subTab === 'application') tabData = await placementApplicationTabController(tabParameters)
          if (subTab === 'allApPlacements') tabData = await allApPlacementsTabController(tabParameters)
          break
        case 'risk':
          sideNavigation = riskSideNavigation(subTab, crn, placement.id)
          tabData = await riskTabController(tabParameters)
          break
        case 'sentence':
          sideNavigation = offenceSideNavigation(subTab, crn, placementId)
          if (subTab === 'offence') tabData = await offenceOffencesTabController(tabParameters)
          if (subTab === 'licence') tabData = await offenceLicenceTabController(tabParameters)
          if (subTab === 'prison') tabData = await offencePrisonTabController(tabParameters)
          break
        default:
      }

      const backLink = getPageBackLink(
        paths.resident.show.pattern,
        req,
        [paths.premises.show.pattern, paths.premises.occupancy.day.pattern],
        paths.premises.show({ premisesId: placement.premises.id }),
      )

      return res.render(`manage/resident/residentProfile`, {
        crn,
        placement,
        pageHeading,
        user,
        backLink,
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
