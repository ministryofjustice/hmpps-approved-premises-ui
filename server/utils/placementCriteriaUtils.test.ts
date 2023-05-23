import {
  apTypeOptions,
  offenceAndRiskOptions,
  placementRequirementOptions,
  specialistSupportOptions,
} from './placementCriteriaUtils'

describe('placementCriteriaUtils', () => {
  describe('apTypeOptions', () => {
    it('should return all the AP Type options', () => {
      expect(Object.keys(apTypeOptions)).toEqual(['normal', 'isPIPE', 'isESAP'])
    })
  })

  describe('specialistSupportOptions', () => {
    it('should return all the mental health options', () => {
      expect(Object.keys(specialistSupportOptions)).toEqual(['isRecoveryFocussed', 'isSemiSpecialistMentalHealth'])
    })
  })

  describe('offenceAndRiskOptions', () => {
    it('should return all the Offence and Risk options', () => {
      expect(Object.keys(offenceAndRiskOptions)).toEqual([
        'isSuitableForVulnerable',
        'acceptsSexOffenders',
        'acceptsChildSexOffenders',
        'acceptsNonSexualChildOffenders',
        'acceptsHateCrimeOffenders',
        'isArsonSuitable',
      ])
    })
  })

  describe('placementRequirementOptions', () => {
    it('should return all the placement requirement options', () => {
      expect(Object.keys(placementRequirementOptions)).toEqual([
        'isWheelchairDesignated',
        'isSingleRoom',
        'isStepFreeDesignated',
        'isCatered',
        'isGroundFloor',
        'hasEnSuite',
        'isSuitedForSexOffenders',
        'isArsonDesignated',
      ])
    })
  })
})
