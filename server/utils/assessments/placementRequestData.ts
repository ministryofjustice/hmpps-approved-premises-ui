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
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInWeeks } from '../applications/getDefaultPlacementDurationInWeeks'
import {
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  offenceAndRiskOptions,
  placementRequirementOptions,
} from '../placementCriteriaUtils'

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
      assessment.application,
      PlacementDuration,
      'duration',
    ) || getDefaultPlacementDurationInWeeks(assessment.application)

  const criteria = criteriaFromMatchingInformation(matchingInformation)

  return {
    gender: 'male', // Hardcoded for now as we only support Male APs
    type: apType(matchingInformation.apType),
    expectedArrival: arrivalDateFromApplication(assessment.application),
    duration: placementDuration,
    location,
    radius: alternativeRadius || 50,
    mentalHealthSupport: !!matchingInformation.mentalHealthSupport,
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

  if (matchingInformation.mentalHealthSupport) {
    essentialCriteria.push('isSemiSpecialistMentalHealth')
  }

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
