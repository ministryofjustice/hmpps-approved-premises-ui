import bedSearchParameters from '../testutils/factories/bedSearchParameters'
import { mapApiParamsForUi, mapUiParamsForApi } from './matchUtils'

describe('matchUtils', () => {
  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = mapApiParamsForUi(bedSearchParameters.build())

      expect(mapUiParamsForApi(uiParams)).toEqual({
        ...uiParams,
        durationDays: Number(uiParams.durationDays),
        maxDistanceMiles: Number(uiParams.maxDistanceMiles),
      })
    })
  })

  describe('mapApiParamsForUi', () => {
    const apiParams = bedSearchParameters.build()

    expect(mapApiParamsForUi(apiParams)).toEqual({
      ...apiParams,
      durationDays: apiParams.durationDays.toString(),
      maxDistanceMiles: apiParams.maxDistanceMiles.toString(),
    })
  })
})
