import { addDays, differenceInDays } from 'date-fns'
import type {
  ApType,
  ApprovedPremisesApplication,
  Cas1Premises,
  Cas1SpaceBookingCharacteristic,
  Gender,
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
import { createQueryString, sentenceCase } from '../utils'
import matchPaths from '../../paths/match'
import {
  placementCriteriaLabels,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
} from '../placementCriteriaUtils'
import { apTypeLabels } from '../apTypeLabels'
import { convertKeyValuePairToRadioItems, summaryListItem } from '../formUtils'
import { textValue } from '../applications/helpers'
import { isFullPerson } from '../personUtils'
import { preferredApsRow } from '../placementRequests/preferredApsRow'
import { placementRequirementsRow } from '../placementRequests/placementRequirementsRow'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { placementDates } from './placementDates'
import { occupancyCriteriaMap } from './occupancy'
import paths from '../../paths/apply'

export { placementDates } from './placementDates'
export { occupancySummary } from './occupancySummary'
export { validateSpaceBooking } from './validateSpaceBooking'

type PlacementDates = {
  placementLength: number
  startDate: string
  endDate: string
}

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

export const confirmationSummaryCardRows = (
  spaceSearchResult: SpaceSearchResult,
  dates: PlacementDates,
): Array<SummaryListItem> => {
  return [
    premisesNameRow(spaceSearchResult.premises.name),
    arrivalDateRow(dates.startDate),
    departureDateRow(dates.endDate),
    placementLengthRow(dates.placementLength),
  ]
}

export const spaceBookingPremisesSummaryCardRows = (premisesName: string, apType: ApType): Array<SummaryListItem> => {
  return [premisesNameRow(premisesName), apTypeRow(apType)]
}

export const spaceBookingPersonNeedsSummaryCardRows = (
  dates: PlacementDates,
  gender: Gender,
  essentialCharacteristics: Array<PlacementCriteria>,
  desirableCharacteristics: Array<PlacementCriteria>,
): Array<SummaryListItem> => {
  return [
    arrivalDateRow(dates.startDate),
    departureDateRow(dates.endDate),
    placementLengthRow(dates.placementLength),
    genderRow(gender),
    essentialCharacteristicsRow(essentialCharacteristics),
    desirableCharacteristicsRow(desirableCharacteristics),
  ]
}

export const occupancyViewSummaryListForMatchingDetails = (
  totalCapacity: number,
  placementRequest: PlacementRequestDetail,
  managerDetails: string,
): Array<SummaryListItem> => {
  const placementRequestDates = placementDates(placementRequest.expectedArrival, placementRequest.duration)
  const essentialCharacteristics = filterOutAPTypes(placementRequest.essentialCriteria)
  return [
    arrivalDateRow(placementRequestDates.startDate),
    departureDateRow(placementRequestDates.endDate),
    placementLengthRow(placementRequestDates.placementLength),
    releaseTypeRow(placementRequest),
    licenceExpiryDateRow(placementRequest),
    totalCapacityRow(totalCapacity),
    apManagerDetailsRow(managerDetails),
    spaceRequirementsRow(essentialCharacteristics),
  ]
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
    summaryListItem('Address', premises.fullAddress),
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

export const requirementsHtmlString = (requirements: Array<SpaceCharacteristic | PlacementCriteria>): string => {
  let htmlString = ''
  requirements.forEach(requirement => {
    htmlString += `<li>${placementCriteriaLabels[requirement]}</li>`
  })
  return `<ul class="govuk-list">${htmlString}</ul>`
}

export const premisesNameRow = (premisesName: string) => ({
  key: {
    text: 'Approved Premises',
  },
  value: {
    text: premisesName,
  },
})

export const arrivalDateRow = (arrivalDate: string) => ({
  key: {
    text: 'Expected arrival date',
  },
  value: {
    text: DateFormats.isoDateToUIDate(arrivalDate),
  },
})

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

export const placementLengthRow = (length: number) => ({
  key: {
    text: 'Placement length',
  },
  value: {
    text: placementLength(length),
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

export const addressRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Address',
  },
  value: {
    html: `<p>
           ${spaceSearchResult.premises.addressLine1} ${spaceSearchResult.premises.addressLine2 || ''}<br/>
           ${spaceSearchResult.premises?.town}<br/>
           ${spaceSearchResult.premises?.postcode}</p>`,
  },
})

export const characteristicsRow = (spaceSearchResult: SpaceSearchResult) => {
  return {
    key: { text: 'Characteristics' },
    value: {
      html: `<ul class="govuk-list govuk-list--bullet">${spaceSearchResult.premises.premisesCharacteristics.map(characteristic => `<li>${characteristic.name}</li>`).join(' ')}</ul>`,
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

export const genderRow = (gender: Gender) => ({
  key: {
    text: 'Gender',
  },
  value: {
    text: sentenceCase(gender),
  },
})

export const essentialCharacteristicsRow = (essentialCharacteristics: Array<PlacementCriteria>) => ({
  key: {
    text: 'Essential characteristics',
  },
  value: {
    html: requirementsHtmlString(essentialCharacteristics),
  },
})

export const desirableCharacteristicsRow = (desirableCharacteristics: Array<PlacementCriteria>) => ({
  key: {
    text: 'Desirable characteristics',
  },
  value: {
    html: requirementsHtmlString(desirableCharacteristics),
  },
})

export const totalCapacityRow = (totalCapacity: number) => ({
  key: {
    text: 'Total capacity',
  },
  value: {
    text: `${totalCapacity} spaces`,
  },
})

export const apManagerDetailsRow = (apManagerDetails: string) => ({
  key: {
    text: 'AP manager details',
  },
  value: {
    text: apManagerDetails,
  },
})

export const spaceRequirementsRow = (essentialCharacteristics: Array<SpaceCharacteristic>) => ({
  key: {
    text: 'Space requirements',
  },
  value: {
    html: requirementsHtmlString(essentialCharacteristics),
  },
})

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

export const calculateDepartureDate = (startDate: string, lengthInDays: number): Date => {
  return addDays(DateFormats.isoToDateObj(startDate), lengthInDays)
}

export const placementRequestSummaryListForMatching = (placementRequest: PlacementRequestDetail) => {
  const rows: Array<SummaryListItem> = [
    arrivalDateRow(placementRequest.expectedArrival),
    departureDateRow(
      DateFormats.dateObjToIsoDate(calculateDepartureDate(placementRequest.expectedArrival, placementRequest.duration)),
    ),
    lengthOfStayRow(placementRequest.duration),
    preferredPostcodeRow(placementRequest.location),
    apTypeRow(placementRequest.type),
  ]

  const preferredAps = preferredApsRow(placementRequest)

  if (preferredAps) {
    rows.push(preferredAps)
  }

  rows.push(placementRequirementsRow(placementRequest, 'essential'))
  rows.push(placementRequirementsRow(placementRequest, 'desirable'))

  return rows
}

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
