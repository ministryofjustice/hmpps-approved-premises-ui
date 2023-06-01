import {
  ApType,
  ApprovedPremisesAssessment as Assessment,
  AssessmentAcceptance,
  PlacementCriteria,
  PlacementDates,
  PlacementRequirements,
} from '@approved-premises/api'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from '../retrieveQuestionResponseFromApplicationOrAssessment'

import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import MatchingInformation, {
  MatchingInformationBody,
} from '../../form-pages/assess/matchingInformation/matchingInformationTask/matchingInformation'
import LocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import {
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  offenceAndRiskOptions,
  placementRequirementOptions,
} from '../placementCriteriaUtils'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { getResponses } from '../applications/utils'

export const acceptanceData = (assessment: Assessment): AssessmentAcceptance => {
  const notes = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    assessment,
    MatchingInformation,
    'cruInformation',
  )

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
    retrieveOptionalQuestionResponseFromApplicationOrAssessment(
      assessment,
      MatchingInformation,
      'lengthOfStayAgreedDetail',
    ) || placementDurationFromApplication(assessment.application)

  return {
    expectedArrival: arrivalDate,
    duration: Number(placementDuration),
  }
}

export const placementRequestData = (assessment: Assessment): PlacementRequirements => {
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

  const criteria = criteriaFromMatchingInformation(matchingInformation)

  return {
    gender: 'male', // Hardcoded for now as we only support Male APs
    type: apType(matchingInformation.apType),
    location,
    radius: alternativeRadius || 50,
    ...criteria,
  }
}

export const apType = (type: ApTypeCriteria | 'normal'): ApType => {
  switch (type) {
    case 'isPIPE':
      return 'pipe'
    case 'isESAP':
      return 'esap'
    case 'isRecoveryFocussed':
      return 'rfap'
    default:
      return 'normal'
  }
}

export const criteriaFromMatchingInformation = (
  matchingInformation: MatchingInformationBody,
): { essentialCriteria: Array<PlacementCriteria>; desirableCriteria: Array<PlacementCriteria> } => {
  const essentialCriteria = [] as Array<PlacementCriteria>
  const desirableCriteria = [] as Array<PlacementCriteria>

  if (matchingInformation.apType !== 'normal') {
    essentialCriteria.push(matchingInformation.apType)
  }

  desirableCriteria.push(...matchingInformation.specialistSupportCriteria)
  desirableCriteria.push(...matchingInformation.accessibilityCriteria)

  Object.keys(placementRequirementOptions).forEach((requirement: PlacementRequirementCriteria) => {
    if (matchingInformation[requirement] === 'essential') {
      essentialCriteria.push(requirement)
    }

    if (matchingInformation[requirement] === 'desirable') {
      desirableCriteria.push(requirement)
    }
  })

  Object.keys(offenceAndRiskOptions).forEach((requirement: OffenceAndRiskCriteria) => {
    if (matchingInformation[requirement] === 'relevant') {
      essentialCriteria.push(requirement)
    }
  })

  if (essentialCriteria.includes('acceptsSexOffenders') || essentialCriteria.includes('acceptsChildSexOffenders')) {
    essentialCriteria.push('isSuitedForSexOffenders')
  }

  return { essentialCriteria, desirableCriteria }
}
