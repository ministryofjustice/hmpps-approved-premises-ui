import {
  Cas1ChangeRequestType,
  Cas1SpaceBooking,
  Cas1SpaceBookingDates,
  Cas1SpaceBookingSummary,
  Cas1CurrentKeyWorker,
} from '@approved-premises/api'
import { RadioItem, SummaryList, UserDetails } from '@approved-premises/ui'
import { differenceInCalendarDays } from 'date-fns'
import { DateFormats } from '../dateUtils'
import { htmlValue, personKeyDetails, textValue } from '../applications/helpers'
import paths from '../../paths/manage'
import { hasPermission } from '../users'
import { TabItem } from '../tasks/listTable'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import {
  ApTypeCriteria,
  apTypeCriteriaLabels,
  SpecialistApTypeCriteria,
  specialistApTypeCriteria,
} from '../placementCriteriaUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'
import { characteristicsBulletList, roomCharacteristicMap } from '../characteristicsUtils'

export const overallStatusTextMap = {
  upcoming: 'Upcoming',
  arrived: 'Arrived',
  notArrived: 'Not arrived',
  departed: 'Departed',
  cancelled: 'Cancelled',
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

const changeRequestStatuses: Record<Cas1ChangeRequestType, string> = {
  placementAppeal: 'Appeal requested',
  plannedTransfer: 'Transfer requested',
  placementExtension: 'Extension requested',
}

type SpaceBookingOverallStatus = keyof typeof overallStatusTextMap
type SpaceBookingStatus = keyof typeof statusTextMap

const isSpaceBooking = (placement: Cas1SpaceBooking | Cas1SpaceBookingSummary): placement is Cas1SpaceBooking =>
  Boolean((placement as Cas1SpaceBooking).otherBookingsInPremisesForCrn)

export const overallStatus = (placement: Cas1SpaceBookingSummary | Cas1SpaceBooking): SpaceBookingOverallStatus => {
  const isNonArrival = isSpaceBooking(placement) ? placement.nonArrival : placement.isNonArrival
  const isCancelled = isSpaceBooking(placement) ? placement.cancellation : placement.isCancelled

  if (isCancelled) return 'cancelled'
  if (isNonArrival) return 'notArrived'
  if (placement.actualDepartureDate) return 'departed'
  if (placement.actualArrivalDate) return 'arrived'
  return 'upcoming'
}

export const detailedStatus = (placement: Cas1SpaceBookingSummary | Cas1SpaceBooking): SpaceBookingStatus => {
  const status = overallStatus(placement)

  if (['notArrived', 'departed', 'cancelled'].includes(status)) return status

  if (status === 'arrived') {
    const daysFromDeparture = differenceInCalendarDays(placement.expectedDepartureDate, new Date())

    if (daysFromDeparture < 0) return 'overdueDeparture'
    if (daysFromDeparture === 0) return 'departingToday'
    if (daysFromDeparture <= 2 * 7) return 'departingWithin2Weeks'

    return 'arrived'
  }

  const daysFromArrival = differenceInCalendarDays(placement.expectedArrivalDate, new Date())

  if (daysFromArrival < 0) return 'overdueArrival'
  if (daysFromArrival === 0) return 'arrivingToday'
  if (daysFromArrival <= 2 * 7) return 'arrivingWithin2Weeks'
  if (daysFromArrival <= 6 * 7) return 'arrivingWithin6Weeks'

  return 'upcoming'
}

export const placementStatusHtml = (placement: Cas1SpaceBookingSummary): { html: string } => {
  const statusElements: Array<string> = [
    statusTextMap[detailedStatus(placement)],
    ...placement.openChangeRequestTypes.map((requestType: Cas1ChangeRequestType) => changeRequestStatuses[requestType]),
  ]

  return { html: statusElements.join('<br/>') }
}

export const canonicalDates = (placement: Cas1SpaceBooking | Cas1SpaceBookingSummary) => ({
  arrivalDate: placement.actualArrivalDate || placement.expectedArrivalDate,
  departureDate: placement.actualDepartureDate || placement.expectedDepartureDate,
})

export const actions = (placement: Cas1SpaceBooking, user: UserDetails) => {
  const actionList = []
  const status = overallStatus(placement)

  if (['upcoming', 'arrived'].includes(status) && hasPermission(user, ['cas1_space_booking_record_keyworker'])) {
    actionList.push({
      text: 'Edit keyworker',
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.keyworker.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
    })
  }

  if (status === 'upcoming') {
    if (hasPermission(user, ['cas1_space_booking_record_arrival'])) {
      actionList.push({
        text: 'Record arrival',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.arrival({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }

    if (hasPermission(user, ['cas1_space_booking_record_non_arrival'])) {
      actionList.push({
        text: 'Record non-arrival',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.nonArrival({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }

    // TODO: Check that there are no existing appeals
    if (hasPermission(user, ['cas1_placement_appeal_create'])) {
      actionList.push({
        text: 'Request an appeal',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.appeal.new({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }
  }

  if (status === 'arrived') {
    if (hasPermission(user, ['cas1_space_booking_record_departure'])) {
      actionList.push({
        text: 'Record departure',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.departure.new({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }

    if (hasPermission(user, ['cas1_transfer_create'])) {
      actionList.push({
        text: 'Request a transfer',
        classes: 'govuk-button--secondary',
        href: paths.premises.placements.transfers.new({ premisesId: placement.premises.id, placementId: placement.id }),
      })
    }
  }

  if (['upcoming', 'arrived'].includes(status) && hasPermission(user, ['cas1_space_booking_create'])) {
    actionList.push({
      href: paths.premises.placements.changes.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
      classes: 'govuk-button--secondary',
      text: 'Change placement',
    })
  }

  return actionList.length ? [{ items: actionList }] : null
}

export const placementKeyDetails = (placement: Cas1SpaceBooking) => personKeyDetails(placement.person, placement.tier)

const formatTimeFromIsoDateTime = (dateTime: string | null) =>
  dateTime && DateFormats.timeFromDate(DateFormats.isoToDateObj(dateTime))

const formatTime = (time: string) => {
  return time ? DateFormats.timeFromDate(new Date(`2024-01-01T${time}`)) : ''
}

export const placementSummary = (placement: Cas1SpaceBooking): SummaryList => {
  const { createdAt, actualArrivalDate, actualDepartureDate, keyWorkerAllocation, deliusEventNumber } = placement
  return {
    rows: [
      summaryListItemNoBlankRows('AP name', placement.premises.name),
      summaryListItemNoBlankRows('Date allocated', createdAt, 'date'),
      summaryListItemNoBlankRows('Status', statusTextMap[detailedStatus(placement)]),
      summaryListItemNoBlankRows(
        'Actual length of stay',
        actualArrivalDate &&
          actualDepartureDate &&
          DateFormats.formatDuration(
            DateFormats.durationBetweenDates(
              DateFormats.isoToDateObj(actualDepartureDate),
              DateFormats.isoToDateObj(actualArrivalDate),
            ).number,
          ),
      ),
      summaryListItemNoBlankRows('Key worker', keyWorkerAllocation?.name || 'Not assigned'),
      summaryListItemNoBlankRows('Delius Event Number', deliusEventNumber),
    ].filter(Boolean),
  }
}

export const placementOverviewSummary = (placement: Cas1SpaceBooking): SummaryList => ({
  rows: [
    summaryListItemNoBlankRows('Approved premises', placement.premises.name),
    summaryListItemNoBlankRows('Date of match', placement.createdAt, 'date'),
    summaryListItemNoBlankRows('Expected arrival date', placement.expectedArrivalDate, 'date'),
    summaryListItemNoBlankRows('Actual arrival date', placement.actualArrivalDate, 'date'),
    summaryListItemNoBlankRows('Expected departure date', placement.expectedDepartureDate, 'date'),
    summaryListItem(
      'Room criteria',
      characteristicsBulletList(placement.characteristics, {
        labels: roomCharacteristicMap,
        noneText: 'No room criteria',
      }),
      'html',
    ),
  ].filter(Boolean),
})

export const arrivalInformation = (placement: Cas1SpaceBooking): SummaryList => {
  const { expectedArrivalDate, actualArrivalDate, actualArrivalTime, nonArrival } = placement
  const { reason, notes, confirmedAt } = nonArrival || {}
  return {
    rows: [
      summaryListItemNoBlankRows('Expected arrival date', expectedArrivalDate, 'date'),
      summaryListItemNoBlankRows('Actual arrival date', actualArrivalDate, 'date'),
      summaryListItemNoBlankRows('Arrival time', formatTime(actualArrivalTime)),
      summaryListItemNoBlankRows(
        'Non arrival recorded at',
        confirmedAt && `${DateFormats.isoDateToUIDate(confirmedAt)} ${formatTimeFromIsoDateTime(confirmedAt)}`,
      ),
      summaryListItemNoBlankRows('Non arrival reason', reason?.name),
      summaryListItemNoBlankRows('Non arrival any other information', notes),
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
      summaryListItemNoBlankRows('Expected departure date', placement.expectedDepartureDate, 'date'),
      summaryListItemNoBlankRows('Actual departure date', placement.actualDepartureDate, 'date'),
      summaryListItemNoBlankRows('Departure time', formatTime(placement.actualDepartureTime)),
      summaryListItemNoBlankRows('Departure reason', reason),
      summaryListItemNoBlankRows('Breach or recall', breachOrRecall),
      summaryListItemNoBlankRows('Move on', placement.departure?.moveOnCategory?.name),
      summaryListItemNoBlankRows('More information', placement.departure?.notes, 'textBlock'),
    ].filter(Boolean),
  }
}

export const requirementsInformation = (placement: Cas1SpaceBooking): SummaryList => {
  const requirements = placement.characteristics
  const apType =
    apTypeCriteriaLabels[
      (requirements.find(requirement => specialistApTypeCriteria.includes(requirement as SpecialistApTypeCriteria)) ||
        'normal') as ApTypeCriteria
    ]
  const apRequirements = filterApLevelCriteria(requirements)
  const roomRequirements = filterRoomLevelCriteria(requirements)

  return {
    rows: [
      summaryListItem('AP type', apType),
      summaryListItem('AP requirements', characteristicsBulletList(apRequirements), 'html'),
      summaryListItem('Room requirements', characteristicsBulletList(roomRequirements), 'html'),
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

export const renderKeyworkersRadioOptions = (
  currentKeyworkers: Array<Cas1CurrentKeyWorker>,
  placement?: Cas1SpaceBooking,
): Array<RadioItem> => {
  const currentKeyworkersRadios = currentKeyworkers
    .filter(keyworker => keyworker.summary.id !== placement?.keyWorkerAllocation?.userId)
    .map(keyworker => ({
      text: keyworker.summary.name,
      value: keyworker.summary.id,
    }))

  return [
    ...currentKeyworkersRadios,
    currentKeyworkersRadios.length ? { divider: 'or' } : undefined,
    {
      text: 'Assign a different keyworker',
      value: 'new',
    },
  ].filter(Boolean)
}

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
  input.map(row => ('value' in row && row.value === value ? { ...row, conditional: { html } } : row))

export const withdrawalMessage = (placement: Cas1SpaceBooking | Cas1SpaceBookingSummary): string => {
  const { arrivalDate, departureDate } = canonicalDates(placement)
  return `Placement at ${placement.premises.name} from ${DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(departureDate, { format: 'short' })} has been withdrawn`
}

export const withdrawalSummaryList = (placement: Cas1SpaceBooking) => {
  const { arrivalDate, departureDate } = canonicalDates(placement)
  return {
    rows: [
      summaryListItem('Approved premises', placement?.premises.name),
      summaryListItem('Arrival date', arrivalDate, 'date'),
      summaryListItem('Departure date', departureDate, 'date'),
    ],
  }
}

export const BREACH_OR_RECALL_REASON_ID = 'd3e43ec3-02f4-4b96-a464-69dc74099259'
export const PLANNED_MOVE_ON_REASON_ID = '1bfe5cdf-348e-4a6e-8414-177a92a53d26'
export const LICENCE_EXPIRED_REASON_ID = '9c848d97-afe7-4da9-bd8b-f01897330e62'
export const NON_ARRIVAL_REASON_OTHER_ID = '3635c76e-8e4b-4c0e-8b92-149dc1ff0855'
export const MOVE_TO_AP_REASON_ID = '6b1f6645-dc1c-489d-8312-cab9a4a6b2a7'
export const BED_WITHDRAWN_REASON_ID = '0f856559-26c0-4184-96fe-00d446e91da2'
