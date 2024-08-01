import { addDays, weeksToDays } from 'date-fns'
import {
  ApType,
  Gender,
  PlacementCriteria,
  PlacementRequestDetail,
  Cas1SpaceCharacteristic as SpaceCharacteristic,
  Cas1SpaceSearchParameters as SpaceSearchParameters,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '../@types/shared'
import { KeyDetailsArgs, ObjectWithDateParts, SpaceSearchParametersUi, SummaryListItem } from '../@types/ui'
import { DateFormats, daysToWeeksAndDays } from './dateUtils'
import { createQueryString, sentenceCase } from './utils'
import matchPaths from '../paths/match'
import {
  offenceAndRiskCriteriaLabels,
  placementCriteriaLabels,
  placementRequirementCriteriaLabels,
} from './placementCriteriaUtils'
import { apTypeLabels } from './apTypeLabels'
import { convertKeyValuePairToRadioItems } from './formUtils'
import { textValue } from './applications/helpers'
import { isFullPerson } from './personUtils'

type PlacementDates = {
  placementLength: number
  startDate: string
  endDate: string
}

export class InvalidSpaceSearchDataException extends Error {}

export type SearchFilterCategories = 'apType' | 'offenceAndRisk' | 'placementRequirements'

export const mapUiParamsForApi = (query: SpaceSearchParametersUi): SpaceSearchParameters => {
  const durationInDays = weeksToDays(Number(query.durationWeeks)) + Number(query.durationDays)
  return {
    startDate: query.startDate,
    targetPostcodeDistrict: query.targetPostcodeDistrict,
    requirements: {
      apTypes: [query.requirements.apType],
      genders: [query.requirements.gender],
      spaceCharacteristics: query.requirements.spaceCharacteristics,
    },
    durationInDays,
  }
}

export const mapSearchParamCharacteristicsForUi = (characteristics: Array<string>) => {
  return `<ul class="govuk-list">${characteristics
    .map(characteristicPair => `<li>${placementCriteriaLabels[characteristicPair]}</li>`)
    .join('')}</ul>`
}

export const encodeSpaceSearchResult = (spaceSearchResult: SpaceSearchResult): string => {
  const json = JSON.stringify(spaceSearchResult)

  return Buffer.from(json).toString('base64')
}

export const decodeSpaceSearchResult = (string: string): SpaceSearchResult => {
  const json = Buffer.from(string, 'base64').toString('utf-8')
  const obj = JSON.parse(json)

  if ('premises' in obj) {
    return obj as SpaceSearchResult
  }

  throw new InvalidSpaceSearchDataException()
}

export const placementLength = (lengthInDays: number): string => {
  return DateFormats.formatDuration(daysToWeeksAndDays(lengthInDays), ['weeks', 'days'])
}

export const placementDates = (startDateString: string, lengthInDays: string): PlacementDates => {
  const days = Number(lengthInDays)
  const startDate = DateFormats.isoToDateObj(startDateString)
  const endDate = addDays(startDate, days)

  return {
    placementLength: days,
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
  }
}

export const summaryCardLink = ({
  spaceSearchResult,
  placementRequestId,
  startDate,
  durationWeeks,
  durationDays,
}: {
  spaceSearchResult: SpaceSearchResult
  placementRequestId: string
  startDate: string
  durationDays: string
  durationWeeks: string
}): string => {
  const duration = String(Number(durationWeeks) * 7 + Number(durationDays))
  return `${matchPaths.placementRequests.bookings.confirm({ id: placementRequestId })}${createQueryString(
    {
      spaceSearchResult: encodeSpaceSearchResult(spaceSearchResult),
      startDate,
      duration,
    },
    { addQueryPrefix: true },
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

export const spaceBookingSummaryCardRows = (
  premisesName: string,
  apType: ApType,
  dates: PlacementDates,
  gender: Gender,
  essentialCharacteristics: Array<PlacementCriteria>,
  desirableCharacteristics: Array<PlacementCriteria>,
): Array<SummaryListItem> => {
  return [
    premisesNameRow(premisesName),
    apTypeRow(apType),
    arrivalDateRow(dates.startDate),
    departureDateRow(dates.endDate),
    placementLengthRow(dates.placementLength),
    genderRow(gender),
    essentialCharacteristicsRow(essentialCharacteristics),
    desirableCharacteristicsRow(desirableCharacteristics),
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

export const requirementsHtmlString = (requirements: Array<PlacementCriteria>): string => {
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
    townRow(spaceSearchResult),
    distanceRow(spaceSearchResult, postcodeArea),
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

export const townRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Town',
  },
  value: {
    text: spaceSearchResult.premises.town,
  },
})

export const addressRow = (spaceSearchResult: SpaceSearchResult) => ({
  key: {
    text: 'Address',
  },
  value: {
    text: `${spaceSearchResult.premises.addressLine1} ${spaceSearchResult.premises.addressLine2}`,
  },
})

export const distanceRow = (spaceSearchResult: SpaceSearchResult, postcodeArea?: string) => ({
  key: {
    text: 'Distance',
  },
  value: {
    text: `${spaceSearchResult.distanceInMiles} miles from ${postcodeArea || 'the desired location'}`,
  },
})

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
    title: 'Risks and offences',
    items: offenceAndRiskCriteriaLabels,
    inputName: 'spaceCharacteristics',
  },
  accessNeeds: {
    title: 'AP & room characteristics',
    items: placementRequirementCriteriaLabels,
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
  return convertKeyValuePairToRadioItems(apTypeLabels, selectedValue)
}

export const lengthOfStayRow = (lengthInDays: number) => ({
  key: {
    text: 'Length of stay',
  },
  value: {
    text: placementLength(lengthInDays),
  },
})

export const postcodeRow = (postcodeDistrict: PlacementRequestDetail['location']) => ({
  key: {
    text: 'Postcode',
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
    postcodeRow(placementRequest.location),
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
