import { Cas1SpaceBookingCharacteristic, Cas1SpaceCharacteristic, PlacementCriteria } from '@approved-premises/api'
import { joinWithCommas } from './utils'
import { UiPlacementCriteria, placementCriteriaLabels } from './placementCriteriaUtils'

export const roomCharacteristicMap: Record<Cas1SpaceBookingCharacteristic, string> = {
  isWheelchairDesignated: 'Wheelchair accessible',
  isStepFreeDesignated: 'Step-free',
  hasEnSuite: 'En-suite',
  isSingle: 'Single room',
  isArsonSuitable: 'Suitable for active arson risk',
  isSuitedForSexOffenders: 'Suitable for sexual offence risk',
}

export const getRoomCharacteristicLabel = (characteristic: Cas1SpaceCharacteristic): string => {
  return roomCharacteristicMap[characteristic as Cas1SpaceBookingCharacteristic]
}

export const characteristicsBulletList = (
  requirements: Array<Cas1SpaceCharacteristic | PlacementCriteria>,
  options: { labels?: Record<string, string>; noneText?: string; classes?: string } = {},
): string => {
  const { labels = placementCriteriaLabels, noneText = 'None' } = options

  const listItems = Object.keys(labels).filter(key => ((requirements || []) as Array<string>).includes(key))

  return listItems.length
    ? `<ul class="govuk-list govuk-list--bullet${options.classes ? ` ${options.classes}` : ''}">${listItems.map((key: UiPlacementCriteria) => `<li>${labels[key]}</li>`).join('')}</ul>`
    : `<span class="text-grey">${noneText}</span>`
}

export const roomCharacteristicsInlineList = (
  criteria: Array<keyof typeof roomCharacteristicMap> = [],
  noneLabel: string = 'none',
): string =>
  joinWithCommas(criteria.map(characteristic => roomCharacteristicMap[characteristic].toLowerCase())) || noneLabel
