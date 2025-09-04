import { ApprovedPremisesApplication, ApprovedPremisesAssessment } from '@approved-premises/api'
import { weeksToDays } from 'date-fns'
import { BackwardsCompatibleApplyApType, SummaryList } from '@approved-premises/ui'
import { placementDates } from '../../utils/match'
import { DateFormats, daysToWeeksAndDays } from '../../utils/dateUtils'
import { placementDurationFromApplication } from '../../utils/applications/placementDurationFromApplication'
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
import { validWeeksAndDaysDuration } from '../../utils/formUtils'

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

  const applyValue: BackwardsCompatibleApplyApType = retrieveQuestionResponseFromFormArtifact(
    application,
    SelectApType,
    'type',
  )
  const applyAssessMap: Record<BackwardsCompatibleApplyApType, MatchingInformationBody['apType']> = {
    normal: 'normal',
    standard: 'normal',
    esap: 'isESAP',
    mhapElliottHouse: 'isMHAPElliottHouse',
    mhapStJosephs: 'isMHAPStJosephs',
    pipe: 'isPIPE',
    rfap: 'isRecoveryFocussed',
  }

  return applyAssessMap[applyValue]
}

export const lengthOfStay = ({
  lengthOfStayWeeks,
  lengthOfStayDays,
  lengthOfStayAgreed,
}: MatchingInformationBody): string | undefined => {
  if (lengthOfStayAgreed === 'no') {
    if (!validWeeksAndDaysDuration(lengthOfStayWeeks, lengthOfStayDays)) return undefined

    const lengthOfStayWeeksInDays = weeksToDays(Number(lengthOfStayWeeks || 0))
    const totalLengthInDays = lengthOfStayWeeksInDays + Number(lengthOfStayDays || 0)
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

const getBodyValue = <T extends GetValueOffenceAndRisk | GetValuePlacementRequirement>(
  body: MatchingInformationBody,
  bodyField: T['bodyField'],
  matchedReturnValue: T['returnType'],
  unmatchedReturnValue: T['returnType'],
): T['returnType'] => {
  const bodyValue = body[bodyField]
  if (bodyValue) {
    if (![matchedReturnValue, unmatchedReturnValue].includes(bodyValue)) {
      if (['essential', 'relevant', 'required'].includes(bodyValue)) return matchedReturnValue
      if (['notRelevant', 'notRequired', 'desirable'].includes(bodyValue)) return unmatchedReturnValue
    }
    return bodyValue
  }
  return undefined
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
  const bodyValue = getBodyValue(body, bodyField, matchedReturnValue, unmatchedReturnValue)
  if (bodyValue) return bodyValue

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
    isArsonSuitable: getValue<GetValuePlacementRequirement>(
      body,
      'isArsonSuitable',
      application,
      [{ name: 'arson', page: Arson }],
      ['yes'],
      'required',
      'notRequired',
    ),
    isCatered: getValue<GetValuePlacementRequirement>(
      body,
      'isCatered',
      application,
      [{ name: 'catering', page: Catering }],
      ['no'],
      'required',
      'notRequired',
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
      'required',
      'notRequired',
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
      'required',
      'notRequired',
    ),
    isWheelchairDesignated: getValue<GetValuePlacementRequirement>(
      body,
      'isWheelchairDesignated',
      application,
      [{ name: 'needsWheelchair', page: AccessNeedsFurtherQuestions, optional: true }],
      ['yes'],
      'required',
      'notRequired',
    ),
    isStepFreeDesignated: getBodyValue(body, 'isStepFreeDesignated', 'required', 'notRequired'),
    hasEnSuite: getBodyValue(body, 'hasEnSuite', 'required', 'notRequired'),
  }
}

// TODO: remove once arson remapping (APS-1876) is completed
export const remapArsonAssessmentData = (
  assessmentData: ApprovedPremisesAssessment['data'],
): ApprovedPremisesAssessment['data'] => {
  if (assessmentData?.['matching-information']?.['matching-information']) {
    const matchingInformationBody: MatchingInformationBody = {
      ...assessmentData['matching-information']['matching-information'],
    }
    matchingInformationBody.isArsonSuitable =
      matchingInformationBody.isArsonSuitable || matchingInformationBody.isArsonDesignated
    return {
      ...assessmentData,
      'matching-information': {
        ...assessmentData['matching-information'],
        'matching-information': matchingInformationBody,
      },
    }
  }
  return assessmentData
}

const suggestedStaySummaryListOptions = (application: ApprovedPremisesApplication): SummaryList => {
  const duration = placementDurationFromApplication(application)
  const formattedDuration = DateFormats.formatDuration(daysToWeeksAndDays(duration))
  const rows: SummaryList['rows'] = [
    { key: { text: 'Placement duration' }, value: { text: formattedDuration, classes: 'placement-duration' } },
  ]

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
    rows.push({
      key: { text: 'Dates of placement' },
      value: { text: `${formattedStartDate} - ${formattedEndDate}`, classes: 'dates-of-placement' },
    })
  }
  return {
    rows,
  }
}

export { defaultMatchingInformationValues, suggestedStaySummaryListOptions }
