import {
  apTypeOptions,
  offenceAndRiskOptions,
  placementRequirementOptions,
  specialistApTypeOptions,
} from './placementCriteriaUtils'

describe('placementCriteriaUtils', () => {
  describe('apTypeOptions', () => {
    it('should return all the AP Type options', () => {
      expect(Object.keys(apTypeOptions)).toEqual(['normal', 'isPIPE', 'isESAP'])
    })
  })

  describe('specialistApTypeOptions', () => {
    it('should return all the AP Type options without a `normal` AP type', () => {
      expect(Object.keys(specialistApTypeOptions)).toEqual(['isPIPE', 'isESAP'])
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
        'isSingle',
        'isStepFreeDesignated',
        'isCatered',
        'hasEnSuite',
        'isSuitedForSexOffenders',
        'isArsonDesignated',
      ])
    })
  })
})
