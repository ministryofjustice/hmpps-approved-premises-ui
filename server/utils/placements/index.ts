import type { Cas1PremisesSummary, Cas1SpaceBooking, Cas1SpaceBookingDates, FullPerson } from '@approved-premises/api'
import { KeyDetailsArgs, SummaryList } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { htmlValue, textValue } from '../applications/helpers'
import { isFullPerson, nameOrPlaceholderCopy } from '../personUtils'

export const actions = (placement: Cas1SpaceBooking) => {
  const actions = []

  if (!placement.keyWorkerAllocation) {
    actions.push({
      text: 'Allocate keyworker',
      classes: 'govuk-button--secondary',
      href: '',
    })
  }
  if (!placement.actualArrivalDate) {
    actions.push({
      text: 'Record arrival',
      classes: 'govuk-button--secondary',
      href: '',
    })
  } else {
    if (!placement.actualDepartureDate) {
      actions.push({
        text: 'Record departure',
        classes: 'govuk-button--secondary',
        href: '',
      })
    }
  }
  if (placement.keyWorkerAllocation) {
    actions.push({
      text: 'Change keyworker',
      classes: 'govuk-button--secondary',
      href: '',
    })
  }
  return actions
}

export const getKeyDetail = (placement: Cas1SpaceBooking): KeyDetailsArgs => {
  const { person, tier } = placement
  return {
    header: { value: nameOrPlaceholderCopy(person), key: '', showKey: false },
    items: [
      { key: textValue('CRN'), value: textValue(person.crn) },
      { key: { text: 'Tier' }, value: { text: tier } },
      {
        key: { text: 'Date of birth' },
        value: {
          text: isFullPerson(person)
            ? DateFormats.isoDateToUIDate((person as FullPerson).dateOfBirth, { format: 'short' })
            : '-',
        },
      },
    ],
  }
}

const greyValue = (text: string) => htmlValue(`<span class="text-grey">${text}</span>`)

const summaryRow = (key: string, value: string, greyRow = false) =>
  greyRow
    ? {
        key: greyValue(key),
        value: greyValue('-'),
      }
    : {
        key: textValue(key),
        value: textValue(value),
      }
const formatDate = (date: string | null) => date && DateFormats.isoDateToUIDate(date)
const formatTime = (date: string | null) => date && DateFormats.timeFromDate(DateFormats.isoToDateObj(date))

export const placementSummary = (placement: Cas1SpaceBooking, premises: Cas1PremisesSummary): SummaryList => ({
  rows: [
    summaryRow('AP name', premises.name),
    summaryRow('Date allocated', formatDate(placement.createdAt)),
    summaryRow('Status', 'TBD'),
    summaryRow('Actual length of stay', 'TBD', true),
    summaryRow('Key worker', placement.keyWorkerAllocation?.keyWorker?.name || 'Not assigned'),
    summaryRow('Delius EventNumber', 'TBD'),
  ],
})

export const arrivalInformation = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Expected arrival date', formatDate(placement.expectedArrivalDate)),
    summaryRow('Actual arrival date', formatDate(placement.actualArrivalDate), !placement.actualArrivalDate),
    summaryRow('Time of arrival', formatTime(placement.actualArrivalDate), !placement.actualArrivalDate),
    summaryRow('Non arrival reason', null, true),
    summaryRow('Non arrival any other information', null, true),
  ],
})

export const departureInformation = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Expected departure date', formatDate(placement.expectedDepartureDate)),
    summaryRow('Actual departure date', formatDate(placement.actualDepartureDate), !placement.actualDepartureDate),
    summaryRow('Time of departure', formatTime(placement.actualDepartureDate), !placement.actualDepartureDate),
    summaryRow('Departure reason', placement.departureReason?.name, !placement.departureReason?.name),
    summaryRow('Breach or recall', null, true),
    summaryRow('Move on', placement.departureMoveOnCategory?.name, !placement.departureMoveOnCategory?.name),
    summaryRow('More information', null, true),
  ],
})

const listOtherBookings = (bookingList: Array<Cas1SpaceBookingDates>): string =>
  bookingList
    .map(
      ({ id, canonicalArrivalDate, canonicalDepartureDate }: Cas1SpaceBookingDates) =>
        `<a href="${id}">Placement ${DateFormats.isoDateToUIDate(canonicalArrivalDate,{format:'short'})} to ${DateFormats.isoDateToUIDate(canonicalDepartureDate,{format:'short'})}</a>`,
    )
    .join('<br/>')

export const otherBookings = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    {
      key: textValue('Other placement bookings at this premises'),
      value: htmlValue(listOtherBookings(placement.otherBookingsInPremisesForCrn || [])),
    },
  ],
})
