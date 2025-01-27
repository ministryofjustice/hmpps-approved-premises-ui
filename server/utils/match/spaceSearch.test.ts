import { PlacementCriteria } from '@approved-premises/api'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  filterApLevelCriteria,
  filterRoomLevelCriteria,
  initialiseSearchState,
  spaceSearchStateToApiPayload,
} from './spaceSearch'
import { placementRequestDetailFactory, spaceSearchStateFactory } from '../../testutils/factories'
import * as formUtils from '../formUtils'
import { ApTypeCriteria, apTypeCriteriaLabels } from '../placementCriteriaUtils'

describe('Space search utils', () => {
  describe('initialiseSearchState', () => {
    it('returns a search state from a placement request', () => {
      const placementRequest = placementRequestDetailFactory.build({
        type: 'rfap',
        essentialCriteria: ['acceptsNonSexualChildOffenders', 'isStepFreeDesignated'],
        desirableCriteria: ['hasEnSuite'],
      })

      expect(initialiseSearchState(placementRequest)).toEqual({
        applicationId: placementRequest.applicationId,
        postcode: placementRequest.location,
        apType: 'isRecoveryFocussed',
        apCriteria: ['acceptsNonSexualChildOffenders'],
        roomCriteria: ['isStepFreeDesignated', 'hasEnSuite'],
        startDate: placementRequest.expectedArrival,
        durationDays: placementRequest.duration,
      })
    })

    it('can set the AP type to normal', () => {
      const placementRequest = placementRequestDetailFactory.build({
        type: 'normal',
      })

      expect(initialiseSearchState(placementRequest)).toEqual(
        expect.objectContaining({
          apType: 'normal',
        }),
      )
    })
  })

  describe('filterApLevelCriteria', () => {
    it('returns an array of AP-level criteria only', () => {
      const criteria: Array<PlacementCriteria> = [
        'isGroundFloor',
        'isESAP',
        'isWheelchairDesignated',
        'acceptsNonSexualChildOffenders',
        'hasEnSuite',
      ]

      expect(filterApLevelCriteria(criteria)).toEqual(['acceptsNonSexualChildOffenders'])
    })
  })

  describe('filterRoomLevelCriteria', () => {
    it('returns an array of AP-level criteria only', () => {
      const criteria: Array<PlacementCriteria> = [
        'isGroundFloor',
        'isESAP',
        'isWheelchairDesignated',
        'acceptsNonSexualChildOffenders',
        'hasEnSuite',
      ]

      expect(filterRoomLevelCriteria(criteria)).toEqual(['isWheelchairDesignated', 'hasEnSuite'])
    })
  })

  describe('spaceSearchStateToApiPayload', () => {
    it('maps a space search state to the correct API request body', () => {
      const spaceSearchState = spaceSearchStateFactory.build({
        apType: 'isESAP',
        apCriteria: ['acceptsChildSexOffenders'],
        roomCriteria: ['hasEnSuite'],
      })

      expect(spaceSearchStateToApiPayload(spaceSearchState)).toEqual({
        durationInDays: spaceSearchState.durationDays,
        requirements: {
          apType: 'esap',
          spaceCharacteristics: ['acceptsChildSexOffenders', 'hasEnSuite'],
        },
        applicationId: spaceSearchState.applicationId,
        startDate: spaceSearchState.startDate,
        targetPostcodeDistrict: spaceSearchState.postcode,
      })
    })
  })

  describe('apTypeRadioItems', () => {
    it('calls the function to create the radio items with the expected arguments', () => {
      const radioButtonUtilSpy = jest.spyOn(formUtils, 'convertKeyValuePairToRadioItems')

      const apType: ApTypeCriteria = 'isESAP'

      const result = apTypeRadioItems(apType)

      expect(result).toEqual([
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Standard AP',
          value: 'normal',
        },
        { divider: 'or' },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Psychologically Informed Planned Environment (PIPE)',
          value: 'isPIPE',
        },
        {
          checked: true,
          conditional: undefined,
          hint: undefined,
          text: 'Enhanced Security AP (ESAP)',
          value: 'isESAP',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Recovery Focused AP (RFAP)',
          value: 'isRecoveryFocussed',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Specialist Mental Health AP (Elliott House - Midlands)',
          value: 'isMHAPElliottHouse',
        },
        {
          checked: false,
          conditional: undefined,
          hint: undefined,
          text: 'Specialist Mental Health AP (St Josephs - Greater Manchester)',
          value: 'isMHAPStJosephs',
        },
      ])
      expect(radioButtonUtilSpy).toHaveBeenCalledWith(apTypeCriteriaLabels, apType)
    })
  })

  describe('checkBoxesForCriteria', () => {
    it('returns an object used to build the checkbox group', () => {
      const options = {
        isESAP: 'ESAP',
        isIAP: 'IAP',
        isSemiSpecialistMentalHealth: 'Semi specialist mental health',
      }
      const result = checkBoxesForCriteria('Legend', 'fieldName', options, ['isESAP', 'isIAP'])

      expect(result).toEqual({
        legend: 'Legend',
        fieldName: 'fieldName',
        items: [
          {
            checked: true,
            id: 'isESAP',
            text: 'ESAP',
            value: 'isESAP',
          },
          { text: 'IAP', value: 'isIAP', id: 'isIAP', checked: true },
          {
            checked: false,
            id: 'isSemiSpecialistMentalHealth',
            text: 'Semi specialist mental health',
            value: 'isSemiSpecialistMentalHealth',
          },
        ],
      })
    })
  })
})
