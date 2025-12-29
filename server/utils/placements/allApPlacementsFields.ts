import { Cas1SpaceBookingShortSummary } from '@approved-premises/api'
import { SummaryListItem } from '@approved-premises/ui'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import { requirementsInformation } from './index'

export const getStatusSpecificFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  const { status } = placement

  switch (status) {
    case 'cancelled':
      return getCancelledFields(placement)
    case 'departed':
      return getDepartedFields(placement)
    case 'notArrived':
      return getNotArrivedFields(placement)
    case 'arrived':
      return getArrivedFields(placement)
    case 'upcoming':
    default:
      return getUpcomingFields(placement)
  }
}

const getUpcomingFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
    summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean)
}

const getArrivedFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItemNoBlankRows('Actual arrival date', placement.actualArrivalDate, 'date'),
    summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean)
}

const getNotArrivedFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
    summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    summaryListItemNoBlankRows('Non-arrival reason', placement.nonArrival?.reason?.name),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean)
}

const getDepartedFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItemNoBlankRows('Arrival date', placement.actualArrivalDate, 'date'),
    summaryListItemNoBlankRows('Departure date', placement.actualDepartureDate, 'date'),
    summaryListItemNoBlankRows('Departure reason', placement.departure?.reason?.name),
    summaryListItemNoBlankRows('Move on', placement.departure?.moveOnCategory?.name),
    summaryListItemNoBlankRows('Notes', placement.departure?.notes),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean)
}

const getCancelledFields = (placement: Cas1SpaceBookingShortSummary): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', placement.premises.name),
    summaryListItem('Date of booking', placement.createdAt, 'date'),
    summaryListItem('Expected arrival date', placement.expectedArrivalDate, 'date'),
    summaryListItem('Expected departure date', placement.expectedDepartureDate, 'date'),
    summaryListItemNoBlankRows('Cancellation date', placement.cancellation?.occurredAt, 'date'),
    summaryListItemNoBlankRows('Cancellation reason notes', placement.cancellation?.reason_notes),
    ...requirementsInformation(placement).rows,
    summaryListItem('Delius event number', placement.deliusEventNumber),
  ].filter(Boolean)
}
