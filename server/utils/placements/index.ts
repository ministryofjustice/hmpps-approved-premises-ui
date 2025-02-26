import type {
  Cas1SpaceBooking,
  Cas1SpaceBookingDates,
  Cas1SpaceBookingSummary,
  StaffMember,
} from '@approved-premises/api'
import {
  KeyDetailsArgs,
  RadioItem,
  SelectOption,
  SummaryList,
  SummaryListItem,
  UserDetails,
} from '@approved-premises/ui'
import { differenceInCalendarDays } from 'date-fns'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { htmlValue, textValue } from '../applications/helpers'
import { displayName, isFullPerson } from '../personUtils'
import paths from '../../paths/manage'
import { hasPermission } from '../users'
import { TabItem } from '../tasks/listTable'
import { summaryListItem } from '../formUtils'
import { apTypeCriteriaLabels, specialistApTypeCriteria } from '../placementCriteriaUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import { requirementsHtmlString } from '../match'
import { roomCharacteristicMap } from '../characteristicsUtils'

export const overallStatusTextMap = {
  upcoming: 'Upcoming',
  arrived: 'Arrived',
  notArrived: 'Not arrived',
  departed: 'Departed',
} as const

export const statusTextMap = {
  ...overallStatusTextMap,
  arrivingWithin6Weeks: 'Arriving within 6 weeks',
  arrivingWithin2Weeks: 'Arriving within 2 weeks',
  arrivingToday: 'Arriving today',
  overdueArrival: 'Overdue arrival',
  departingWithin2Weeks: 'Departing within 2 weeks',
  departingToday: 'Departing today',
  overdueDeparture: 'Overdue departure',
} as const

type SpaceBookingOverallStatus = keyof typeof overallStatusTextMap
type SpaceBookingStatus = keyof typeof statusTextMap

export type PlacementStatus = {
  overall: SpaceBookingOverallStatus
  detail: SpaceBookingStatus
}

export const placementStatus = (placement: Cas1SpaceBookingSummary): PlacementStatus => {
  if (placement.isNonArrival) return { overall: 'notArrived', detail: 'notArrived' }

  if (placement.actualDepartureDate) return { overall: 'departed', detail: 'departed' }

  if (placement.actualArrivalDate) {
    let detail: PlacementStatus['detail'] = 'arrived'

    const daysFromDeparture = differenceInCalendarDays(placement.expectedDepartureDate, new Date())

    if (daysFromDeparture < 0) detail = 'overdueDeparture'
    else if (daysFromDeparture === 0) detail = 'departingToday'
    else if (daysFromDeparture <= 2 * 7) detail = 'departingWithin2Weeks'

    return { overall: 'arrived', detail }
  }

  let detail: PlacementStatus['detail'] = 'upcoming'

  const daysFromArrival = differenceInCalendarDays(placement.expectedArrivalDate, new Date())

  if (daysFromArrival < 0) detail = 'overdueArrival'
  else if (daysFromArrival === 0) detail = 'arrivingToday'
  else if (daysFromArrival <= 2 * 7) detail = 'arrivingWithin2Weeks'
  else if (daysFromArrival <= 6 * 7) detail = 'arrivingWithin6Weeks'

  return { overall: 'upcoming', detail }
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
    header: { value: displayName(person), key: '', showKey: false },
    items: [
      { key: textValue('CRN'), value: textValue(person.crn) },
      { key: { text: 'Tier' }, value: { text: tier } },
      isFullPerson(person)
        ? {
            key: { text: 'Date of birth' },
            value: {
              text: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            },
          }
        : undefined,
    ],
  }
}

const formatDate = (date: string | null) => date && DateFormats.isoDateToUIDate(date)

const formatTimeFromIsoDateTime = (dateTime: string | null) =>
  dateTime && DateFormats.timeFromDate(DateFormats.isoToDateObj(dateTime))

const formatTime = (time: string) => {
  return time ? DateFormats.timeFromDate(new Date(`2024-01-01T${time}`)) : ''
}

const summaryRow = (key: string, value: string): SummaryListItem => value && summaryListItem(key, value)

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
              DateFormats.durationBetweenDates(
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

export const placementOverviewSummary = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryRow('Approved premises', placement.premises.name),
    summaryRow('Date of match', formatDate(placement.createdAt)),
    summaryRow('Expected arrival date', formatDate(placement.expectedArrivalDate)),
    summaryRow('Actual arrival date', formatDate(placement.actualArrivalDateOnly)),
    summaryRow('Expected departure date', formatDate(placement.expectedDepartureDate)),
    summaryListItem('Room criteria', requirementsHtmlString(placement.characteristics, roomCharacteristicMap), 'html'),
  ].filter(Boolean),
})

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
      summaryListItem('More information', placement.departure?.notes, 'textBlock', true),
    ].filter(Boolean),
  }
}

export const requirementsInformation = (placement: Cas1SpaceBooking): SummaryList => {
  const requirements = placement.characteristics
  const apType =
    apTypeCriteriaLabels[requirements.find(requirement => specialistApTypeCriteria.includes(requirement)) || 'normal']
  const apRequirements = filterApLevelCriteria(requirements)
  const roomRequirements = filterRoomLevelCriteria(requirements)

  const noneSelected = `<span class="text-grey">None</span>`

  return {
    rows: [
      summaryListItem('AP type', apType),
      summaryListItem(
        'AP requirements',
        apRequirements.length ? requirementsHtmlString(apRequirements) : noneSelected,
        'html',
      ),
      summaryListItem(
        'Room requirements',
        roomRequirements.length ? requirementsHtmlString(roomRequirements) : noneSelected,
        'html',
      ),
    ],
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

export const tabMap: Record<PlacementTab, { label: string; disableRestricted?: boolean; disableOffline?: boolean }> = {
  application: { label: 'Application', disableRestricted: true },
  assessment: { label: 'Assessment', disableRestricted: true, disableOffline: true },
  placementRequest: { label: 'Request for placement', disableOffline: true },
  placement: { label: 'Placement details' },
  timeline: { label: 'Timeline' },
}

export const placementTabItems = (
  placement: Cas1SpaceBooking,
  activeTab: PlacementTab,
  isOfflineApplication: boolean = false,
): Array<TabItem> => {
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
  return Object.entries(tabMap).map(([key, { label, disableRestricted, disableOffline }]) => {
    const isDisabled = (isPersonRestricted && disableRestricted) || (isOfflineApplication && disableOffline)
    return {
      text: label,
      active: activeTab === key,
      href: isDisabled ? null : getSelfLink(key as PlacementTab),
      classes: isDisabled ? 'disabled' : '',
    }
  })
}

type IdAndName = { id: string; name: string }
export const processReferenceData = <T>(input: Array<IdAndName>, subst: IdAndName): Array<T> => {
  return input.map(item => (item.id === subst.id ? subst : item)) as Array<T>
}

export const injectRadioConditionalHtml = (input: Array<RadioItem>, value: string, html: string): Array<RadioItem> =>
  input.map((row: RadioItem) => (row.value === value ? { ...row, conditional: { html } } : row))

export const BREACH_OR_RECALL_REASON_ID = 'd3e43ec3-02f4-4b96-a464-69dc74099259'
export const PLANNED_MOVE_ON_REASON_ID = '1bfe5cdf-348e-4a6e-8414-177a92a53d26'
export const LICENCE_EXPIRED_REASON_ID = '9c848d97-afe7-4da9-bd8b-f01897330e62'
export const NON_ARRIVAL_REASON_OTHER_ID = '3635c76e-8e4b-4c0e-8b92-149dc1ff0855'
export const MOVE_TO_AP_REASON_ID = '6b1f6645-dc1c-489d-8312-cab9a4a6b2a7'
export const BED_WITHDRAWN_REASON_ID = '0f856559-26c0-4184-96fe-00d446e91da2'
