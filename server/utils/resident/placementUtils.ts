import { ApprovedPremisesApplication, Cas1SpaceBooking } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { Accordion, alertBanner, card, renderCardList, renderPersonDetails, ResidentProfileSubTab } from './index'
import { SubmittedDocumentRenderer } from '../forms/submittedDocumentRenderer'
import paths from '../../paths/manage'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'
import { insetText } from './riskUtils'
import { DateFormats } from '../dateUtils'

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

export const applicationDocumentAccordion = (application: ApprovedPremisesApplication): Accordion => {
  const sections = new SubmittedDocumentRenderer(application).response

  const personDetails = { heading: { text: 'Person details' }, content: { html: renderPersonDetails(application) } }

  return {
    id: 'applicationAccordion',

    items: [
      personDetails,
      ...sections.map(section => {
        return {
          heading: { text: section.title },
          content: { html: renderCardList(section.tasks as unknown as Array<SummaryListWithCard>) },
        }
      }),
    ],
  }
}

export const applicationCardList = (application: ApprovedPremisesApplication): Array<SummaryListWithCard> => {
  return [
    card({
      html: alertBanner({
        variant: 'information',
        title: 'This application may not show the latest resident information',
        html: 'Check this profile for the most up-to-date information for this resident.',
      }),
    }),
    card({
      html: insetText(
        `Application submitted by ${application.applicantUserDetails?.name} on ${DateFormats.isoDateToUIDate(application.submittedAt)}`,
      ),
    }),
  ]
}
