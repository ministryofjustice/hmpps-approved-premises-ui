import { ApprovedPremisesApplication, Cas1SpaceBooking, Cas1SpaceBookingShortSummary } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { ResidentProfileSubTab, TabData } from './index'
import { applicationCardList, applicationDocumentAccordion } from './placementUtils'
import { TabControllerParameters } from './TabControllerParameters'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'
import { getStatusSpecificFields } from '../placements/allApPlacementsFields'
import paths from '../../paths/manage'

export const placementSideNavigation = (subTab: ResidentProfileSubTab, crn: string, placement: Cas1SpaceBooking) => {
  const basePath = paths.resident.tabPlacement
  const placementId = placement.id
  return [
    {
      text: `${placement.premises.name} placement`,
      href: basePath.placementDetails({ crn, placementId }),
      active: subTab === 'placementDetails',
    },
    {
      text: 'All AP placements',
      href: basePath.allApPlacements({ crn, placementId }),
      active: subTab === 'allApPlacements',
    },
    {
      text: 'Application',
      href: basePath.application({ crn, placementId }),
      active: subTab === 'application',
    },
  ]
}

function arrivalCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  return [
    summaryListItemNoBlankRows(
      'Expected arrival date',
      placement.actualArrivalDate ? undefined : placement.expectedArrivalDate,
      'date',
    ),
    summaryListItemNoBlankRows('Actual arrival date', placement.actualArrivalDate, 'date'),
    summaryListItemNoBlankRows('Arrival time', placement.actualArrivalTime, 'time'),
  ].filter(Boolean)
}

function departureCardRows(placement: Cas1SpaceBooking): Array<SummaryListItem> {
  return [
    summaryListItemNoBlankRows(
      'Expected departure date',
      placement.actualDepartureDate ? undefined : placement.expectedDepartureDate,
      'date',
    ),
    summaryListItemNoBlankRows('Actual departure date', placement.actualDepartureDate, 'date'),
    summaryListItemNoBlankRows('Departure time', placement.actualDepartureTime, 'time'),
    summaryListItemNoBlankRows('Parent departure reason', placement.departure?.parentReason?.name),
    summaryListItemNoBlankRows('Departure reason', placement.departure?.reason?.name),
    summaryListItemNoBlankRows('Move-on category', placement.departure?.moveOnCategory?.name),
    summaryListItemNoBlankRows('Departure notes', placement.departure?.notes),
  ].filter(Boolean)
}

export const placementDetailsCards = (placement: Cas1SpaceBooking): Array<SummaryListWithCard> => {
  const rows = [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date allocated', placement.createdAt, 'date'),
    summaryListItem('Status', placementStatusTag(placement), 'html'),
    ...arrivalCardRows(placement),
    ...departureCardRows(placement),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ]

  return [
    {
      card: { title: { text: placement.premises.name } },
      rows,
    },
  ]
}

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

function allApPlacementsCardRows(placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> {
  return getStatusSpecificFields(placement)
}

export const allApPlacementsTabController = (
  placements: Array<Cas1SpaceBookingShortSummary>,
  personName: string,
): TabData => {
  const cardList = placements.map(placement => ({
    card: {
      title: { text: placement.premises.name },
      status: placementStatusTag(placement),
    },
    rows: allApPlacementsCardRows(placement),
  })) as Array<SummaryListWithCard>

  return {
    subHeading: 'All AP placements',
    subDescription: `View all AP placements for ${personName}`,
    cardList,
  }
}
