import { characteristicsBulletList, roomCharacteristicMap, roomCharacteristicsInlineList } from './characteristicsUtils'
import { Cas1SpaceBookingCharacteristic } from '../@types/shared'
import { cas1PlacementRequestDetailFactory } from '../testutils/factories'
import { placementCriteriaLabels } from './placementCriteriaUtils'

describe('characteristicsUtils', () => {
  describe('characteristicsBulletList', () => {
    const placementRequest = cas1PlacementRequestDetailFactory.build({
      essentialCriteria: ['hasBrailleSignage', 'hasHearingLoop', 'isStepFreeDesignated'],
      desirableCriteria: ['isArsonSuitable'],
    })

    it('should return HTML lists of the given requirements', () => {
      expect(characteristicsBulletList(placementRequest.essentialCriteria)).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${placementCriteriaLabels.isStepFreeDesignated}</li>
          <li>${placementCriteriaLabels.hasBrailleSignage}</li>
          <li>${placementCriteriaLabels.hasHearingLoop}</li>
        </ul>
      `)
      expect(characteristicsBulletList(placementRequest.desirableCriteria)).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${placementCriteriaLabels.isArsonSuitable}</li>
        </ul>
      `)
    })

    it('should only render requirements that exist in the provided labels', () => {
      const result = characteristicsBulletList(placementRequest.essentialCriteria, { labels: roomCharacteristicMap })

      expect(result).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet">
          <li>${roomCharacteristicMap.isStepFreeDesignated}</li>
        </ul>
      `)
    })

    it('should return the default "none" html if the list is empty', () => {
      expect(characteristicsBulletList([])).toEqual(`<span class="text-grey">None</span>`)
    })

    it('should return the default "none" html if the list does not have any items from the labels', () => {
      expect(
        characteristicsBulletList(['isPIPE', 'acceptsNonSexualChildOffenders'], { labels: roomCharacteristicMap }),
      ).toEqual(`<span class="text-grey">None</span>`)
    })

    it('should return the specific text provided if the list is empty', () => {
      expect(characteristicsBulletList([], { noneText: 'Nothing here' })).toEqual(
        '<span class="text-grey">Nothing here</span>',
      )
    })

    it('should add a class if provided', () => {
      const result = characteristicsBulletList(placementRequest.essentialCriteria, {
        labels: roomCharacteristicMap,
        classes: 'test-class',
      })

      expect(result).toMatchStringIgnoringWhitespace(`
        <ul class="govuk-list govuk-list--bullet test-class">
          <li>${roomCharacteristicMap.isStepFreeDesignated}</li>
        </ul>
      `)
    })
  })

  describe('roomCharacteristicsInlineList', () => {
    it('should render a lowercase, comma-separated list of room characteristics', () => {
      const characteristics: Array<Cas1SpaceBookingCharacteristic> = [
        'isArsonSuitable',
        'isSingle',
        'isSuitedForSexOffenders',
        'isWheelchairDesignated',
      ]

      expect(roomCharacteristicsInlineList(characteristics)).toEqual(
        'suitable for active arson risk, single room, suitable for sexual offence risk and wheelchair accessible',
      )
    })

    it('should return the default "none" if the list is empty and no default is given', () => {
      expect(roomCharacteristicsInlineList([])).toEqual('none')
    })

    it('should return the specific default if one is provided the list is empty', () => {
      expect(roomCharacteristicsInlineList([], 'Nothing to show')).toEqual('Nothing to show')
    })
  })
})
