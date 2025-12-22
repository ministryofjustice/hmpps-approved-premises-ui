import { ApprovedPremisesApplication, Cas1SpaceBooking } from '@approved-premises/api'
import { TabData } from './index'
import { applicationCardList, placementDetailsCards, applicationDocumentAccordion } from './placementUtils'
import { TabControllerParameters } from './TabControllerParameters'

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

