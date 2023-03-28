import {
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  BedSearchResult,
  CharacteristicPair,
} from '../@types/shared'
import { BedSearchParametersUi } from '../@types/ui'
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

export const mapApiCharacteristicForUi = (characteristic: CharacteristicPair) => {
  const result = characteristic.name.startsWith('is') ? characteristic.name.slice(2) : characteristic.name

  if (result.toLocaleUpperCase() === result) return `<li>${result}</li>`
  return `<li>${sentenceCase(result)}</li>`
}

export const mapApiCharacteristicsForUi = (characteristics: Array<CharacteristicPair>) => {
  return `<ul class="govuk-list">${characteristics.map(mapApiCharacteristicForUi).join('')}</ul>`
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
    html: mapApiCharacteristicsForUi(bedSearchResult.premises.characteristics),
  },
})

export const roomCharacteristicsRow = (bedSearchResult: BedSearchResult) => ({
  key: {
    text: 'Room characteristics',
  },
  value: {
    html: mapApiCharacteristicsForUi(bedSearchResult.room.characteristics),
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
