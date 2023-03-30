import { BedSearchParametersUi } from '../@types/ui'
import { apCharacteristicPairFactory, bedSearchParametersFactory, bedSearchResultFactory } from '../testutils/factories'
import {
  addressRow,
  bedCountRow,
  mapApiCharacteristicForUi,
  mapApiParamsForUi,
  mapUiParamsForApi,
  premisesCharacteristicsRow,
  roomCharacteristicsRow,
  summaryCardRows,
  townRow,
} from './matchUtils'

describe('matchUtils', () => {
  describe('mapUiParamsForApi', () => {
    it('converts string properties to numbers', () => {
      const uiParams = bedSearchParametersFactory
        .onCreate(mapApiParamsForUi)
        .build() as unknown as BedSearchParametersUi

      expect(mapUiParamsForApi(uiParams)).toEqual({
        ...uiParams,
        durationDays: Number(uiParams.durationDays),
        maxDistanceMiles: Number(uiParams.maxDistanceMiles),
      })
    })
  })

  describe('mapApiParamsForUi', () => {
    const apiParams = bedSearchParametersFactory.build()

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

  describe('summaryCardsRow', () => {
    it('calls the correct row functions', () => {
      const bedSearchResult = bedSearchResultFactory.build()
      expect(summaryCardRows(bedSearchResult.results[0])).toEqual([
        townRow(bedSearchResult.results[0]),
        addressRow(bedSearchResult.results[0]),
        premisesCharacteristicsRow(bedSearchResult.results[0]),
        roomCharacteristicsRow(bedSearchResult.results[0]),
        bedCountRow(bedSearchResult.results[0]),
      ])
    })
  })
})
