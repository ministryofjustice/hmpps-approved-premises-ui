import type { SummaryList, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { defaultMatchingInformationValues } from '../../../utils/defaultMatchingInformationValues'
import { DateFormats, daysToWeeksAndDays } from '../../../../utils/dateUtils'
import { placementDurationFromApplication } from '../../../../utils/assessments/placementDurationFromApplication'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import {
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  apTypeOptions,
  offenceAndRiskOptions,
  placementCriteria,
  placementRequirementOptions,
} from '../../../../utils/placementCriteriaUtils'
import PlacementDate from '../../../apply/reasons-for-placement/basic-information/placementDate'
import ReleaseDate from '../../../apply/reasons-for-placement/basic-information/releaseDate'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import { placementDates } from '../../../../utils/matchUtils'

const placementRequirements = Object.keys(placementRequirementOptions)
const placementRequirementPreferences = ['essential' as const, 'desirable' as const, 'notRelevant' as const]
export type PlacementRequirementPreference = (typeof placementRequirementPreferences)[number]

const offenceAndRiskInformationKeys = Object.keys(offenceAndRiskOptions)
const offenceAndRiskInformationRelevance = ['relevant' as const, 'notRelevant' as const]
export type OffenceAndRiskInformationRelevance = (typeof offenceAndRiskInformationRelevance)[number]

export type MatchingInformationBody = {
  [Key in OffenceAndRiskCriteria | PlacementRequirementCriteria]: Key extends OffenceAndRiskCriteria
    ? OffenceAndRiskInformationRelevance
    : Key extends PlacementRequirementCriteria
      ? PlacementRequirementPreference
      : never
} & {
  apType: ApTypeCriteria | 'normal'
  cruInformation: string
  lengthOfStayAgreed: YesOrNo
  lengthOfStayWeeks: string
  lengthOfStayDays: string
  lengthOfStay: string
}

@Page({
  name: 'matching-information',
  bodyProperties: [
    'apType',
    'lengthOfStayAgreed',
    'lengthOfStayWeeks',
    'lengthOfStayDays',
    'lengthOfStay',
    'cruInformation',
    ...placementRequirements,
    ...offenceAndRiskInformationKeys,
  ],
})
export default class MatchingInformation implements TasklistPage {
  name = 'matching-information'

  title = 'Matching information'

  apTypes = apTypeOptions

  questions = {
    apType: 'What type of AP is required?',
    lengthOfStayAgreed: 'Do you agree with the suggested length of stay?',
    lengthOfStay: 'Provide recommended length of stay',
    cruInformation: 'Information for Central Referral Unit (CRU) manager (optional)',
  }

  placementRequirementTableHeadings = ['Specify placement requirements', 'Essential', 'Desirable', 'Not required']

  placementRequirements = placementRequirements

  placementRequirementPreferences = placementRequirementPreferences

  relevantInformationTableHeadings = ['Risks and offences to consider', 'Relevant', 'Not required']

  offenceAndRiskInformationKeys = offenceAndRiskInformationKeys

  offenceAndRiskInformationRelevance = offenceAndRiskInformationRelevance

  constructor(
    private _body: Partial<MatchingInformationBody>,
    public assessment: Assessment,
  ) {}

  set body(value: MatchingInformationBody) {
    this._body = { ...value, ...defaultMatchingInformationValues(this.body, this.assessment.application) }
  }

  get body(): MatchingInformationBody {
    return this._body as MatchingInformationBody
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.questions.apType]: this.apTypes[this.body.apType],
    }

    this.placementRequirements.forEach(placementRequirement => {
      response[`${placementCriteria[placementRequirement]}`] = `${sentenceCase(this.body[placementRequirement])}`
    })

    this.offenceAndRiskInformationKeys.forEach(offenceOrRiskInformation => {
      response[`${placementCriteria[offenceOrRiskInformation]}`] = `${sentenceCase(
        this.body[offenceOrRiskInformation],
      )}`
    })

    response['Do you agree with the suggested length of stay?'] = sentenceCase(this.body.lengthOfStayAgreed)

    if (this.body.lengthOfStayAgreed === 'no') {
      response['Recommended length of stay'] = DateFormats.formatDuration({
        weeks: this.body.lengthOfStayWeeks,
        days: this.body.lengthOfStayDays,
      })
    }

    if (this.body.cruInformation) {
      response['Information for Central Referral Unit (CRU) manager'] = this.body.cruInformation
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.apType) errors.apType = 'You must select the type of AP required'

    this.placementRequirements.forEach(placementRequirement => {
      if (!this.body[placementRequirement]) {
        errors[placementRequirement] = `You must specify a preference for ${lowerCase(
          placementCriteria[placementRequirement],
        )}`
      }
    })

    this.offenceAndRiskInformationKeys.forEach(offenceOrRiskInformation => {
      if (!this.body[offenceOrRiskInformation]) {
        errors[offenceOrRiskInformation] = `You must specify if ${lowerCase(
          placementCriteria[offenceOrRiskInformation],
        )} is relevant`
      }
    })

    if (!this.body.lengthOfStayAgreed) {
      errors.lengthOfStayAgreed = 'You must state if you agree with the length of the stay'
    }

    if (this.body.lengthOfStayAgreed === 'no' && !this.body.lengthOfStayWeeks && !this.body.lengthOfStayDays) {
      errors.lengthOfStay = 'You must provide a recommended length of stay'
    }

    return errors
  }

  get suggestedStaySummaryListOptions(): SummaryList {
    const duration = placementDurationFromApplication(this.assessment.application)
    const formattedDuration = DateFormats.formatDuration(daysToWeeksAndDays(duration))

    const startDateSameAsReleaseDate = retrieveQuestionResponseFromFormArtifact(
      this.assessment.application,
      PlacementDate,
      'startDateSameAsReleaseDate',
    )
    const placementStartDate =
      startDateSameAsReleaseDate === 'yes'
        ? retrieveOptionalQuestionResponseFromFormArtifact(this.assessment.application, ReleaseDate)
        : retrieveOptionalQuestionResponseFromFormArtifact(this.assessment.application, PlacementDate, 'startDate')
    const placementDatesObject = placementDates(placementStartDate, duration.toString())
    const formattedStartDate = DateFormats.isoDateToUIDate(placementDatesObject.startDate)
    const formattedEndDate = DateFormats.isoDateToUIDate(placementDatesObject.endDate)

    return {
      rows: [
        { key: { text: 'Placement duration' }, value: { text: formattedDuration } },
        { key: { text: 'Dates of placement' }, value: { text: `${formattedStartDate} - ${formattedEndDate}` } },
      ],
    }
  }
}
