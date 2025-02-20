import { characteristicsBulletList, characteristicsPairToCharacteristics } from './characteristicsUtils'
import { Cas1SpaceBookingCharacteristic, CharacteristicPair } from '../@types/shared'

describe('characteristicsUtils', () => {
  describe('characteristicsPairToCharacteristics', () => {
    it('should flatten and filter a list of characteristicPairs', () => {
      const charactisticPairList: Array<CharacteristicPair> = [
        { propertyName: 'isArsonSuitable', name: 'Arson' },
        { propertyName: 'isSingle', name: 'Single' },
        { propertyName: 'NotARoomCharacteristic', name: 'Bad' },
      ]

      const expected: Array<Cas1SpaceBookingCharacteristic> = ['isArsonSuitable', 'isSingle']
      expect(characteristicsPairToCharacteristics(charactisticPairList)).toEqual(expected)
    })
  })

  describe('characteristicsBulletList', () => {
    it('should generate a characteristics bullet list', () => {
      const characteristics: Array<Cas1SpaceBookingCharacteristic> = ['isArsonSuitable', 'isSingle']
      expect(characteristicsBulletList(characteristics)).toEqual(
        '<ul class="govuk-list govuk-list--bullet"><li>Suitable for active arson risk</li><li>Single room</li></ul>',
      )
    })
  })
})
