import {
  ApType,
  Cas1Assessment as Assessment,
  Cas1AssessmentAcceptance,
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
import { placementDurationFromApplication } from '../applications/placementDurationFromApplication'
import { getResponses } from '../applications/getResponses'
import ApplicationTimeliness from '../../form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'
import type { ApplicationTimelinessBody } from '../../form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'
import { lengthOfStay } from '../../form-pages/utils/matchingInformationUtils'

export const acceptanceData = (assessment: Assessment): Cas1AssessmentAcceptance => {
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
    lengthOfStay(pageDataFromApplicationOrAssessment(MatchingInformation, assessment)) ||
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

  return {
    type: apType(matchingInformation.apType),
    location,
    radius: alternativeRadius || 50,
    essentialCriteria: criteriaFromMatchingInformation(matchingInformation),
    desirableCriteria: [],
  }
}

export const criteriaFromMatchingInformation = (
  matchingInformation: MatchingInformationBody,
): Array<PlacementCriteria> => {
  const criteria: Array<PlacementCriteria> = []

  if (matchingInformation.apType !== 'normal') {
    criteria.push(matchingInformation.apType)
  }

  placementRequirementCriteria.forEach((requirement: PlacementRequirementCriteria) => {
    if (matchingInformation[requirement] === 'required') {
      criteria.push(requirement)
    }
  })

  offenceAndRiskCriteria.forEach((requirement: OffenceAndRiskCriteria) => {
    if (matchingInformation[requirement] === 'relevant') {
      criteria.push(requirement)
    }
  })

  if (criteria.includes('acceptsSexOffenders') || criteria.includes('acceptsChildSexOffenders')) {
    criteria.push('isSuitedForSexOffenders')
  }

  return criteria
}
