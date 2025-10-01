import {
  ApType,
  Cas1PlacementRequestDetail,
  Cas1Premises,
  Cas1PremisesSearchResultSummary,
  type Cas1SpaceBooking,
  Cas1SpaceBookingCharacteristic,
  PlacementCriteria,
  ReleaseTypeOption,
  Cas1SpaceCharacteristic as SpaceCharacteristic,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '@approved-premises/api'
import { KeyDetailsArgs, ObjectWithDateParts, SummaryListItem } from '@approved-premises/ui'
import { DateFormats } from '../dateUtils'
import { apTypeLongLabels } from '../apTypeLabels'
import { summaryListItem } from '../formUtils'
import { textValue } from '../applications/helpers'
import { displayName, isFullPerson } from '../personUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import paths from '../../paths/apply'
import { characteristicsBulletList } from '../characteristicsUtils'
import { spaceSearchResultsCharacteristicsLabels } from './spaceSearchLabels'

export { placementDates } from './placementDates'
export { occupancySummary } from './occupancySummary'
export { validateSpaceBooking } from './validateSpaceBooking'

type SpaceBookingConfirmationData = {
  premises: Cas1Premises
  expectedArrivalDate: string
  actualArrivalDate?: string
  expectedDepartureDate: string
  criteria: Array<Cas1SpaceBookingCharacteristic>
  releaseType?: ReleaseTypeOption
  isWomensApplication?: boolean
  newPlacementReason?: string
}

export const spaceBookingConfirmationSummaryListRows = (data: SpaceBookingConfirmationData): Array<SummaryListItem> => {
  const {
    premises,
    expectedArrivalDate,
    actualArrivalDate,
    expectedDepartureDate,
    criteria,
    releaseType,
    isWomensApplication,
    newPlacementReason,
  } = data

  return [
    summaryListItem('Approved Premises', premises.name),
    summaryListItem('Address', premisesAddress(premises)),
    !isWomensApplication && summaryListItem('AP area', premises.apArea.name),
    summaryListItem('Room criteria', characteristicsBulletList(criteria, { noneText: 'No room criteria' }), 'html'),
    actualArrivalDate
      ? summaryListItem('Actual arrival date', actualArrivalDate, 'date')
      : summaryListItem('Expected arrival date', expectedArrivalDate, 'date'),
    summaryListItem('Expected departure date', expectedDepartureDate, 'date'),
    summaryListItem('Length of stay', DateFormats.durationBetweenDates(expectedDepartureDate, expectedArrivalDate).ui),
    releaseType && summaryListItem('Release type', allReleaseTypes[releaseType]),
    newPlacementReason && summaryListItem('Reason for placement', newPlacementReason),
  ].filter(Boolean)
}

export const filterOutAPTypes = (requirements: Array<PlacementCriteria>): Array<SpaceCharacteristic> => {
  return requirements.filter(
    requirement =>
      ![
        'isPIPE',
        'isESAP',
        'isRecoveryFocussed',
        'isMHAPElliottHouse',
        'isMHAPStJosephs',
        'isSemiSpecialistMentalHealth',
      ].includes(requirement),
  ) as Array<SpaceCharacteristic>
}

export const requestedOrEstimatedArrivalDateRow = (isParole: boolean, arrivalDate: string) =>
  summaryListItem(isParole ? 'Estimated arrival date' : 'Requested arrival date', arrivalDate, 'date')

export const apTypeRow = (apType: ApType) => summaryListItem('Type of AP', apTypeLongLabels[apType])

export const apTypeWithViewTimelineActionRow = (placementRequest: Cas1PlacementRequestDetail) => {
  const apTypeItem = apTypeRow(placementRequest.type)

  if (placementRequest.application) {
    return {
      ...apTypeItem,
      actions: {
        items: [
          {
            href: `${paths.applications.show({ id: placementRequest.applicationId })}?tab=timeline`,
            text: 'View timeline',
          },
        ],
      },
    }
  }
  return apTypeItem
}

export const premisesAddress = (premises: Cas1Premises | Cas1PremisesSearchResultSummary) =>
  [premises.fullAddress.trim(), premises.postcode?.trim()].filter(Boolean).join(', ')

export const addressRow = (spaceSearchResult: SpaceSearchResult) =>
  summaryListItem('Address', premisesAddress(spaceSearchResult.premises))

export const characteristicsDetails = (spaceSearchResult: SpaceSearchResult): string => {
  return characteristicsBulletList(spaceSearchResult.premises.characteristics, {
    labels: spaceSearchResultsCharacteristicsLabels,
  })
}

export const distanceRow = (spaceSearchResult: SpaceSearchResult, postcodeArea?: string) => {
  const roundedDistanceInMiles = Math.round(spaceSearchResult.distanceInMiles * 10) / 10
  return summaryListItem('Distance', `${roundedDistanceInMiles} miles from ${postcodeArea || 'the desired location'}`)
}

export const restrictionsRow = (spaceSearchResult: SpaceSearchResult): SummaryListItem => {
  return spaceSearchResult.premises.localRestrictions.length
    ? {
        key: { text: 'Restrictions' },
        value: {
          html: `
            <ul class="govuk-list govuk-list--bullet">
              ${spaceSearchResult.premises.localRestrictions.map(restriction => `<li>${restriction}</li>`).join('')}
            </ul>
          `,
        },
      }
    : undefined
}

export const startDateObjFromParams = (params: { startDate: string } | ObjectWithDateParts<'startDate'>) => {
  const dateParts = params as ObjectWithDateParts<'startDate'>
  if (dateParts['startDate-day'] && dateParts['startDate-month'] && dateParts['startDate-year']) {
    return {
      ...DateFormats.dateAndTimeInputsToIsoString(dateParts, 'startDate'),
    }
  }

  return { startDate: params.startDate, ...DateFormats.isoDateToDateInputs(params.startDate, 'startDate') }
}

export const keyDetails = (placementRequest: Cas1PlacementRequestDetail): KeyDetailsArgs => {
  const { person } = placementRequest
  if (!isFullPerson(person)) throw Error('Restricted person')
  return {
    header: {
      key: 'Name',
      value: displayName(person),
      showKey: false,
    },
    items: [
      {
        key: textValue('CRN'),
        value: textValue(person.crn),
      },
      {
        key: textValue('Tier'),
        value: textValue(placementRequest?.risks?.tier?.value?.level || 'Not available'),
      },
      {
        key: textValue('Date of birth'),
        value: textValue(DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' })),
      },
    ],
  }
}

export const creationNotificationBody = (
  placement: Cas1SpaceBooking,
  placementRequest: Cas1PlacementRequestDetail,
) => `<ul><li><strong>Approved Premises:</strong> ${placement.premises.name}</li>
<li><strong>Date of application:</strong> ${DateFormats.isoDateToUIDate(placementRequest.applicationDate, { format: 'short' })}</li></ul>
<p>A confirmation email will be sent to the AP and probation practitioner.</p>`

export const creationNotificationBodyNewPlacement = (placement: Cas1SpaceBooking) => `
  <p>A placement has been created for ${displayName(placement.person)} at ${placement.premises.name} from ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate)} to ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate)}.</p>
  <p>The original placement requires changes to the departure date.</p>
`
