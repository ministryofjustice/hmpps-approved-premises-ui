import { Cas1Assessment, Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { TabData } from './index'
import {
  applicationCardList,
  applicationDocumentAccordion,
  assessmentCard,
  placementDetailsCards,
  allApPlacementsTabData,
} from './placementUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { sortSpaceBookingsByCanonicalArrivalDate } from '../placements'
import { settlePromises } from '../utils'

export { placementSideNavigation } from './placementUtils'

export const placementTabController = (placement: Cas1SpaceBooking): TabData => {
  return {
    subHeading: `${placement.premises.name} AP placement`,
    cardList: placementDetailsCards(placement),
  }
}

export const placementApplicationTabController = async ({
  applicationService,
  assessmentService,
  token,
  placement,
}: TabControllerParameters): Promise<TabData & { bottomCardList?: Array<SummaryListWithCard> }> => {
  const applicationPromise = applicationService.findApplication(token, placement.applicationId)
  const bottomCardListPromise = (async (): Promise<Array<SummaryListWithCard>> => {
    if (!placement.assessmentId) return []

    const [assessment] = await settlePromises<[Cas1Assessment]>([
      assessmentService.findAssessment(token, placement.assessmentId),
    ])

    return assessment ? [assessmentCard(assessment)] : []
  })()

  const [application, bottomCardList] = await Promise.all([applicationPromise, bottomCardListPromise])

  return {
    cardList: applicationCardList(application),
    subHeading: 'Application and assessment',
    accordion: applicationDocumentAccordion(application),
    ...(bottomCardList.length && { bottomCardList }),
  }
}

export const allApPlacementsTabController = async ({
  personService,
  token,
  crn,
}: TabControllerParameters): Promise<TabData> => {
  const allPlacements = await personService.getSpaceBookings(token, crn)
  const sortedPlacements = sortSpaceBookingsByCanonicalArrivalDate(allPlacements)

  return {
    subHeading: 'All AP placements',
    cardList: allApPlacementsTabData(sortedPlacements),
  }
}
