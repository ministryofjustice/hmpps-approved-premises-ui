import {
  ApType,
  ApprovedPremisesAssessment as Assessment,
  AssessmentAcceptance,
  PlacementCriteria,
  PlacementDates,
  PlacementRequirements,
} from '@approved-premises/api'
import { ShortNoticeReasons } from '../../form-pages/apply/reasons-for-placement/basic-information/reasonForShortNotice'
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
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  apType,
  offenceAndRiskCriteria,
  placementRequirementCriteria,
} from '../placementCriteriaUtils'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { getResponses } from '../applications/getResponses'
import ApplicationTimeliness from '../../form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'
import type { ApplicationTimelinessBody } from '../../form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'

export const acceptanceData = (assessment: Assessment): AssessmentAcceptance => {
  const notes = retrieveOptionalQuestionResponseFromFormArtifact(assessment, MatchingInformation, 'cruInformation')

  return {
    document: getResponses(assessment),
    requirements: placementRequestData(assessment),
    placementDates: placementDates(assessment),
    notes,
    apType: apTypeFromAssessment(assessment),
    ...timelinessDataFromAssessment(assessment),
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

export const apTypeFromAssessment = (assessment: Assessment): ApType => {
  const assessApType = retrieveQuestionResponseFromFormArtifact(assessment, MatchingInformation, 'apType')
  return apType(assessApType)
}

export const timelinessDataFromAssessment = (
  assessment: Assessment,
): {
  agreeWithShortNoticeReasonComments?: string
  agreeWithShortNoticeReason?: boolean
  reasonForLateApplication?: ShortNoticeReasons
} => {
  const { agreeWithShortNoticeReason, agreeWithShortNoticeReasonComments, reasonForLateApplication } =
    pageDataFromApplicationOrAssessment(ApplicationTimeliness, assessment) as ApplicationTimelinessBody
  let data = {}
  if (agreeWithShortNoticeReason) {
    data = { agreeWithShortNoticeReasonComments, agreeWithShortNoticeReason: agreeWithShortNoticeReason === 'yes' }
    if (agreeWithShortNoticeReason === 'no') {
      data = { ...data, reasonForLateApplication }
    }
  }
  return data
}

export const placementRequestData = (assessment: Assessment): PlacementRequirements => {
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

export const criteriaFromMatchingInformation = (
  matchingInformation: MatchingInformationBody,
): { essentialCriteria: Array<PlacementCriteria>; desirableCriteria: Array<PlacementCriteria> } => {
  const essentialCriteria = [] as Array<PlacementCriteria>
  const desirableCriteria = [] as Array<PlacementCriteria>

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
