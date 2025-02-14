import { ApType, PlacementCriteria } from '@approved-premises/api'
import { filterByType } from './utils'

type UiPlacementCriteria = Exclude<PlacementCriteria, 'isGroundFloor'>
export type SpecialistApTypeCriteria =
  | 'isPIPE'
  | 'isESAP'
  | 'isMHAPElliottHouse'
  | 'isMHAPStJosephs'
  | 'isRecoveryFocussed'

// The ordering of AP types is meaningful to users
export const apTypes: ReadonlyArray<ApType> = ['normal', 'pipe', 'esap', 'rfap', 'mhapElliottHouse', 'mhapStJosephs']

export const applyApTypeToAssessApType: Record<Exclude<ApType, 'normal'>, SpecialistApTypeCriteria> = {
  pipe: 'isPIPE',
  esap: 'isESAP',
  mhapElliottHouse: 'isMHAPElliottHouse',
  mhapStJosephs: 'isMHAPStJosephs',
  rfap: 'isRecoveryFocussed',
}

export const specialistApTypeCriteria = apTypes.map(type => applyApTypeToAssessApType[type])
export const offenceAndRiskCriteria = [
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsHateCrimeOffenders',
] as const
export const prepopulatablePlacementRequirementCriteria = [
  'isWheelchairDesignated',
  'isArsonDesignated',
  'isSingle',
  'isCatered',
  'isSuitedForSexOffenders',
] as const
export const nonPrepopulatablePlacementRequirementCriteria = ['isStepFreeDesignated', 'hasEnSuite'] as const
export const placementRequirementCriteria = [
  ...prepopulatablePlacementRequirementCriteria,
  ...nonPrepopulatablePlacementRequirementCriteria,
]

export type ApTypeCriteria = SpecialistApTypeCriteria | 'normal'
export type OffenceAndRiskCriteria = (typeof offenceAndRiskCriteria)[number]
export type PlacementRequirementCriteria = (typeof placementRequirementCriteria)[number]

export const placementCriteriaLabels: Record<UiPlacementCriteria, string> = {
  isPIPE: 'Psychologically Informed Planned Environment (PIPE)',
  isESAP: 'Enhanced Security AP (ESAP)',
  isRecoveryFocussed: 'Recovery Focused AP (RFAP)',
  isMHAPElliottHouse: 'Specialist Mental Health AP (Elliott House - Midlands)',
  isMHAPStJosephs: 'Specialist Mental Health AP (St Josephs - Greater Manchester)',
  isSemiSpecialistMentalHealth: 'Semi-specialist mental health',
  isSuitableForVulnerable: 'Vulnerable to exploitation',
  acceptsSexOffenders: 'Sexual offences against an adult',
  acceptsChildSexOffenders: 'Sexual offences against children',
  acceptsNonSexualChildOffenders: 'Non sexual offences against children',
  acceptsHateCrimeOffenders: 'Hate based offences',
  isWheelchairDesignated: 'Wheelchair accessible',
  isSingle: 'Single room',
  isStepFreeDesignated: 'Step-free access',
  isCatered: 'Catering required',
  hasEnSuite: 'En-suite bathroom',
  isSuitedForSexOffenders: 'Room suitable for a person with sexual offences',
  isArsonSuitable: 'Arson offences',
  hasBrailleSignage: 'Braille signage',
  hasTactileFlooring: 'Tactile flooring',
  hasHearingLoop: 'Hearing loop',
  isArsonDesignated: 'Designated arson room',
  arsonOffences: 'Arson Offences',
}

export const specialistApTypeCriteriaLabels = filterByType<SpecialistApTypeCriteria>(
  specialistApTypeCriteria,
  placementCriteriaLabels,
)

export const apTypeCriteriaLabels: Record<ApTypeCriteria, string> = {
  normal: 'Standard AP',
  ...specialistApTypeCriteriaLabels,
}

export const apType = (type: ApTypeCriteria): ApType => {
  switch (type) {
    case 'isPIPE':
      return 'pipe'
    case 'isESAP':
      return 'esap'
    case 'isRecoveryFocussed':
      return 'rfap'
    case 'isMHAPElliottHouse':
      return 'mhapElliottHouse'
    case 'isMHAPStJosephs':
      return 'mhapStJosephs'
    default:
      return 'normal'
  }
}
