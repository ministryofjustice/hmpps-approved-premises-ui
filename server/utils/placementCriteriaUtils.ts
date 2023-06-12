import { PlacementCriteria } from '@approved-premises/api'

const apTypes = ['isPIPE', 'isESAP']
const specialistSupportCriteria = ['isSemiSpecialistMentalHealth', 'isRecoveryFocussed']
const accessibilityCriteria = ['hasBrailleSignage', 'hasTactileFlooring', 'hasHearingLoop']
const offenceAndRiskCriteria = [
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsHateCrimeOffenders',
  'isArsonSuitable',
]
const placementRequirementCriteria = [
  'isWheelchairDesignated',
  'isArsonDesignated',
  'isSingleRoom',
  'isStepFreeDesignated',
  'isCatered',
  'isGroundFloor',
  'hasEnSuite',
  'isSuitedForSexOffenders',
]

export type ApTypeCriteria = Extract<PlacementCriteria, (typeof apTypes)[number]>
export type SpecialistSupportCriteria = Extract<PlacementCriteria, (typeof specialistSupportCriteria)[number]>
export type OffenceAndRiskCriteria = Extract<PlacementCriteria, (typeof offenceAndRiskCriteria)[number]>
export type AccessibilityCriteria = Extract<PlacementCriteria, (typeof accessibilityCriteria)[number]>
export type PlacementRequirementCriteria = Extract<PlacementCriteria, (typeof placementRequirementCriteria)[number]>

type PlacementCriteriaCategory =
  | ApTypeCriteria
  | SpecialistSupportCriteria
  | OffenceAndRiskCriteria
  | PlacementRequirementCriteria
  | AccessibilityCriteria

export const placementCriteria: Record<PlacementCriteria, string> = {
  isPIPE: 'Psychologically Informed Planned Environment (PIPE)',
  isESAP: 'Enhanced Security AP (ESAP)',
  isRecoveryFocussed: 'Recovery Focused Approved Premises (RFAP)',
  isSemiSpecialistMentalHealth: 'Semi-specialist mental health',
  isSuitableForVulnerable: 'Vulnerable to exploitation',
  acceptsSexOffenders: 'Sexual offences against an adult',
  acceptsChildSexOffenders: 'Sexual offences against children',
  acceptsNonSexualChildOffenders: 'Non sexual offences against children',
  acceptsHateCrimeOffenders: 'Hate based offences',
  isWheelchairDesignated: 'Wheelchair accessible',
  isSingleRoom: 'Single room',
  isStepFreeDesignated: 'Step-free access',
  isCatered: 'Catering required',
  isGroundFloor: 'Ground floor room',
  hasEnSuite: 'En-suite bathroom',
  isSuitedForSexOffenders: 'Room suitable for a person with sexual offences',
  isArsonSuitable: 'Arson offences',
  hasBrailleSignage: 'Braille signage',
  hasTactileFlooring: 'Tactile flooring',
  hasHearingLoop: 'Hearing loop',
  isArsonDesignated: 'Designated arson room',
}

const filterByType = <T extends PlacementCriteriaCategory>(keys: Array<string>): Record<T, string> => {
  return Object.keys(placementCriteria)
    .filter(k => keys.includes(k))
    .reduce((criteria, key) => ({ ...criteria, [key]: placementCriteria[key] }), {}) as Record<T, string>
}

export const specialistApTypeOptions = filterByType<ApTypeCriteria>(apTypes)
export const apTypeOptions = {
  normal: 'Standard AP',
  ...specialistApTypeOptions,
} as Record<ApTypeCriteria & 'normal', string>
export const specialistSupportOptions = filterByType<SpecialistSupportCriteria>(specialistSupportCriteria)
export const accessibilityOptions = filterByType<AccessibilityCriteria>(accessibilityCriteria)
export const offenceAndRiskOptions = filterByType<OffenceAndRiskCriteria>(offenceAndRiskCriteria)
export const placementRequirementOptions = filterByType<PlacementRequirementCriteria>(placementRequirementCriteria)
