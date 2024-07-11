import { CharacteristicPair } from '@approved-premises/api'
import characteristicLookup from '../i18n/en/characteristics.json'

export const translateCharacteristic = (characteristic: CharacteristicPair): string => {
  return characteristicLookup[characteristic.propertyName] || characteristic.propertyName
}
