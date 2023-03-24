import bedSearchParameters from '../testutils/factories/bedSearchParameters'
import { characteristicPairFactory } from '../testutils/factories/bedSearchResult'
import { mapApiCharacteristicForUi, mapApiParamsForUi, mapUiParamsForApi } from './matchUtils'

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

  describe('mapApiCharacteristicForUi', () => {
    it('if the characteristic name is defined it is returned in a human readable format', () => {
      const esap = characteristicPairFactory.build({ name: 'isESAP' })
      const iap = characteristicPairFactory.build({ name: 'isIAP' })
      const pipe = characteristicPairFactory.build({ name: 'isPIPE' })

      expect(mapApiCharacteristicForUi(esap)).toBe('ESAP')
      expect(mapApiCharacteristicForUi(iap)).toBe('IAP')
      expect(mapApiCharacteristicForUi(pipe)).toBe('PIPE')
    })

    it('if the characteristic name is not a member of the dictionary it is returned as is', () => {
      const notRecognised = characteristicPairFactory.build({ name: 'notRecognised' })

      expect(mapApiCharacteristicForUi(notRecognised)).toBe('notRecognised')
    })
  })
})
