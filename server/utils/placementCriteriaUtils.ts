import { PlacementCriteria } from '@approved-premises/api'

const apTypes = ['isPipe', 'isEsap', 'isRecoveryFocussed']
const mentalHealthTypes = ['isSemiSpecialistMentalHealth']
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
  'isSingleRoom',
  'isStepFreeDesignated',
  'isCatered',
  'isGroundFloor',
  'hasEnSuite',
]
const additionalCriteria = ['isSuitedForSexOffenders']

export type ApTypeCriteria = Extract<PlacementCriteria, (typeof apTypes)[number]>
export type MentalHealthCriteria = Extract<PlacementCriteria, (typeof mentalHealthTypes)[number]>
export type OffenceAndRiskCriteria = Extract<PlacementCriteria, (typeof offenceAndRiskCriteria)[number]>
export type PlacementRequirementCriteria = Extract<PlacementCriteria, (typeof placementRequirementCriteria)[number]>
export type AdditionalCriteria = Extract<PlacementCriteria, (typeof additionalCriteria)[number]>

type PlacementCriteriaCategory =
  | ApTypeCriteria
  | MentalHealthCriteria
  | OffenceAndRiskCriteria
  | PlacementRequirementCriteria
  | AdditionalCriteria

export const placementCriteria: Record<PlacementCriteria, string> = {
  isPipe: 'Psychologically Informed Planned Environment (PIPE)',
  isEsap: 'Enhanced Security AP (ESAP)',
  isRecoveryFocussed: 'Recovery Focused Approved Premises (RAP)',
  isSemiSpecialistMentalHealth: 'Semi-specialist mental health',
  isSuitableForVulnerable: 'Vulnerable to exploitation',
  acceptsSexOffenders: 'Sexual offences against an adult',
  acceptsChildSexOffenders: 'Sexual offences against children',
  acceptsNonSexualChildOffenders: 'Non sexual offences against children',
  acceptsHateCrimeOffenders: 'Hate based offences',
  isWheelchairDesignated: 'Wheelchair accessible',
  isSingleRoom: 'Single room',
  isStepFreeDesignated: 'Has step-free access',
  isCatered: 'Catering required',
  isGroundFloor: 'Ground floor room',
  hasEnSuite: 'En-suite',
  isSuitedForSexOffenders: 'Is suited for sex offenders',
  isArsonSuitable: 'Arson offences',
}

const filterByType = <T extends PlacementCriteriaCategory>(keys: Array<string>): Record<T, string> => {
  return Object.keys(placementCriteria)
    .filter(k => keys.includes(k))
    .reduce((criteria, key) => ({ ...criteria, [key]: placementCriteria[key] }), {}) as Record<T, string>
}

export const apTypeOptions = {
  normal: 'Standard AP',
  ...filterByType<ApTypeCriteria>(apTypes),
} as Record<ApTypeCriteria & 'normal', string>
export const mentalHealthOptions = filterByType<MentalHealthCriteria>(mentalHealthTypes)
export const offenceAndRiskOptions = filterByType<OffenceAndRiskCriteria>(offenceAndRiskCriteria)
export const placementRequirementOptions = filterByType<PlacementRequirementCriteria>(placementRequirementCriteria)
