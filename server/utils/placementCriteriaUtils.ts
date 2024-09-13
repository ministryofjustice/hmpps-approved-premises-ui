import { ApType, PlacementCriteria } from '@approved-premises/api'
import { filterByType } from './utils'
import { apTypes } from '../form-pages/apply/reasons-for-placement/type-of-ap/apType'

type UiPlacementCriteria = Exclude<PlacementCriteria, 'isGroundFloor'>
type SpecialistApTypeCriteria = 'isPIPE' | 'isESAP' | 'isMHAPElliottHouse' | 'isMHAPStJosephs' | 'isRecoveryFocussed'

const applyApTypeToAssessApType: Record<Exclude<ApType, 'normal'>, SpecialistApTypeCriteria> = {
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
  isSuitableForVulnerable: 'At risk of criminal exploitation',
  acceptsChildSexOffenders: 'Poses risk to children',
  acceptsHateCrimeOffenders: 'Has committed hate-based offences',
  isArsonSuitable: 'Poses arson risk',
  acceptsSexOffenders: 'Poses sexual risk to adults',
  acceptsNonSexualChildOffenders: 'Non sexual offences against children',
  isWheelchairDesignated: 'Wheelchair needs',
  isStepFreeDesignated: 'Limited mobility',
  hasEnSuite: 'En-suite (room)',
  isSingle: 'Single (room)',
  isCatered: 'Catered (property)',
  isSuitedForSexOffenders: 'Room suitable for a person with sexual offences',
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
