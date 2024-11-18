import type { Cas1SpaceBooking, Cas1SpaceBookingDates, FullPerson, StaffMember } from '@approved-premises/api'
import { KeyDetailsArgs, SelectOption, SummaryList, SummaryListItem, UserDetails } from '@approved-premises/ui'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { htmlValue, textValue } from '../applications/helpers'
import { isFullPerson, nameOrPlaceholderCopy } from '../personUtils'
import paths from '../../paths/manage'
import { hasPermission } from '../users'

export const actions = (placement: Cas1SpaceBooking, user: UserDetails) => {
  const actionList = []
  const arrived = !!placement.actualArrivalDate
  const departed = !!placement.actualDepartureDate
  const nonArrival = !!placement.nonArrival

  if (!departed && !nonArrival && hasPermission(user, ['cas1_space_booking_record_keyworker'])) {
    actionList.push({
      text: 'Edit keyworker',
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
    })
  }
  if (!arrived && !nonArrival) {
    if (hasPermission(user, ['cas1_space_booking_record_arrival']))
      actionList.push({
        text: 'Record arrival',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.arrival({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    if (hasPermission(user, ['cas1_space_booking_record_non_arrival'])) {
      actionList.push({
        text: 'Record non-arrival',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.nonArrival({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }
  }
  if (arrived && !departed && hasPermission(user, ['cas1_space_booking_record_departure'])) {
    actionList.push({
      text: 'Record departure',
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.departure.new({ premisesId: placement.premises.id, placementId: placement.id }),
    })
  }
  return actionList.length ? [{ items: actionList }] : null
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

const formatDate = (date: string | null) => date && DateFormats.isoDateToUIDate(date)

const formatTime = (date: string | null) => date && DateFormats.timeFromDate(DateFormats.isoToDateObj(date))

export const getBackLink = (referrer: string, premisesId: string): string => {
  const regString: string = `${paths.premises.show({ premisesId: '([0-9a-f-]{36})' })}[^/]*$`
  const result = new RegExp(regString).exec(referrer)
  if (result && result[1] === premisesId) {
    return referrer
  }
  return paths.premises.show({ premisesId })
}

const summaryRow = (key: string, value: string): SummaryListItem =>
  value && {
    key: textValue(key),
    value: textValue(value),
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
      ),
      summaryRow('Key worker', keyWorkerAllocation?.keyWorker?.name || 'Not assigned'),
      summaryRow('Delius Event Number', deliusEventNumber),
    ].filter(Boolean),
  }
}

export const arrivalInformation = (placement: Cas1SpaceBooking): SummaryList => {
  const { expectedArrivalDate, actualArrivalDate, nonArrival } = placement
  const { reason, notes, confirmedAt } = nonArrival || {}
  return {
    rows: [
      summaryRow('Expected arrival date', formatDate(expectedArrivalDate)),
      summaryRow('Actual arrival date', formatDate(actualArrivalDate)),
      summaryRow('Arrival time', formatTime(actualArrivalDate)),
      summaryRow('Non arrival recorded at', confirmedAt && `${formatDate(confirmedAt)} ${formatTime(confirmedAt)}`),
      summaryRow('Non arrival reason', reason?.name),
      summaryRow('Non arrival any other information', notes),
    ].filter(Boolean),
  }
}

export const departureInformation = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Expected departure date', formatDate(placement.expectedDepartureDate)),
    summaryRow('Actual departure date', formatDate(placement.actualDepartureDate)),
    summaryRow('Departure time', formatTime(placement.actualDepartureDate)),
    summaryRow('Departure reason', placement.departureReason?.name),
    summaryRow('Breach or recall', null),
    summaryRow('Move on', placement.departureMoveOnCategory?.name),
    summaryRow('More information', null),
  ].filter(Boolean),
})

const listOtherBookings = (placement: Cas1SpaceBooking): string =>
  (placement.otherBookingsInPremisesForCrn || [])
    .map(
      ({ id, canonicalArrivalDate, canonicalDepartureDate }: Cas1SpaceBookingDates) =>
        `<li><a class="govuk-link" href="${paths.premises.placements.show({
          premisesId: placement.premises.id,
          placementId: id,
        })}">Placement ${DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' })}</a></li>`,
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

export const renderKeyworkersSelectOptions = (
  staffList: Array<StaffMember>,
  placement: Cas1SpaceBooking,
): Array<SelectOption> => [
  { text: 'Select a keyworker', value: null },
  ...staffList
    .filter(({ keyWorker, code }) => keyWorker && placement.keyWorkerAllocation?.keyWorker?.code !== code)
    .map(({ name, code }) => ({
      text: `${name}`,
      value: `${code}`,
      selected: false,
    })),
]

export const BREACH_OR_RECALL_REASON_ID = 'd3e43ec3-02f4-4b96-a464-69dc74099259'
export const PLANNED_MOVE_ON_REASON_ID = '1bfe5cdf-348e-4a6e-8414-177a92a53d26'
