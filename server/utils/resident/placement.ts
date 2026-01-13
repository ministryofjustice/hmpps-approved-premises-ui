import { ApprovedPremisesApplication, Cas1SpaceBooking } from '@approved-premises/api'
import { TabData } from './index'
import {
  applicationCardList,
  applicationDocumentAccordion,
  placementDetailsCards,
  allApPlacementsTabData,
} from './placementUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { sortSpaceBookingsByCanonicalArrivalDate } from '../placements'

export { placementSideNavigation } from './placementUtils'

export const placementTabController = (placement: Cas1SpaceBooking): TabData => {
  return {
    subHeading: `${placement.premises.name} AP placement`,
    cardList: placementDetailsCards(placement),
  }
}

export const placementApplicationTabController = async ({
  applicationService,
  token,
  placement,
}: TabControllerParameters): Promise<TabData> => {
  const [application]: [ApprovedPremisesApplication] = await Promise.all([
    applicationService.findApplication(token, placement.applicationId),
  ])

  return {
    cardList: applicationCardList(application),
    subHeading: 'Application',
    accordion: applicationDocumentAccordion(application),
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
