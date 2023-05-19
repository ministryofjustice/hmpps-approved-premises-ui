import {
  ApType,
  ApprovedPremisesAssessment as Assessment,
  PlacementCriteria,
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
  const placementDuration =
    retrieveOptionalQuestionResponseFromApplicationOrAssessment(
      assessment,
      MatchingInformation,
      'lengthOfStayAgreedDetail',
    ) || placementDurationFromApplication(assessment.application)

  const criteria = criteriaFromMatchingInformation(matchingInformation)

  const notes = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    assessment,
    MatchingInformation,
    'cruInformation',
  )

  return {
    gender: 'male', // Hardcoded for now as we only support Male APs
    type: apType(matchingInformation.apType),
    expectedArrival: arrivalDateFromApplication(assessment.application),
    duration: placementDuration,
    location,
    radius: alternativeRadius || 50,
    notes,
    ...criteria,
  } as PlacementRequirements
}

export const apType = (type: ApTypeCriteria | 'normal'): ApType => {
  switch (type) {
    case 'isPipe':
      return 'pipe'
    case 'isEsap':
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

  essentialCriteria.push(...matchingInformation.specialistSupportCriteria)
  essentialCriteria.push(...matchingInformation.accessibilityCriteria)

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
