import { ApprovedPremisesBedSearchParameters as BedSearchParameters, CharacteristicPair } from '../@types/shared'
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
