import type { Cas1SpaceBooking, Cas1SpaceBookingDates, FullPerson } from '@approved-premises/api'
import { KeyDetailsArgs, SummaryList, UserDetails } from '@approved-premises/ui'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { htmlValue, textValue } from '../applications/helpers'
import { isFullPerson, nameOrPlaceholderCopy } from '../personUtils'
import paths from '../../paths/manage'
import { hasPermission } from '../users/roles'

export const actions = (placement: Cas1SpaceBooking, user: UserDetails) => {
  const out = []

  if (hasPermission(user, ['cas1_space_booking_record_keyworker'])) {
    out.push({
      text: placement.keyWorkerAllocation ? 'Edit keyworker' : 'Allocate keyworker',
      classes: 'govuk-button--secondary',
      href: '',
    })
  }
  if (!placement.actualArrivalDate && hasPermission(user, ['cas1_space_booking_record_arrival'])) {
    out.push({
      text: 'Record arrival',
      classes: 'govuk-button--secondary',
      href: '',
    })
  } else if (!placement.actualDepartureDate && hasPermission(user, ['cas1_space_booking_record_departure'])) {
    out.push({
      text: 'Record departure',
      classes: 'govuk-button--secondary',
      href: '',
    })
  }
  return out
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

const formatDate = (date: string | null) => date && DateFormats.isoDateToUIDate(date)

const formatTime = (date: string | null) => date && DateFormats.timeFromDate(DateFormats.isoToDateObj(date))

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

export const getBackLink = (referrer: string, premisesId: string): string => {
  const regString: string = `${paths.premises.show({ premisesId: '([0-9a-f-]{36})' })}[^/]*$`
  const result = new RegExp(regString).exec(referrer)
  if (result && result[1] === premisesId) {
    return referrer
  }
  return paths.premises.show({ premisesId })
}

export const placementSummary = (placement: Cas1SpaceBooking): SummaryList => {
  const { createdAt, actualArrivalDate, actualDepartureDate, keyWorkerAllocation, deliusEventNumber } = placement
  return {
    rows: [
      summaryRow('AP name', placement.premises.name),
      summaryRow('Date allocated', formatDate(createdAt)),
      summaryRow('Status', 'TBD'),
      summaryRow(
        'Actual length of stay',
        actualArrivalDate &&
          actualDepartureDate &&
          DateFormats.formatDuration(
            daysToWeeksAndDays(
              DateFormats.differenceInDays(
                DateFormats.isoToDateObj(actualDepartureDate),
                DateFormats.isoToDateObj(actualArrivalDate),
              ).number,
            ),
          ),
        !actualArrivalDate || !actualDepartureDate,
      ),
      summaryRow('Key worker', keyWorkerAllocation?.keyWorker?.name || 'Not assigned'),
      summaryRow('Delius Event Number', deliusEventNumber, !deliusEventNumber),
    ],
  }
}

export const arrivalInformation = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Expected arrival date', formatDate(placement.expectedArrivalDate)),
    summaryRow('Actual arrival date', formatDate(placement.actualArrivalDate), !placement.actualArrivalDate),
    summaryRow('Arrival time', formatTime(placement.actualArrivalDate), !placement.actualArrivalDate),
    summaryRow('Non arrival reason', null, true),
    summaryRow('Non arrival any other information', null, true),
  ],
})

export const departureInformation = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Expected departure date', formatDate(placement.expectedDepartureDate)),
    summaryRow('Actual departure date', formatDate(placement.actualDepartureDate), !placement.actualDepartureDate),
    summaryRow('Departure time', formatTime(placement.actualDepartureDate), !placement.actualDepartureDate),
    summaryRow('Departure reason', placement.departureReason?.name, !placement.departureReason?.name),
    summaryRow('Breach or recall', null, true),
    summaryRow('Move on', placement.departureMoveOnCategory?.name, !placement.departureMoveOnCategory?.name),
    summaryRow('More information', null, true),
  ],
})

const listOtherBookings = (placement: Cas1SpaceBooking): string =>
  (placement.otherBookingsInPremisesForCrn || [])
    .map(
      ({ id, canonicalArrivalDate, canonicalDepartureDate }: Cas1SpaceBookingDates) =>
        `<li><a class="govuk-link" href="${paths.premises.placements.show({ premisesId: placement.premises.id, placementId: id })}">Placement ${DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' })}</a></li>`,
    )
    .join('')

export const otherBookings = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    {
      key: textValue('Other placement bookings at this premises'),
      value: htmlValue(`<ul class="govuk-list">${listOtherBookings(placement)}</ul>`),
    },
  ],
})
