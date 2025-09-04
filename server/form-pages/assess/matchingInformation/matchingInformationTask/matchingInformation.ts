import type { SummaryList, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import {
  defaultMatchingInformationValues,
  lengthOfStay,
  suggestedStaySummaryListOptions,
} from '../../../utils/matchingInformationUtils'
import { DateFormats, daysToWeeksAndDays } from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import {
  type ApTypeCriteria,
  type ApTypeSpecialist,
  type OffenceAndRiskCriteria,
  type PlacementRequirementCriteria,
  apTypeCriteriaLabels,
  applyApTypeToAssessApType,
  nonPrepopulatablePlacementRequirementCriteria,
  offenceAndRiskCriteria,
  placementCriteriaLabels,
  placementRequirementCriteria,
  prepopulatablePlacementRequirementCriteria,
} from '../../../../utils/placementCriteriaUtils'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'
import { womensApTypes } from '../../../apply/reasons-for-placement/type-of-ap/apType'
import { radioMatrixTable } from '../../../../utils/radioMatrixTable'

const placementRequirementPreferences = ['required' as const, 'notRequired' as const]
export type PlacementRequirementPreference = (typeof placementRequirementPreferences)[number]

const offenceAndRiskRelevance = ['relevant' as const, 'notRelevant' as const]
export type OffenceAndRiskRelevance = (typeof offenceAndRiskRelevance)[number]

export type MatchingInformationBody = {
  [Key in OffenceAndRiskCriteria | PlacementRequirementCriteria]:
    | OffenceAndRiskRelevance
    | PlacementRequirementPreference
} & {
  apType: ApTypeCriteria
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
    'cruInformation',
    ...placementRequirementCriteria,
    ...offenceAndRiskCriteria,
  ],
})
export default class MatchingInformation implements TasklistPage {
  name = 'matching-information'

  title = 'Matching information'

  questions = {
    apType: 'What type of AP is required?',
    lengthOfStayAgreed: 'Do you agree with the suggested length of stay?',
    lengthOfStay: 'Provide recommended length of stay',
    cruInformation: 'Information for Central Referral Unit (CRU) manager (optional)',
  }

  relevantInformationTable = () =>
    radioMatrixTable(
      ['Risks and offences to consider', 'Relevant', 'Not required'],
      offenceAndRiskCriteria,
      offenceAndRiskRelevance,
      this.body,
    )

  prepopulatedRequirementsTable = () => {
    return radioMatrixTable(
      ['Specify placement requirements', 'Required', 'Not required'],
      prepopulatablePlacementRequirementCriteria,
      placementRequirementPreferences,
      this.body,
    )
  }

  nonPrepopulatedRequirementsTable = () =>
    radioMatrixTable(
      ['Specify placement requirements', 'Required', 'Not required'],
      nonPrepopulatablePlacementRequirementCriteria,
      placementRequirementPreferences,
      this.body,
    )

  availableApTypes: Record<ApTypeCriteria, string>

  constructor(
    private _body: Partial<MatchingInformationBody>,
    public assessment: Assessment,
  ) {
    const mappedWomensApTypes = womensApTypes.map((type: ApTypeSpecialist) => applyApTypeToAssessApType?.[type] || type)
    this.availableApTypes = assessment.application.isWomensApplication
      ? Object.entries(apTypeCriteriaLabels).reduce(
          (types, [value, text]: [value: ApTypeCriteria, text: string]) => {
            if (value === 'normal' || mappedWomensApTypes.includes(value)) {
              types[value] = text
            }
            return types
          },
          {} as Record<ApTypeCriteria, string>,
        )
      : apTypeCriteriaLabels
  }

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

  private criteriaMap: Record<string, string> = {
    essential: 'Required',
  }

  private criterionValueText = (value: string) => {
    return this.criteriaMap[value] || sentenceCase(value)
  }

  response() {
    const response = {
      [this.questions.apType]: apTypeCriteriaLabels[this.body.apType],
    }

    placementRequirementCriteria.forEach(placementRequirementCriterion => {
      response[`${placementCriteriaLabels[placementRequirementCriterion]}`] =
        `${this.criterionValueText(this.body[placementRequirementCriterion])}`
    })

    offenceAndRiskCriteria.forEach(offenceOrRiskCriterion => {
      response[`${placementCriteriaLabels[offenceOrRiskCriterion]}`] = `${this.criterionValueText(
        this.body[offenceOrRiskCriterion],
      )}`
    })

    response['Do you agree with the suggested length of stay?'] = sentenceCase(this.body.lengthOfStayAgreed)

    if (this.body.lengthOfStayAgreed === 'no') {
      response['Recommended length of stay'] = DateFormats.formatDuration(daysToWeeksAndDays(lengthOfStay(this.body)), [
        'weeks',
        'days',
      ])
    }

    if (this.body.cruInformation) {
      response['Information for Central Referral Unit (CRU) manager'] = this.body.cruInformation
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!Object.keys(this.availableApTypes).includes(this.body.apType))
      errors.apType = 'You must select the type of AP required'

    placementRequirementCriteria.forEach(placementRequirementCriterion => {
      if (!this.body[placementRequirementCriterion]) {
        errors[placementRequirementCriterion] = `You must specify a preference for ${placementCriteriaLabels[
          placementRequirementCriterion
        ].toLowerCase()}`
      }
    })

    offenceAndRiskCriteria.forEach(offenceOrRiskCriterion => {
      if (!this.body[offenceOrRiskCriterion]) {
        errors[offenceOrRiskCriterion] = `You must specify if ${lowerCase(
          placementCriteriaLabels[offenceOrRiskCriterion],
        )} is relevant`
      }
    })

    if (!this.body.lengthOfStayAgreed) {
      errors.lengthOfStayAgreed = 'You must state if you agree with the length of the stay'
    }

    if (this.body.lengthOfStayAgreed === 'no') {
      if (!(Number(lengthOfStay(this.body)) > 0)) {
        errors.lengthOfStay = 'You must provide a recommended length of stay'
      }
    }

    return errors
  }

  get suggestedStaySummaryListOptions(): SummaryList {
    return suggestedStaySummaryListOptions(this.assessment.application)
  }

  get apTypeItems() {
    return convertKeyValuePairToRadioItems(this.availableApTypes, this.body.apType)
  }
}
