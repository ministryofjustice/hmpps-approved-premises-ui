import {
  ApprovedPremisesAssessment as Assessment,
  PlacementDates,
  TemporaryApplyApTypeAwaitingApiChangeButWithNormalInsteadOfStandard,
  TemporaryAssessmentAcceptanceAwaitingApiChanges,
  TemporaryPlacementRequirementsAwaitingApiChange,
} from '@approved-premises/api'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'

import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import MatchingInformation, {
  MatchingInformationBody,
} from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import LocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import {
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  UiPlacementCriteria,
  offenceAndRiskCriteria,
  placementRequirementCriteria,
} from '../placementCriteriaUtils'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { getResponses } from '../applications/getResponses'

export const acceptanceData = (assessment: Assessment): TemporaryAssessmentAcceptanceAwaitingApiChanges => {
  const notes = retrieveOptionalQuestionResponseFromFormArtifact(assessment, MatchingInformation, 'cruInformation')

  return {
    document: getResponses(assessment),
    requirements: placementRequestData(assessment),
    placementDates: placementDates(assessment),
    notes,
  }
}

export const placementDates = (assessment: Assessment): PlacementDates | null => {
  const arrivalDate = arrivalDateFromApplication(assessment.application)

  if (!arrivalDate) {
    return null
  }

  const placementDuration =
    retrieveOptionalQuestionResponseFromFormArtifact(assessment, MatchingInformation, 'lengthOfStay') ||
    placementDurationFromApplication(assessment.application)

  return {
    expectedArrival: arrivalDate,
    duration: Number(placementDuration),
  }
}

export const placementRequestData = (assessment: Assessment): TemporaryPlacementRequirementsAwaitingApiChange => {
  const matchingInformation = pageDataFromApplicationOrAssessment(
    MatchingInformation,
    assessment,
  ) as MatchingInformationBody

  const location = retrieveQuestionResponseFromFormArtifact(assessment.application, LocationFactors, 'postcodeArea')
  const alternativeRadius = retrieveOptionalQuestionResponseFromFormArtifact(
    assessment.application,
    LocationFactors,
    'alternativeRadius',
  )

  const criteria = criteriaFromMatchingInformation(matchingInformation)

  return {
    gender: 'male', // Hardcoded for now as we only support Male APs
    type: apType(matchingInformation.apType),
    location,
    radius: alternativeRadius || 50,
    ...criteria,
  }
}

// do something with this?
export const apType = (
  type: ApTypeCriteria | 'isRecoveryFocussed',
): TemporaryApplyApTypeAwaitingApiChangeButWithNormalInsteadOfStandard => {
  switch (type) {
    case 'isPIPE':
      return 'pipe'
    case 'isESAP':
      return 'esap'
    // case 'isRecoveryFocussed':
    //   return 'rfap'
    case 'isMHAPElliottHouse':
      return 'mhapElliottHouse'
    case 'isMHAPStJosephs':
      return 'mhapStJosephs'
    default:
      return 'normal'
  }
}

export const criteriaFromMatchingInformation = (
  matchingInformation: MatchingInformationBody,
): { essentialCriteria: Array<UiPlacementCriteria>; desirableCriteria: Array<UiPlacementCriteria> } => {
  const essentialCriteria = [] as Array<UiPlacementCriteria>
  const desirableCriteria = [] as Array<UiPlacementCriteria>

  if (matchingInformation.apType !== 'normal') {
    essentialCriteria.push(matchingInformation.apType)
  }

  placementRequirementCriteria.forEach((requirement: PlacementRequirementCriteria) => {
    if (matchingInformation[requirement] === 'essential') {
      essentialCriteria.push(requirement)
    }

    if (matchingInformation[requirement] === 'desirable') {
      desirableCriteria.push(requirement)
    }
  })

  offenceAndRiskCriteria.forEach((requirement: OffenceAndRiskCriteria) => {
    if (matchingInformation[requirement] === 'relevant') {
      essentialCriteria.push(requirement)
    }
  })

  if (essentialCriteria.includes('acceptsSexOffenders') || essentialCriteria.includes('acceptsChildSexOffenders')) {
    essentialCriteria.push('isSuitedForSexOffenders')
  }

  return { essentialCriteria, desirableCriteria }
}
