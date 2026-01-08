import { ApprovedPremisesApplication, Cas1SpaceBooking, Cas1SpaceBookingShortSummary } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { Accordion, alertBanner, card, renderCardList, renderPersonDetails, ResidentProfileSubTab } from './index'
import { SubmittedDocumentRenderer } from '../forms/submittedDocumentRenderer'
import { insetText } from './riskUtils'
import { DateFormats } from '../dateUtils'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { placementStatusTag, requirementsInformation } from '../placements'
import paths from '../../paths/manage'

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

export const placementCard = (placement: Cas1SpaceBooking | Cas1SpaceBookingShortSummary): SummaryListWithCard => ({
  card: {
    title: {
      html: `${placement.premises.name} ${placementStatusTag(placement, { classes: 'govuk-!-margin-left-1' })}`,
    },
  },
  rows: [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItemNoBlankRows(
      'Expected arrival date',
      placement.actualArrivalDate ? undefined : placement.expectedArrivalDate,
      'date',
    ),
    summaryListItemNoBlankRows('Arrival date', placement.actualArrivalDate, 'date'),
    summaryListItemNoBlankRows(
      'Expected departure date',
      placement.actualDepartureDate ? undefined : placement.expectedDepartureDate,
      'date',
    ),
    summaryListItemNoBlankRows('Departure date', placement.actualDepartureDate, 'date'),
    summaryListItemNoBlankRows('Departure reason', placement.departure?.reason?.name),
    summaryListItemNoBlankRows('Move on', placement.departure?.moveOnCategory?.name),
    summaryListItemNoBlankRows('Notes', placement.departure?.notes),
    summaryListItemNoBlankRows('Non-arrival reason', placement.nonArrival?.reason?.name),
    summaryListItemNoBlankRows('Cancellation date', placement.cancellation?.occurredAt, 'date'),
    summaryListItemNoBlankRows('Cancellation reason notes', placement.cancellation?.reason_notes),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean),
})

export const placementDetailsCards = (placement: Cas1SpaceBooking): Array<SummaryListWithCard> => {
  return [placementCard(placement)]
}

export const allApPlacementsTabData = (placements: Array<Cas1SpaceBookingShortSummary>): Array<SummaryListWithCard> => {
  return placements.map(placementCard)
}
