import { BedSearchParametersUi } from '../@types/ui'
import bedSearchParameters from '../testutils/factories/bedSearchParameters'
import { apCharacteristicPairFactory } from '../testutils/factories/bedSearchResult'
import { mapApiCharacteristicForUi, mapApiParamsForUi, mapUiParamsForApi } from './matchUtils'

describe('matchUtils', () => {
  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = bedSearchParameters.onCreate(mapApiParamsForUi).build() as unknown as BedSearchParametersUi

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

  describe('mapApiCharacteristicForUi', () => {
    it('if the characteristic name is defined it is returned in a human readable format', () => {
      const esap = apCharacteristicPairFactory.build({ name: 'isESAP' })
      const iap = apCharacteristicPairFactory.build({ name: 'isIAP' })
      const pipe = apCharacteristicPairFactory.build({ name: 'isPIPE' })

      expect(mapApiCharacteristicForUi(esap)).toBe('<li>ESAP</li>')
      expect(mapApiCharacteristicForUi(iap)).toBe('<li>IAP</li>')
      expect(mapApiCharacteristicForUi(pipe)).toBe('<li>PIPE</li>')
    })
  })
})
