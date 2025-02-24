import { Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic, CharacteristicPair } from '@approved-premises/api'
import { joinWithCommas, makeArrayOfType } from './utils'

export const roomCharacteristicMap: Record<Cas1SpaceBookingCharacteristic, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSingle: 'Single room',
  isArsonSuitable: 'Suitable for active arson risk',
  isSuitedForSexOffenders: 'Suitable for sexual offence risk',
}

export const characteristicsPairToCharacteristics = (
  characteristicPairs: Array<CharacteristicPair>,
): Array<Cas1SpaceCharacteristic> =>
  (makeArrayOfType<CharacteristicPair>(characteristicPairs) || [])
    .map(({ propertyName }) => (roomCharacteristicMap[propertyName] ? propertyName : null) as Cas1SpaceCharacteristic)
    .filter(Boolean)

export const characteristicsBulletList = (characteristics: Array<Cas1SpaceCharacteristic>): string =>
  `<ul class="govuk-list govuk-list--bullet">${characteristics
    .filter(characteristic => roomCharacteristicMap[characteristic])
    .map(characteristic => `<li>${roomCharacteristicMap[characteristic]}</li>`)
    .join('')}</ul>`

export const characteristicsInlineList = (criteria: Array<Cas1SpaceCharacteristic>): string =>
  joinWithCommas(criteria.map(characteristic => roomCharacteristicMap[characteristic].toLowerCase()))
