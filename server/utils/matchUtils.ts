import { ApprovedPremisesBedSearchParameters as BedSearchParameters, CharacteristicPair } from '../@types/shared'
import { BedSearchParametersUi } from '../@types/ui'

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
  const result = { isPIPE: 'PIPE', isESAP: 'ESAP', isIAP: 'IAP' }[characteristic.name]

  return result ?? characteristic.name
}
