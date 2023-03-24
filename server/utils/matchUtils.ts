import { ApprovedPremisesBedSearchParameters as BedSearchParameters } from '../@types/shared'
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
