import { translateCharacteristic } from './characteristicsUtils'
import { CharacteristicPair } from '../@types/shared'

describe('characteristicsUtils.translateCharacteristic(CharacteristicPair)', () => {
  describe('when the propertyName is found', () => {
    const propertyNameFoundInTranslation = 'isSingle'
    const successfulTranslation = 'Single room'
    const characteristicWithTranslation = <CharacteristicPair>{
      propertyName: propertyNameFoundInTranslation,
      name: 'Is this a single room?',
    }

    it('returns the translation (in the form of a statement) for the characteristic', () => {
      expect(translateCharacteristic(characteristicWithTranslation)).toEqual(successfulTranslation)
    })
  })

  describe('when the propertyName is NOT found', () => {
    const propertyNameNotFoundInTranslation = 'isRed'
    const characteristicWithoutTranslation = <CharacteristicPair>{
      propertyName: propertyNameNotFoundInTranslation,
      name: 'Is this a a red room?',
    }

    it('returns the propertyName as a (just) human-readable fallback', () => {
      expect(translateCharacteristic(characteristicWithoutTranslation)).toEqual('isRed')
    })
  })
})
