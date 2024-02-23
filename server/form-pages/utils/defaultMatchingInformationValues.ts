import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { weeksToDays } from 'date-fns'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../utils/retrieveQuestionResponseFromFormArtifact'
import type {
  MatchingInformationBody,
  PlacementRequirementPreference,
} from '../assess/matchingInformation/matchingInformationTask/matchingInformation'
import AccessNeedsFurtherQuestions from '../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'

const isWheelchairDesignated = (
  body: MatchingInformationBody,
  assessment: Assessment,
): PlacementRequirementPreference => {
  if (body.isWheelchairDesignated) {
    return body.isWheelchairDesignated
  }

  const needsWheelchair = retrieveOptionalQuestionResponseFromFormArtifact(
    assessment.application,
    AccessNeedsFurtherQuestions,
    'needsWheelchair',
  )

  return needsWheelchair === 'yes' ? 'essential' : 'notRelevant'
}

const lengthOfStay = (body: MatchingInformationBody): string | undefined => {
  if (body.lengthOfStayAgreed === 'no' && body.lengthOfStayDays && body.lengthOfStayWeeks) {
    const lengthOfStayWeeksInDays = weeksToDays(Number(body.lengthOfStayWeeks))
    const totalLengthInDays = lengthOfStayWeeksInDays + Number(body.lengthOfStayDays)

    return String(totalLengthInDays)
  }

  return undefined
}

export const defaultMatchingInformationValues = (
  body: MatchingInformationBody,
  assessment: Assessment,
): Partial<MatchingInformationBody> => {
  return {
    isWheelchairDesignated: isWheelchairDesignated(body, assessment),
    lengthOfStay: lengthOfStay(body),
  }
}
