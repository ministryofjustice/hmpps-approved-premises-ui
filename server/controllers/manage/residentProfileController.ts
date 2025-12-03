import type { Request, RequestHandler, Response } from 'express'
import { ActiveOffence, Cas1OASysGroup } from '@approved-premises/api'
import { SummaryListWithCard, TabItem } from '@approved-premises/ui'
import { PersonService, PlacementService } from '../../services'
import paths from '../../paths/manage'

import { actions, placementKeyDetails } from '../../utils/placements'
import {
  PlacementSubTab,
  ResidentProfileTab,
  SentenceSubTab,
  residentTabItems,
  getResidentHeader,
  tabLabels,
} from '../../utils/resident'
import { licenseCards, offencesCards, sentenceSideNavigation } from '../../utils/resident/sentence'
import {
  applicationCards,
  inductionCards,
  placementDetailsCards,
  placementSideNavigation,
  preArrivalCards,
  previousApStaysCards,
  reviewsCards,
} from '../../utils/resident/placement'

export default class ResidentProfileController {
  constructor(
    private readonly placementService: PlacementService,
    private readonly personService: PersonService,
  ) {}

  show(activeTab: ResidentProfileTab = 'personal'): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, placementId, section } = req.params
      const { user } = res.locals
      const includeCancelled = (req.query.includeCancelled as string) === 'true'
      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const tabItems = residentTabItems(placement, activeTab)
      const pageHeading = tabLabels[activeTab].label

      let cardList: Array<SummaryListWithCard>
      let subHeading: string
      let sideNavigation: Array<TabItem>
      let sectionTemplate: string

      if (activeTab === 'sentence') {
        const subTab = section as SentenceSubTab
        sideNavigation = sentenceSideNavigation(subTab, crn, placementId)

        if (subTab === 'offence') {
          const [offences, offenceAnswers]: [Array<ActiveOffence>, Cas1OASysGroup] = await Promise.all([
            this.personService.getOffences(req.user.token, crn),
            this.personService.getOasysAnswers(req.user.token, crn, 'offenceDetails'),
          ])
          subHeading = 'Offence and sentence'
          cardList = offencesCards(offences, offenceAnswers)
          sectionTemplate = 'manage/resident/partials/cardList.njk'
        }
        if (subTab === 'licence') {
          subHeading = 'Licence'
          cardList = licenseCards()
          sectionTemplate = 'manage/resident/partials/cardList.njk'
        }
      }

      if (activeTab === 'placement') {
        const subTab = section as PlacementSubTab
        sideNavigation = placementSideNavigation(subTab, crn, placementId)

        switch (subTab) {
          case 'placement-details':
            subHeading = 'Placement details'
            cardList = placementDetailsCards()
            sectionTemplate = 'manage/resident/partials/cardList.njk'
            break
          case 'application':
            subHeading = 'Application'
            cardList = applicationCards()
            sectionTemplate = 'manage/resident/partials/cardList.njk'
            break
          case 'previous-ap-stays':
            subHeading = 'Previous AP stays'
            {
              const spaceBookings = await this.personService.getSpaceBookings(req.user.token, crn, includeCancelled)
              cardList = previousApStaysCards(spaceBookings)
              sectionTemplate = 'manage/resident/partials/cardList.njk'
            }
            break
          case 'pre-arrival':
            subHeading = 'Pre-arrival'
            cardList = preArrivalCards()
            sectionTemplate = 'manage/resident/partials/cardList.njk'
            break
          case 'induction':
            subHeading = 'Induction'
            cardList = inductionCards()
            sectionTemplate = 'manage/resident/partials/cardList.njk'
            break
          case 'reviews':
            subHeading = 'Reviews'
            cardList = reviewsCards()
            sectionTemplate = 'manage/resident/partials/cardList.njk'
            break
          default:
            break
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
        sectionTemplate,
      })
    }
  }
}
