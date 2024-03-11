import { ApprovedPremisesApplication, TemporaryApplyApTypeAwaitingApiChange } from '@approved-premises/api'
import { weeksToDays } from 'date-fns'
import { SummaryList } from '@approved-premises/ui'
import { placementDates } from '../../utils/matchUtils'
import { DateFormats, daysToWeeksAndDays } from '../../utils/dateUtils'
import { placementDurationFromApplication } from '../../utils/assessments/placementDurationFromApplication'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../utils/retrieveQuestionResponseFromFormArtifact'
import type {
  MatchingInformationBody,
  OffenceAndRiskRelevance,
  PlacementRequirementPreference,
} from '../assess/matchingInformation/matchingInformationTask/matchingInformation'
import AccessNeedsFurtherQuestions from '../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'
import Catering from '../apply/risk-and-need-factors/further-considerations/catering'
import Arson from '../apply/risk-and-need-factors/further-considerations/arson'
import RoomSharing from '../apply/risk-and-need-factors/further-considerations/roomSharing'
import Covid from '../apply/risk-and-need-factors/access-and-healthcare/covid'
import { TasklistPageInterface } from '../tasklistPage'
import DateOfOffence from '../apply/risk-and-need-factors/risk-management-features/dateOfOffence'
import Vulnerability from '../apply/risk-and-need-factors/further-considerations/vulnerability'
import { OffenceAndRiskCriteria, PlacementRequirementCriteria } from '../../utils/placementCriteriaUtils'
import SelectApType from '../apply/reasons-for-placement/type-of-ap/apType'
import PlacementDate from '../apply/reasons-for-placement/basic-information/placementDate'
import ReleaseDate from '../apply/reasons-for-placement/basic-information/releaseDate'

export interface TaskListPageField {
  name: string
  page: TasklistPageInterface
  optional?: boolean
}

const apType = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): MatchingInformationBody['apType'] => {
  if (body.apType) {
    return body.apType
  }

  const applyValue = retrieveQuestionResponseFromFormArtifact(application, SelectApType, 'type')
  const applyAssessMap: Record<TemporaryApplyApTypeAwaitingApiChange, MatchingInformationBody['apType']> = {
    standard: 'normal',
    esap: 'isESAP',
    pipe: 'isPIPE',
  }

  return applyAssessMap[applyValue]
}

const lengthOfStay = (body: MatchingInformationBody): string | undefined => {
  if (body.lengthOfStayAgreed === 'no' && body.lengthOfStayDays && body.lengthOfStayWeeks) {
    const lengthOfStayWeeksInDays = weeksToDays(Number(body.lengthOfStayWeeks))
    const totalLengthInDays = lengthOfStayWeeksInDays + Number(body.lengthOfStayDays)

    return String(totalLengthInDays)
  }

  return undefined
}

type YesNoCurrentPrevious = 'yes' | 'no' | 'current' | 'previous'
type GetValueOffenceAndRisk = { bodyField: OffenceAndRiskCriteria; returnType: OffenceAndRiskRelevance }
type GetValuePlacementRequirement = {
  bodyField: PlacementRequirementCriteria
  returnType: PlacementRequirementPreference
}

const getValue = <T extends GetValueOffenceAndRisk | GetValuePlacementRequirement>(
  body: MatchingInformationBody,
  bodyField: T['bodyField'],
  application: ApprovedPremisesApplication,
  fieldsToCheck: Array<TaskListPageField>,
  lookForValues: Array<YesNoCurrentPrevious>,
  matchedReturnValue: T['returnType'],
  unmatchedReturnValue: T['returnType'],
): T['returnType'] => {
  if (body[bodyField]) {
    return body[bodyField]
  }

  const match = fieldsToCheck.find(({ name, page, optional }) => {
    const retrieveMethod = optional
      ? retrieveOptionalQuestionResponseFromFormArtifact
      : retrieveQuestionResponseFromFormArtifact

    const response = retrieveMethod(application, page, name) as
      | YesNoCurrentPrevious
      | Array<YesNoCurrentPrevious>
      | undefined

    return [response].flat()?.find(value => lookForValues.includes(value))
  })

  return match ? matchedReturnValue : unmatchedReturnValue
}

const defaultMatchingInformationValues = (
  body: MatchingInformationBody,
  application: ApprovedPremisesApplication,
): Partial<MatchingInformationBody> => {
  return {
    acceptsChildSexOffenders: getValue<GetValueOffenceAndRisk>(
      body,
      'acceptsChildSexOffenders',
      application,
      [
        { name: 'contactSexualOffencesAgainstChildren', page: DateOfOffence, optional: true },
        { name: 'nonContactSexualOffencesAgainstChildren', page: DateOfOffence, optional: true },
      ],
      ['current', 'previous'],
      'relevant',
      'notRelevant',
    ),
    acceptsHateCrimeOffenders: getValue<GetValueOffenceAndRisk>(
      body,
      'acceptsHateCrimeOffenders',
      application,
      [{ name: 'hateCrime', page: DateOfOffence, optional: true }],
      ['current', 'previous'],
      'relevant',
      'notRelevant',
    ),
    acceptsNonSexualChildOffenders: getValue<GetValueOffenceAndRisk>(
      body,
      'acceptsNonSexualChildOffenders',
      application,
      [{ name: 'nonSexualOffencesAgainstChildren', page: DateOfOffence, optional: true }],
      ['current', 'previous'],
      'relevant',
      'notRelevant',
    ),
    acceptsSexOffenders: getValue<GetValueOffenceAndRisk>(
      body,
      'acceptsSexOffenders',
      application,
      [
        { name: 'contactSexualOffencesAgainstAdults', page: DateOfOffence, optional: true },
        { name: 'nonContactSexualOffencesAgainstAdults', page: DateOfOffence, optional: true },
      ],
      ['current', 'previous'],
      'relevant',
      'notRelevant',
    ),
    apType: apType(body, application),
    isArsonDesignated: getValue<GetValuePlacementRequirement>(
      body,
      'isArsonDesignated',
      application,
      [{ name: 'arson', page: Arson }],
      ['yes'],
      'essential',
      'notRelevant',
    ),
    isArsonSuitable: getValue<GetValueOffenceAndRisk>(
      body,
      'isArsonSuitable',
      application,
      [{ name: 'arsonOffence', page: DateOfOffence, optional: true }],
      ['current', 'previous'],
      'relevant',
      'notRelevant',
    ),
    isCatered: getValue<GetValuePlacementRequirement>(
      body,
      'isCatered',
      application,
      [{ name: 'catering', page: Catering }],
      ['no'],
      'essential',
      'notRelevant',
    ),
    isSingle: getValue<GetValuePlacementRequirement>(
      body,
      'isSingle',
      application,
      [
        { name: 'boosterEligibility', page: Covid },
        { name: 'immunosuppressed', page: Covid },
        { name: 'riskToOthers', page: RoomSharing },
        { name: 'riskToStaff', page: RoomSharing },
        { name: 'sharingConcerns', page: RoomSharing },
        { name: 'traumaConcerns', page: RoomSharing },
      ],
      ['yes'],
      'essential',
      'notRelevant',
    ),
    isSuitableForVulnerable: getValue<GetValueOffenceAndRisk>(
      body,
      'isSuitableForVulnerable',
      application,
      [{ name: 'exploitable', page: Vulnerability }],
      ['yes'],
      'relevant',
      'notRelevant',
    ),
    isSuitedForSexOffenders: getValue<GetValuePlacementRequirement>(
      body,
      'isSuitedForSexOffenders',
      application,
      [
        { name: 'contactSexualOffencesAgainstAdults', page: DateOfOffence, optional: true },
        { name: 'nonContactSexualOffencesAgainstAdults', page: DateOfOffence, optional: true },
        { name: 'contactSexualOffencesAgainstChildren', page: DateOfOffence, optional: true },
        { name: 'nonContactSexualOffencesAgainstChildren', page: DateOfOffence, optional: true },
      ],
      ['current', 'previous'],
      'essential',
      'notRelevant',
    ),
    isWheelchairDesignated: getValue<GetValuePlacementRequirement>(
      body,
      'isWheelchairDesignated',
      application,
      [{ name: 'needsWheelchair', page: AccessNeedsFurtherQuestions, optional: true }],
      ['yes'],
      'essential',
      'notRelevant',
    ),
    lengthOfStay: lengthOfStay(body),
  }
}

const suggestedStaySummaryListOptions = (application: ApprovedPremisesApplication): SummaryList => {
  const duration = placementDurationFromApplication(application)
  const formattedDuration = DateFormats.formatDuration(daysToWeeksAndDays(duration))
  const rows = [{ key: { text: 'Placement duration' }, value: { text: formattedDuration } }]

  const knownReleaseDate = retrieveQuestionResponseFromFormArtifact(application, ReleaseDate, 'knowReleaseDate')

  if (knownReleaseDate === 'yes') {
    const startDateSameAsReleaseDate = retrieveQuestionResponseFromFormArtifact(
      application,
      PlacementDate,
      'startDateSameAsReleaseDate',
    )
    const placementStartDate =
      startDateSameAsReleaseDate === 'yes'
        ? retrieveOptionalQuestionResponseFromFormArtifact(application, ReleaseDate)
        : retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDate, 'startDate')

    const placementDatesObject = placementDates(placementStartDate, duration.toString())
    const formattedStartDate = DateFormats.isoDateToUIDate(placementDatesObject.startDate)
    const formattedEndDate = DateFormats.isoDateToUIDate(placementDatesObject.endDate)
    rows.push({ key: { text: 'Dates of placement' }, value: { text: `${formattedStartDate} - ${formattedEndDate}` } })
  }
  return {
    rows,
  }
}

export { defaultMatchingInformationValues, suggestedStaySummaryListOptions }
