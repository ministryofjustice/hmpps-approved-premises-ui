import {
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  BedSearchResult,
  CharacteristicPair,
} from '../@types/shared'
import { BedSearchParametersUi, ObjectWithDateParts } from '../@types/ui'
import { DateFormats } from './dateUtils'
import { sentenceCase } from './utils'

export const mapUiParamsForApi = (query: BedSearchParametersUi): BedSearchParameters => ({
  ...query,
  durationDays: Number(query.durationDays),
  maxDistanceMiles: Number(query.maxDistanceMiles),
})

export const mapApiParamsForUi = (apiParams: BedSearchParameters): Partial<BedSearchParametersUi> => ({
  ...apiParams,
  durationDays: apiParams.durationDays.toString(),
  maxDistanceMiles: apiParams.maxDistanceMiles.toString(),
})

export const translateApiCharacteristicForUi = (characteristic: string) => {
  const result = characteristic.startsWith('is') ? characteristic.slice(2) : characteristic
  if (['esap', 'pipe', 'iap'].includes(result)) return `${characteristic.toUpperCase()}`
  if (result.toLocaleUpperCase() === result) return `${result}`
  return `${sentenceCase(result)}`
}

export const mapSearchResultCharacteristicsForUi = (characteristics: Array<CharacteristicPair>) => {
  return mapSearchParamCharacteristicsForUi(characteristics.map(characteristicPair => characteristicPair.name))
}

export const mapSearchParamCharacteristicsForUi = (characteristics: Array<string>) => {
  return `<ul class="govuk-list">${characteristics
    .map(characteristicPair => `<li>${translateApiCharacteristicForUi(characteristicPair)}</li>`)
    .join('')}</ul>`
}

export const matchedCharacteristics = (bedSearchResult: BedSearchResult, requiredCharacteristics: Array<string>) => {
  const characteristics = requiredCharacteristics.filter(characteristic =>
    bedSearchResult.premises.characteristics.map(c => c.name).includes(characteristic),
  )

  return mapSearchParamCharacteristicsForUi(characteristics)
}

export const unmatchedCharacteristics = (bedSearchResult: BedSearchResult, requiredCharacteristics: Array<string>) => {
  const characteristics = requiredCharacteristics.filter(
    characteristic => !bedSearchResult.premises.characteristics.map(c => c.name).includes(characteristic),
  )

  return mapSearchParamCharacteristicsForUi(characteristics)
}

export const summaryCardRows = (
  bedSearchResult: BedSearchResult,
  requiredCharacteristics: Array<string>,
): Array<{ key: { text: string }; value: { html: string } | { text: string } }> => {
  return [
    townRow(bedSearchResult),
    addressRow(bedSearchResult),
    matchedCharacteristicsRow(bedSearchResult, requiredCharacteristics),
    additionalCharacteristicsRow(bedSearchResult, requiredCharacteristics),
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

export const matchedCharacteristicsRow = (
  bedSearchResult: BedSearchResult,
  requiredCharacteristics: Array<string> = [],
) => ({
  key: {
    text: 'Matched characteristics',
  },
  value: {
    html: matchedCharacteristics(bedSearchResult, requiredCharacteristics),
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
    html: unmatchedCharacteristics(bedSearchResult, requiredCharacteristics),
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

export const searchFilter = (placementCriteria: Array<string>, selectedValues: Array<string>) =>
  placementCriteria.map(criterion => ({
    text: translateApiCharacteristicForUi(criterion),
    value: criterion,
    checked: selectedValues.includes(criterion),
  }))
