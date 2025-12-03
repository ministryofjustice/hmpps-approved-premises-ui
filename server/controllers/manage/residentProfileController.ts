import type { Request, RequestHandler, Response } from 'express'
import { ActiveOffence, Cas1OASysGroup } from '@approved-premises/api'
import { SummaryListWithCard, TabItem } from '@approved-premises/ui'
import { PersonService, PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions, placementKeyDetails } from '../../utils/placements'
import {
  ResidentProfileSubTab,
  ResidentProfileTab,
  residentTabItems,
  getResidentHeader,
  tabLabels,
} from '../../utils/resident'
import { licenseCards, offencesCards, sentenceSideNavigation } from '../../utils/resident/sentence'

export default class ResidentProfileController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly personService: PersonService,
  ) {}

  show(activeTab: ResidentProfileTab = 'personal', subTab?: ResidentProfileSubTab): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, placementId } = req.params
      const { user } = res.locals
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)
      const pageHeading = tabLabels[activeTab].label

      let cardList: Array<SummaryListWithCard>
      let subHeading: string
      let sideNavigation: Array<TabItem>

      if (['sentence'].includes(activeTab)) {
        sideNavigation = sentenceSideNavigation(subTab, crn, placementId)

        if (subTab === 'offence') {
          const [offences, offenceAnswers]: [Array<ActiveOffence>, Cas1OASysGroup] = await Promise.all([
            this.personService.getOffences(req.user.token, crn),
            this.personService.getOasysAnswers(req.user.token, crn, 'offenceDetails'),
          ])
          subHeading = 'Offence and sentence'
          cardList = offencesCards(offences, offenceAnswers)
        }
        if (subTab === 'licence') {
          subHeading = 'Licence'
          cardList = licenseCards()
        }
      }

      const placementActions = actions(placement, user)

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
        cardList,
        subHeading,
        sideNavigation,
      })
    }
  }
}
