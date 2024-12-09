import type {
  Cas1SpaceBooking,
  Cas1SpaceBookingDates,
  Cas1SpaceBookingSummaryStatus,
  FullPerson,
  StaffMember,
} from '@approved-premises/api'
import { KeyDetailsArgs, SelectOption, SummaryList, SummaryListItem, UserDetails } from '@approved-premises/ui'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { htmlValue, textValue } from '../applications/helpers'
import { isFullPerson, nameOrPlaceholderCopy } from '../personUtils'
import paths from '../../paths/manage'
import { hasPermission } from '../users'
import { TabItem } from '../tasks/listTable'

export const statusTextMap: Record<Cas1SpaceBookingSummaryStatus, string> = {
  arrivingWithin6Weeks: 'Arriving within 6 weeks',
  arrivingWithin2Weeks: 'Arriving within 2 weeks',
  arrivingToday: 'Arriving today',
  overdueArrival: 'Overdue arrival',
  arrived: 'Arrived',
  notArrived: 'Not arrived',
  departingWithin2Weeks: 'Departing within 2 weeks',
  departingToday: 'Departing today',
  overdueDeparture: 'Overdue departure',
  departed: 'Departed',
}

export const actions = (placement: Cas1SpaceBooking, user: UserDetails) => {
  const actionList = []
  const arrived = !!placement.actualArrivalDateOnly
  const departed = !!placement.actualDepartureDateOnly
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

const formatTimeFromIsoDateTime = (dateTime: string | null) =>
  dateTime && DateFormats.timeFromDate(DateFormats.isoToDateObj(dateTime))

const formatTime = (time: string) => {
  return time ? DateFormats.timeFromDate(new Date(`2024-01-01T${time}`)) : ''
}

export const getBackLink = (referrer: string, premisesId: string): string => {
  const premisesShowPagePathRegex = paths.premises.show({ premisesId: '([0-9a-f-]{36})' })
  const premisesViewMatch = new RegExp(`${premisesShowPagePathRegex}[^/]*$`).exec(referrer)
  if (premisesViewMatch && premisesViewMatch[1] === premisesId) {
    return referrer
  }
  const premisesChildMatch = new RegExp(premisesShowPagePathRegex).exec(referrer)
  if (premisesChildMatch && premisesChildMatch[1] === premisesId) {
    return paths.premises.show({ premisesId })
  }
  return null
}

const summaryRow = (key: string, value: string): SummaryListItem =>
  value && {
    key: textValue(key),
    value: textValue(value),
  }

export const placementSummary = (placement: Cas1SpaceBooking): SummaryList => {
  const { createdAt, actualArrivalDateOnly, actualDepartureDateOnly, keyWorkerAllocation, deliusEventNumber, status } =
    placement
  return {
    rows: [
      summaryRow('AP name', placement.premises.name),
      summaryRow('Date allocated', formatDate(createdAt)),
      summaryRow('Status', statusTextMap[status] || ''),
      summaryRow(
        'Actual length of stay',
        actualArrivalDateOnly &&
          actualDepartureDateOnly &&
          DateFormats.formatDuration(
            daysToWeeksAndDays(
              DateFormats.differenceInDays(
                DateFormats.isoToDateObj(actualDepartureDateOnly),
                DateFormats.isoToDateObj(actualArrivalDateOnly),
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
  const { expectedArrivalDate, actualArrivalDateOnly, actualArrivalTime, nonArrival } = placement
  const { reason, notes, confirmedAt } = nonArrival || {}
  return {
    rows: [
      summaryRow('Expected arrival date', formatDate(expectedArrivalDate)),
      summaryRow('Actual arrival date', formatDate(actualArrivalDateOnly)),
      summaryRow('Arrival time', formatTime(actualArrivalTime)),
      summaryRow(
        'Non arrival recorded at',
        confirmedAt && `${formatDate(confirmedAt)} ${formatTimeFromIsoDateTime(confirmedAt)}`,
      ),
      summaryRow('Non arrival reason', reason?.name),
      summaryRow('Non arrival any other information', notes),
    ].filter(Boolean),
  }
}

export const departureInformation = (placement: Cas1SpaceBooking): SummaryList => {
  let reason = placement.departure?.reason?.name
  let breachOrRecall = null

  if (placement.departure?.parentReason?.id === BREACH_OR_RECALL_REASON_ID) {
    reason = placement.departure.parentReason.name
    breachOrRecall = placement.departure?.reason?.name
  }

  return {
    rows: [
      summaryRow('Expected departure date', formatDate(placement.expectedDepartureDate)),
      summaryRow('Actual departure date', formatDate(placement.actualDepartureDateOnly)),
      summaryRow('Departure time', formatTime(placement.actualDepartureTime)),
      summaryRow('Departure reason', reason),
      summaryRow('Breach or recall', breachOrRecall),
      summaryRow('Move on', placement.departure?.moveOnCategory?.name),
      summaryRow('More information', placement.departure?.notes),
    ].filter(Boolean),
  }
}

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
    .filter(({ code }) => placement.keyWorkerAllocation?.keyWorker?.code !== code)
    .map(({ name, code }) => ({
      text: `${name}`,
      value: `${code}`,
      selected: false,
    })),
]

export type PlacementTab = 'application' | 'assessment' | 'placementRequest' | 'placement' | 'timeline'

export const tabMap: Record<PlacementTab, { label: string; disableRestricted?: boolean }> = {
  application: { label: 'Application', disableRestricted: true },
  assessment: { label: 'Assessment', disableRestricted: true },
  placementRequest: { label: 'Request for placement' },
  placement: { label: 'Placement details' },
  timeline: { label: 'Timeline' },
}

export const placementTabItems = (placement: Cas1SpaceBooking, activeTab?: PlacementTab): Array<TabItem> => {
  const isPersonRestricted = placement.person.type === 'RestrictedPerson'
  const getSelfLink = (tab: PlacementTab): string => {
    const pathRoot = paths.premises.placements
    const premisesId = placement.premises.id
    const placementId = placement.id
    switch (tab) {
      case 'application':
        return pathRoot.showTabApplication({ premisesId, placementId })
      case 'assessment':
        return pathRoot.showTabAssessment({ premisesId, placementId })
      case 'placementRequest':
        return pathRoot.showTabPlacementRequest({ premisesId, placementId })
      case 'timeline':
        return pathRoot.showTabTimeline({ premisesId, placementId })
      default:
        return pathRoot.show({ premisesId, placementId })
    }
  }
  return Object.entries(tabMap).map(([key, { label, disableRestricted }]) => {
    const isRestricted = isPersonRestricted && disableRestricted
    return {
      text: label,
      active: activeTab === key,
      href: isRestricted ? null : getSelfLink(key as PlacementTab),
      classes: isRestricted ? 'disabled' : '',
    }
  })
}

export const BREACH_OR_RECALL_REASON_ID = 'd3e43ec3-02f4-4b96-a464-69dc74099259'
export const PLANNED_MOVE_ON_REASON_ID = '1bfe5cdf-348e-4a6e-8414-177a92a53d26'
