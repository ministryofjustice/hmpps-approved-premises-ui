import { ApprovedPremisesAssessment as Assessment, PlacementCriteria, PlacementRequest } from '@approved-premises/api'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from '../retrieveQuestionResponseFromApplicationOrAssessment'

import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import MatchingInformation, {
  MatchingInformationBody,
  offenceAndRiskInformationKeys,
  placementRequirements,
} from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import LocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInWeeks } from '../applications/getDefaultPlacementDurationInWeeks'

type Requirement = (typeof placementRequirements)[number]
type RiskInformationKey = (typeof offenceAndRiskInformationKeys)[number]

export const placementRequestData = (assessment: Assessment): PlacementRequest => {
  const matchingInformation = pageDataFromApplicationOrAssessment(
    MatchingInformation,
    assessment,
  ) as MatchingInformationBody

  const location = retrieveQuestionResponseFromApplicationOrAssessment(
    assessment.application,
    LocationFactors,
    'postcodeArea',
  )
  const alternativeRadius = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    assessment.application,
    LocationFactors,
    'alternativeRadius',
  )
  const placementDuration =
    retrieveOptionalQuestionResponseFromApplicationOrAssessment(
      assessment.application,
      PlacementDuration,
      'duration',
    ) || getDefaultPlacementDurationInWeeks(assessment.application)

  const criteria = criteriaFromMatchingInformation(matchingInformation)

  return {
    type: matchingInformation.apType,
    expectedArrival: arrivalDateFromApplication(assessment.application),
    duration: placementDuration,
    location,
    radius: alternativeRadius || 50,
    mentalHealthSupport: !!matchingInformation.mentalHealthSupport,
    ...criteria,
  } as PlacementRequest
}

export const criteriaFromMatchingInformation = (
  matchingInformation: MatchingInformationBody,
): { essentialCriteria: Array<PlacementCriteria>; desirableCriteria: Array<PlacementCriteria> } => {
  const essentialCriteria = [] as Array<PlacementCriteria>
  const desirableCriteria = [] as Array<PlacementCriteria>

  placementRequirements.forEach(requirement => {
    if (matchingInformation[requirement] === 'essential') {
      essentialCriteria.push(...requirementToCriteria(requirement))
    }

    if (matchingInformation[requirement] === 'desirable') {
      desirableCriteria.push(...requirementToCriteria(requirement))
    }
  })

  offenceAndRiskInformationKeys.forEach(key => {
    if (matchingInformation[key] === 'relevant') {
      essentialCriteria.push(...riskInformationToCriteria(key))
    }
  })

  return { essentialCriteria, desirableCriteria }
}

export const riskInformationToCriteria = (riskKey: RiskInformationKey): Array<PlacementCriteria> => {
  switch (riskKey) {
    case 'contactSexualOffencesAgainstAnAdultAdults':
      return ['acceptsSexOffenders']
    case 'nonContactSexualOffencesAgainstAnAdultAdults':
      return ['acceptsSexOffenders']
    case 'contactSexualOffencesAgainstChildren':
      return ['acceptsChildSexOffenders']
    case 'nonContactSexualOffencesAgainstChildren':
      return ['acceptsChildSexOffenders']
    case 'nonSexualOffencesAgainstChildren':
      return ['acceptsNonSexualChildOffenders']
    case 'arsonOffences':
      return []
    case 'hateBasedOffences':
      return ['acceptsHateCrimeOffenders']
    case 'vulnerableToExploitation':
      return ['isSuitableForVulnerable']
    default:
      return []
  }
}

export const requirementToCriteria = (requirement: Requirement): Array<PlacementCriteria> => {
  switch (requirement) {
    case 'wheelchairAccessible':
      return [
        'hasWideStepFreeAccess',
        'hasWideAccessToCommunalAreas',
        'hasStepFreeAccessToCommunalAreas',
        'hasWheelChairAccessibleBathrooms',
        'hasLift',
        'hasWheelChairAccessibleBathrooms',
      ]
    case 'singleRoom':
      return []
    case 'adaptedForHearingImpairments':
      return ['hasHearingLoop']
    case 'adaptedForVisualImpairments':
      return ['hasTactileFlooring', 'hasBrailleSignage']
    case 'adaptedForRestrictedMobility':
      return ['hasWideStepFreeAccess', 'hasStepFreeAccessToCommunalAreas', 'hasLift']
    case 'cateringRequired':
      return ['isCatered']
    default:
      return []
  }
}
