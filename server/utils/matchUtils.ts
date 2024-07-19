import { addDays, weeksToDays } from 'date-fns'
import {
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  BedSearchResult,
  Cas1SpaceSearchResults,
  CharacteristicPair,
  Cas1SpaceSearchResult as SpaceSearchResult,
} from '../@types/shared'
import { BedSearchParametersUi, ObjectWithDateParts, SummaryListItem } from '../@types/ui'
import { DateFormats, daysToWeeksAndDays } from './dateUtils'
import { linkTo } from './utils'
import matchPaths from '../paths/match'
import {
  offenceAndRiskCriteriaLabels,
  placementCriteriaLabels,
  placementRequirementCriteriaLabels,
  specialistApTypeCriteriaLabels,
} from './placementCriteriaUtils'

type PlacementDates = {
  placementLength: number
  startDate: string
  endDate: string
}

export class InvalidSpaceSearchDataException extends Error {}

export type SearchFilterCategories = 'apType' | 'offenceAndRisk' | 'placementRequirements'

const groupedCriteria = {
  apType: { title: 'Type of AP', options: specialistApTypeCriteriaLabels },
  placementRequirements: { title: 'Placement Requirements', options: placementRequirementCriteriaLabels },
  offenceAndRisk: { title: 'Risks and offences to consider', options: offenceAndRiskCriteriaLabels },
}

export const mapUiParamsForApi = (query: BedSearchParametersUi): BedSearchParameters => {
  const durationDays = weeksToDays(Number(query.durationWeeks)) + Number(query.durationDays)
  return {
    ...query,
    durationDays,
    maxDistanceMiles: Number(query.maxDistanceMiles),
    serviceName: 'approved-premises',
  }
}

export const mapSearchParamCharacteristicsForUi = (characteristics: Array<string>) => {
  return `<ul class="govuk-list">${characteristics
    .map(characteristicPair => `<li>${placementCriteriaLabels[characteristicPair]}</li>`)
    .join('')}</ul>`
}

export const matchedCharacteristics = (
  actualCharacteristics: Array<CharacteristicPair>,
  requiredCharacteristics: Array<string>,
) => {
  const characteristics = requiredCharacteristics.filter(characteristic =>
    actualCharacteristics.map(c => c.propertyName).includes(characteristic),
  )

  return mapSearchParamCharacteristicsForUi(characteristics)
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

export const summaryCardHeader = ({
  bedSearchResult,
  placementRequestId,
  startDate,
  durationWeeks,
  durationDays,
}: {
  bedSearchResult: BedSearchResult
  placementRequestId: string
  startDate: string
  durationDays: string
  durationWeeks: string
}): string => {
  const duration = String(Number(durationWeeks) * 7 + Number(durationDays))
  return linkTo(
    matchPaths.placementRequests.bookings.confirm,
    {
      id: placementRequestId,
    },
    {
      text: `${bedSearchResult.premises.name} (Bed ${bedSearchResult.bed.name})`,
      query: {
        bedSearchResult: encodeSpaceSearchResult(bedSearchResult),
        startDate,
        duration,
      },
    },
  )
}

export const confirmationSummaryCardRows = (
  bedSearchResult: BedSearchResult,
  dates: PlacementDates,
): Array<SummaryListItem> => {
  return [
    premisesNameRow(bedSearchResult),
    bedNameRow(bedSearchResult),
    arrivalDateRow(dates.startDate),
    departureDateRow(dates.endDate),
    placementLengthRow(dates.placementLength),
  ]
}

export const premisesNameRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Approved Premises',
  },
  value: {
    text: bedSearchResult.premises.name,
  },
})

export const bedNameRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Bed',
  },
  value: {
    text: bedSearchResult.bed.name,
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

export const summaryCardRows = (
  spaceSearchResult: SpaceSearchResult,
  requiredCharacteristics: Array<string>,
): Array<SummaryListItem> => {
  return [
    townRow(bedSearchResult),
    addressRow(bedSearchResult),
    bedCountRow(bedSearchResult),
  ]
}

export const townRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Town',
  },
  value: {
    text: bedSearchResult.premises.town,
  },
})

export const addressRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Address',
  },
  value: {
    text: `${bedSearchResult.premises.addressLine1} ${bedSearchResult.premises.addressLine2}`,
  },
})
  },
})

export const additionalCharacteristicsRow = (
  bedSearchResult: BedSearchResult,
  requiredCharacteristics: Array<string> = [],
) => ({
  key: {
    text: 'Additional characteristics',
  },
  value: {
    html: unmatchedCharacteristics(bedSearchResult.premises.characteristics, requiredCharacteristics),
  },
})

export const bedCountRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Bed count',
  },
  value: {
    text: bedSearchResult.premises.bedCount.toString(),
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

export const groupedEssentialCriteria = (essentialCriteria: Array<string>) => {
  return Object.keys(groupedCriteria).reduce((obj, k: SearchFilterCategories) => {
    const selectedCriteria = selectedEssentialCriteria(groupedCriteria[k].options, essentialCriteria)
    if (selectedCriteria.length) {
      return {
        ...obj,
        [`${groupedCriteria[k].title}`]: selectedCriteria,
      }
    }
    return obj
  }, {})
}

export const selectedEssentialCriteria = (criteria: Record<string, string>, selectedCriteria: Array<string>) => {
  return selectedCriteria.filter(key => key in criteria).map(key => criteria[key])
}

export const groupedCheckboxes = (selectedValues: Array<string>) => {
  return Object.keys(groupedCriteria).reduce((obj, k: SearchFilterCategories) => {
    return {
      ...obj,
      [`${groupedCriteria[k].title}`]: checkBoxesForCriteria(groupedCriteria[k].options, selectedValues),
    }
  }, {})
}

export const checkBoxesForCriteria = (criteria: Record<string, string>, selectedValues: Array<string>) => {
  return Object.keys(criteria)
    .map(criterion => ({
      id: criterion,
      text: criteria[criterion],
      value: criterion,
      checked: selectedValues.includes(criterion),
    }))
    .filter(item => item.text.length > 0)
}
