import { differenceInDays } from 'date-fns'
import {
  ApType,
  ApprovedPremisesApplication,
  Cas1Premises,
  Cas1PremisesSearchResultSummary,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceCharacteristic,
  PlacementCriteria,
  PlacementRequest,
  PlacementRequestDetail,
  ReleaseTypeOption,
  Cas1SpaceCharacteristic as SpaceCharacteristic,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '@approved-premises/api'
import { KeyDetailsArgs, ObjectWithDateParts, SummaryListItem } from '@approved-premises/ui'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { placementCriteriaLabels } from '../placementCriteriaUtils'
import { apTypeLabels } from '../apTypeLabels'
import { summaryListItem } from '../formUtils'
import { textValue } from '../applications/helpers'
import { isFullPerson } from '../personUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import paths from '../../paths/apply'
import { spaceSearchResultsCharacteristicsLabels } from './spaceSearch'

export { placementDates } from './placementDates'
export { occupancySummary } from './occupancySummary'
export { validateSpaceBooking } from './validateSpaceBooking'
export type { SpaceSearchState } from './spaceSearch'

export const placementLength = (lengthInDays: number): string => {
  return DateFormats.formatDuration(daysToWeeksAndDays(lengthInDays), ['weeks', 'days'])
}

export const spaceBookingConfirmationSummaryListRows = (
  premises: Cas1Premises,
  arrivalDate: string,
  departureDate: string,
  criteria: Array<Cas1SpaceBookingCharacteristic>,
  releaseType?: ReleaseTypeOption,
): Array<SummaryListItem> => {
  return [
    summaryListItem('Approved Premises', premises.name),
    summaryListItem('Address', premisesAddress(premises)),
    summaryListItem('Space type', requirementsHtmlString(criteria), 'html'),
    summaryListItem('Arrival date', DateFormats.isoDateToUIDate(arrivalDate)),
    summaryListItem('Departure date', DateFormats.isoDateToUIDate(departureDate)),
    summaryListItem(
      'Length of stay',
      DateFormats.formatDuration(daysToWeeksAndDays(differenceInDays(departureDate, arrivalDate))),
    ),
    releaseType ? summaryListItem('Release type', allReleaseTypes[releaseType]) : undefined,
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

export const requirementsHtmlString = (
  requirements: Array<Cas1SpaceCharacteristic | PlacementCriteria>,
  labels: Record<string, string> = placementCriteriaLabels,
): string => {
  const listItems = Object.keys(labels)
    .filter(key => (requirements as Array<string>).includes(key))
    .map(key => `<li>${labels[key]}</li>`)

  return `<ul class="govuk-list govuk-list--bullet">${listItems.join('')}</ul>`
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
    text: 'Expected departure date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(departureDate),
  },
})

export const summaryCardRows = (spaceSearchResult: SpaceSearchResult, postcodeArea: string): Array<SummaryListItem> => {
  return [
    apTypeRow(spaceSearchResult.premises.apType),
    addressRow(spaceSearchResult),
    distanceRow(spaceSearchResult, postcodeArea),
    characteristicsRow(spaceSearchResult),
  ]
}

export const apTypeRow = (apType: ApType) => ({
  key: {
    text: 'Type of AP',
  },
  value: {
    text: apTypeLabels[apType],
  },
})

export const apTypeWithViewTimelineActionRow = (placementRequest: PlacementRequestDetail) => {
  const apTypeItem = {
    key: {
      text: 'Type of AP',
    },
    value: {
      text: apTypeLabels[placementRequest.type],
    },
  }
  if (placementRequest.application) {
    return {
      ...apTypeItem,
      actions: {
        items: [
          {
            href: `${paths.applications.show({ id: placementRequest.application.id })}?tab=timeline`,
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

export const characteristicsRow = (spaceSearchResult: SpaceSearchResult) => {
  return {
    key: { text: 'Suitable for' },
    value: {
      html: requirementsHtmlString(spaceSearchResult.premises.characteristics, spaceSearchResultsCharacteristicsLabels),
    },
  }
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

export const licenceExpiryDateRow = (placementRequest: PlacementRequestDetail) => {
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
  if (params['startDate-day'] && params['startDate-month'] && params['startDate-year']) {
    return {
      ...DateFormats.dateAndTimeInputsToIsoString(params as ObjectWithDateParts<'startDate'>, 'startDate'),
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

export const keyDetails = (placementRequest: PlacementRequestDetail): KeyDetailsArgs => {
  const { person } = placementRequest
  if (!isFullPerson(person)) throw Error('Restricted person')
  return {
    header: {
      key: 'Name',
      value: person.name,
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
