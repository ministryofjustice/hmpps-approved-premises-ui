import { PlacementCriteria } from '@approved-premises/api'
import { filterByType } from './utils'

type UiPlacementCriteria = Exclude<PlacementCriteria, 'isGroundFloor'>
export const specialistApTypeCriteria = [
  'isPIPE',
  'isESAP',
  'isMHAPElliottHouse',
  'isMHAPStJosephs',
  'isRecoveryFocussed',
] as const
export const offenceAndRiskCriteria = [
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsHateCrimeOffenders',
  'isArsonSuitable',
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

export type SpecialistApTypeCriteria = (typeof specialistApTypeCriteria)[number]
export type ApTypeCriteria = SpecialistApTypeCriteria | 'normal'
export type OffenceAndRiskCriteria = (typeof offenceAndRiskCriteria)[number]
export type PlacementRequirementCriteria = (typeof placementRequirementCriteria)[number]

export const placementCriteriaLabels: Record<UiPlacementCriteria, string> = {
  isPIPE: 'Psychologically Informed Planned Environment (PIPE)',
  isESAP: 'Enhanced Security AP (ESAP)',
  isRecoveryFocussed: 'Recovery Focused Approved Premises (RFAP)',
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
}

export const specialistApTypeCriteriaLabels = filterByType<SpecialistApTypeCriteria>(
  specialistApTypeCriteria,
  placementCriteriaLabels,
)
export const apTypeCriteriaLabels: Record<ApTypeCriteria, string> = {
  normal: 'Standard AP',
  ...specialistApTypeCriteriaLabels,
}
export const offenceAndRiskCriteriaLabels = filterByType<OffenceAndRiskCriteria>(
  offenceAndRiskCriteria,
  placementCriteriaLabels,
)
export const placementRequirementCriteriaLabels = filterByType<PlacementRequirementCriteria>(
  placementRequirementCriteria,
  placementCriteriaLabels,
)
