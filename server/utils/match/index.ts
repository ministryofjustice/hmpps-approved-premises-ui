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
  Cas1SpaceCharacteristic as SpaceCharacteristic,
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '@approved-premises/api'
import {
  KeyDetailsArgs,
  ObjectWithDateParts,
  RadioItem,
  SpaceSearchParametersUi,
  SummaryListItem,
} from '@approved-premises/ui'
import { ParsedQs } from 'qs'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { createQueryString } from '../utils'
import matchPaths from '../../paths/match'
import {
  placementCriteriaLabels,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
  spaceSearchResultsCharacteristicsLabels,
} from '../placementCriteriaUtils'
import { apTypeLabels } from '../apTypeLabels'
import { convertKeyValuePairToRadioItems, summaryListItem } from '../formUtils'
import { textValue } from '../applications/helpers'
import { isFullPerson } from '../personUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { occupancyCriteriaMap } from './occupancy'
import paths from '../../paths/apply'

export { placementDates } from './placementDates'
export { occupancySummary } from './occupancySummary'
export { validateSpaceBooking } from './validateSpaceBooking'

export type SearchFilterCategories = 'apType' | 'offenceAndRisk' | 'placementRequirements'

export const mapUiParamsForApi = (query: SpaceSearchParametersUi): SpaceSearchParameters => {
  return {
    applicationId: query.applicationId,
    startDate: query.startDate,
    targetPostcodeDistrict: query.targetPostcodeDistrict,
    requirements: {
      apTypes: [query.requirements.apType],
      spaceCharacteristics: query.requirements.spaceCharacteristics,
    },
    durationInDays: Number(query.durationInDays),
  }
}

export const placementLength = (lengthInDays: number): string => {
  return DateFormats.formatDuration(daysToWeeksAndDays(lengthInDays), ['weeks', 'days'])
}

export const occupancyViewLink = ({
  placementRequestId,
  premisesId,
  startDate,
  durationDays,
  spaceCharacteristics = [],
}: {
  placementRequestId: string
  premisesId: string
  startDate: string
  durationDays: string
  spaceCharacteristics: Array<Cas1SpaceBookingCharacteristic>
}): string =>
  `${matchPaths.v2Match.placementRequests.search.occupancy({
    id: placementRequestId,
    premisesId,
  })}${createQueryString(
    {
      startDate,
      durationDays,
      criteria: spaceCharacteristics,
    },
    { addQueryPrefix: true, arrayFormat: 'repeat' },
  )}`

export const redirectToSpaceBookingsNew = ({
  placementRequestId,
  premisesId,
  arrivalDate,
  departureDate,
  criteria,
  ...existingQuery
}: ParsedQs & {
  placementRequestId: string
  premisesId: string
  arrivalDate: string
  departureDate: string
  criteria: Array<Cas1SpaceBookingCharacteristic>
}): string => {
  return `${matchPaths.v2Match.placementRequests.spaceBookings.new({
    id: placementRequestId,
    premisesId,
  })}${createQueryString(
    { arrivalDate, departureDate, criteria, ...existingQuery },
    {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    },
  )}`
}

export const spaceBookingConfirmationSummaryListRows = (
  placementRequest: PlacementRequestDetail,
  premises: Cas1Premises,
  arrivalDate: string,
  departureDate: string,
  criteria: Array<Cas1SpaceBookingCharacteristic>,
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
    summaryListItem('Release type', allReleaseTypes[placementRequest.releaseType]),
  ]
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

export const filterToSpaceBookingCharacteristics = (
  requirements: Array<PlacementCriteria>,
): Array<Cas1SpaceBookingCharacteristic> => {
  const characteristics = Object.keys(occupancyCriteriaMap)
  return requirements.filter(requirement =>
    characteristics.includes(requirement),
  ) as Array<Cas1SpaceBookingCharacteristic>
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

export const groupedCriteria = {
  offenceAndRisk: {
    title: 'AP requirements',
    items: spaceSearchCriteriaApLevelLabels,
    inputName: 'spaceCharacteristics',
  },
  accessNeeds: {
    title: 'Room requirements',
    items: spaceSearchCriteriaRoomLevelLabels,
    inputName: 'spaceCharacteristics',
  },
}

export const groupedCheckboxes = () => {
  return Object.keys(groupedCriteria).reduce((obj, k: SearchFilterCategories) => {
    return {
      ...obj,
      [`${groupedCriteria[k].title}`]: {
        inputName: groupedCriteria[k].inputName,
        items: groupedCriteria[k].items,
      },
    }
  }, {})
}

export const checkBoxesForCriteria = (criteria: Record<string, string>, selectedValues: Array<string> = []) => {
  return Object.keys(criteria)
    .map(criterion => ({
      id: criterion,
      text: criteria[criterion],
      value: criterion,
      checked: selectedValues.includes(criterion),
    }))
    .filter(item => item.text.length > 0)
}

export const apTypeLabelsForRadioInput = (selectedValue: ApType) => {
  const apTypeRadios = convertKeyValuePairToRadioItems(apTypeLabels, selectedValue) as Array<
    RadioItem | { divider: 'or' }
  >
  apTypeRadios.splice(1, 0, { divider: 'or' })
  return apTypeRadios
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
