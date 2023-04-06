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

export const mapApiParamsForUi = (apiParams: BedSearchParameters): BedSearchParametersUi => ({
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

export const summaryCardRows = (
  bedSearchResult: BedSearchResult,
): Array<{ key: { text: string }; value: { html: string } | { text: string } }> => {
  return [
    townRow(bedSearchResult),
    addressRow(bedSearchResult),
    premisesCharacteristicsRow(bedSearchResult),
    roomCharacteristicsRow(bedSearchResult),
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

export const premisesCharacteristicsRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Premises characteristics',
  },
  value: {
    html: mapSearchResultCharacteristicsForUi(bedSearchResult.premises.characteristics),
  },
})

export const roomCharacteristicsRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Room characteristics',
  },
  value: {
    html: mapSearchResultCharacteristicsForUi(bedSearchResult.room.characteristics),
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

export const startDateFromParams = (params: { startDate: string } | ObjectWithDateParts<'startDate'>) => {
  if ('startDate-day' in params && 'startDate-month' in params && 'startDate-year' in params) {
    return DateFormats.dateAndTimeInputsToIsoString(params, 'startDate').startDate
  }
  if ('startDate' in params) return params.startDate
  return undefined
}
