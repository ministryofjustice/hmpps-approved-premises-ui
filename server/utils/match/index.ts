import {
  ApType,
  ApprovedPremisesApplication,
  Cas1PlacementRequestDetail,
  Cas1Premises,
  Cas1PremisesSearchResultSummary,
  type Cas1SpaceBooking,
  Cas1SpaceBookingCharacteristic,
  PlacementCriteria,
  PlacementRequest,
  PlacementRequestDetail,
  ReleaseTypeOption,
  Cas1SpaceCharacteristic as SpaceCharacteristic,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '@approved-premises/api'
import { KeyDetailsArgs, ObjectWithDateParts, SummaryListItem } from '@approved-premises/ui'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
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

export const placementLength = (lengthInDays: number): string => {
  return DateFormats.formatDuration(daysToWeeksAndDays(lengthInDays), ['weeks', 'days'])
}

type SpaceBookingConfirmationData = {
  premises: Cas1Premises
  expectedArrivalDate: string
  actualArrivalDate?: string
  expectedDepartureDate: string
  criteria: Array<Cas1SpaceBookingCharacteristic>
  releaseType?: ReleaseTypeOption
  isWomensApplication?: boolean
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
  } = data

  return [
    summaryListItem('Approved Premises', premises.name),
    summaryListItem('Address', premisesAddress(premises)),
    !isWomensApplication && summaryListItem('AP area', premises.apArea.name),
    summaryListItem('Room criteria', characteristicsBulletList(criteria, { noneText: 'No room criteria' }), 'html'),
    actualArrivalDate
      ? summaryListItem('Actual arrival date', DateFormats.isoDateToUIDate(actualArrivalDate))
      : summaryListItem('Expected arrival date', DateFormats.isoDateToUIDate(expectedArrivalDate)),
    summaryListItem('Expected departure date', DateFormats.isoDateToUIDate(expectedDepartureDate)),
    summaryListItem('Length of stay', DateFormats.durationBetweenDates(expectedDepartureDate, expectedArrivalDate).ui),
    releaseType && summaryListItem('Release type', allReleaseTypes[releaseType]),
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

export const requestedOrEstimatedArrivalDateRow = (isParole: boolean, arrivalDate: string) => ({
  key: {
    text: isParole ? 'Estimated arrival date' : 'Requested arrival date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(arrivalDate),
  },
})

export const departureDateRow = (departureDate: string) => ({
  key: {
    text: 'Requested departure date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(departureDate),
  },
})

export const apTypeRow = (apType: ApType) => ({
  key: {
    text: 'Type of AP',
  },
  value: {
    text: apTypeLongLabels[apType],
  },
})

export const apTypeWithViewTimelineActionRow = (placementRequest: Cas1PlacementRequestDetail) => {
  const apTypeItem = {
    key: {
      text: 'Type of AP',
    },
    value: {
      text: apTypeLongLabels[placementRequest.type],
    },
  }
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
  return {
    key: {
      text: 'Distance',
    },
    value: {
      text: `${roundedDistanceInMiles} miles from ${postcodeArea || 'the desired location'}`,
    },
  }
}

export const releaseTypeRow = (placementRequest: PlacementRequest) => ({
  key: {
    text: 'Release type',
  },
  value: {
    text: allReleaseTypes[placementRequest.releaseType],
  },
})

export const licenceExpiryDateRow = (placementRequest: Cas1PlacementRequestDetail) => {
  let licenceExpiryDate: string | undefined
  if (placementRequest.application && 'licenceExpiryDate' in placementRequest.application) {
    const application = placementRequest.application as ApprovedPremisesApplication
    licenceExpiryDate = application.licenceExpiryDate
  }
  return {
    key: {
      text: 'Licence expiry date',
    },
    value: {
      text: licenceExpiryDate ? DateFormats.isoDateToUIDate(licenceExpiryDate) : '',
    },
  }
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

export const lengthOfStayRow = (lengthInDays: number) => ({
  key: {
    text: 'Length of stay',
  },
  value: {
    text: placementLength(lengthInDays),
  },
})

export const preferredPostcodeRow = (postcodeDistrict: PlacementRequestDetail['location']) => ({
  key: {
    text: 'Preferred postcode',
  },
  value: {
    text: postcodeDistrict,
  },
})

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
  placementRequest: PlacementRequest,
) => `<ul><li><strong>Approved Premises:</strong> ${placement.premises.name}</li>
<li><strong>Date of application:</strong> ${DateFormats.isoDateToUIDate(placementRequest.applicationDate, { format: 'short' })}</li></ul>
<p>A confirmation email will be sent to the AP and probation practitioner.</p>`
