import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { weeksToDays } from 'date-fns'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../utils/retrieveQuestionResponseFromFormArtifact'
import type {
  MatchingInformationBody,
  PlacementRequirementPreference,
} from '../assess/matchingInformation/matchingInformationTask/matchingInformation'
import AccessNeedsFurtherQuestions from '../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'
import Catering from '../apply/risk-and-need-factors/further-considerations/catering'
import Arson from '../apply/risk-and-need-factors/further-considerations/arson'
import RoomSharing from '../apply/risk-and-need-factors/further-considerations/roomSharing'
import Covid from '../apply/risk-and-need-factors/access-and-healthcare/covid'
import { TasklistPageInterface } from '../tasklistPage'

export interface TaskListPageYesNoField {
  name: string
  page: TasklistPageInterface
  value?: 'yes' | 'no'
  optional?: boolean
}

const isArsonDesignated = (body: MatchingInformationBody, assessment: Assessment): PlacementRequirementPreference => {
  if (body.isArsonDesignated) {
    return body.isArsonDesignated
  }

  const arsonRisk = retrieveQuestionResponseFromFormArtifact(assessment.application, Arson, 'arson')

  return arsonRisk === 'yes' ? 'essential' : 'notRelevant'
}

const isCatered = (body: MatchingInformationBody, assessment: Assessment): PlacementRequirementPreference => {
  if (body.isCatered) {
    return body.isCatered
  }

  const selfCatered = retrieveQuestionResponseFromFormArtifact(assessment.application, Catering, 'catering')

  return selfCatered === 'no' ? 'essential' : 'notRelevant'
}

const isSingle = (body: MatchingInformationBody, assessment: Assessment): PlacementRequirementPreference => {
  if (body.isSingle) {
    return body.isSingle
  }

  const fieldsToCheck: Array<TaskListPageYesNoField> = [
    { name: 'boosterEligibility', page: Covid },
    { name: 'immunosuppressed', page: Covid },
    { name: 'riskToOthers', page: RoomSharing },
    { name: 'riskToStaff', page: RoomSharing },
    { name: 'sharingConcerns', page: RoomSharing },
    { name: 'traumaConcerns', page: RoomSharing },
  ]

  const needsSingleRoom = fieldsToCheck.find(
    ({ name, page }) => retrieveQuestionResponseFromFormArtifact(assessment.application, page, name) === 'yes',
  )

  return needsSingleRoom ? 'essential' : 'notRelevant'
}

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
    isArsonDesignated: isArsonDesignated(body, assessment),
    isCatered: isCatered(body, assessment),
    isSingle: isSingle(body, assessment),
    isWheelchairDesignated: isWheelchairDesignated(body, assessment),
    lengthOfStay: lengthOfStay(body),
  }
}