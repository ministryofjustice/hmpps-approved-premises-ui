import { ApprovedPremisesApplication } from '@approved-premises/api'
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
import DateOfOffence from '../apply/risk-and-need-factors/risk-management-features/dateOfOffence'

export interface TaskListPageYesNoField {
  name: string
  page: TasklistPageInterface
  value?: 'yes' | 'no'
  optional?: boolean
}

export const sexualOffencesFields = [
  'contactSexualOffencesAgainstAdults',
  'nonContactSexualOffencesAgainstAdults',
  'contactSexualOffencesAgainstChildren',
  'nonContactSexualOffencesAgainstChildren',
]

const isArsonDesignated = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): PlacementRequirementPreference => {
  if (body.isArsonDesignated) {
    return body.isArsonDesignated
  }

  const arsonRisk = retrieveQuestionResponseFromFormArtifact(application, Arson, 'arson')

  return arsonRisk === 'yes' ? 'essential' : 'notRelevant'
}

const isCatered = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): PlacementRequirementPreference => {
  if (body.isCatered) {
    return body.isCatered
  }

  const selfCatered = retrieveQuestionResponseFromFormArtifact(application, Catering, 'catering')

  return selfCatered === 'no' ? 'essential' : 'notRelevant'
}

const isSingle = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): PlacementRequirementPreference => {
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
    ({ name, page }) => retrieveQuestionResponseFromFormArtifact(application, page, name) === 'yes',
  )

  return needsSingleRoom ? 'essential' : 'notRelevant'
}

const isSuitedForSexOffenders = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): PlacementRequirementPreference => {
  if (body.isSuitedForSexOffenders) {
    return body.isSuitedForSexOffenders
  }

  const hasSexualOffenceConviction = sexualOffencesFields.find(field => {
    const response = retrieveOptionalQuestionResponseFromFormArtifact(application, DateOfOffence, field) as
      | Array<string>
      | undefined

    return response?.find(value => ['current', 'previous'].includes(value))
  })

  return hasSexualOffenceConviction ? 'essential' : 'notRelevant'
}

const isWheelchairDesignated = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): PlacementRequirementPreference => {
  if (body.isWheelchairDesignated) {
    return body.isWheelchairDesignated
  }

  const needsWheelchair = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
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
  application: ApprovedPremisesApplication,
): Partial<MatchingInformationBody> => {
  return {
    isArsonDesignated: isArsonDesignated(body, application),
    isCatered: isCatered(body, application),
    isSingle: isSingle(body, application),
    isSuitedForSexOffenders: isSuitedForSexOffenders(body, application),
    isWheelchairDesignated: isWheelchairDesignated(body, application),
    lengthOfStay: lengthOfStay(body),
  }
}
