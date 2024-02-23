import { weeksToDays } from 'date-fns'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import { DateFormats } from '../../../../utils/dateUtils'
import { daysToWeeksAndDays } from '../../../../utils/assessments/dateUtils'
import { placementDurationFromApplication } from '../../../../utils/assessments/placementDurationFromApplication'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import {
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  SpecialistSupportCriteria,
  apTypeOptions,
  offenceAndRiskOptions,
  placementCriteria,
  placementRequirementOptions,
  specialistSupportOptions,
} from '../../../../utils/placementCriteriaUtils'
import AccessNeedsFurtherQuestions from '../../../apply/risk-and-need-factors/access-and-healthcare/accessNeedsFurtherQuestions'

const placementRequirements = Object.keys(placementRequirementOptions)
const placementRequirementPreferences = ['essential' as const, 'desirable' as const, 'notRelevant' as const]
type PlacementRequirementPreference = (typeof placementRequirementPreferences)[number]

const offenceAndRiskInformationKeys = Object.keys(offenceAndRiskOptions)
const offenceAndRiskInformationRelevance = ['relevant', 'notRelevant']
type OffenceAndRiskInformationRelevance = (typeof offenceAndRiskInformationRelevance)[number]

export type MatchingInformationBody = {
  [Key in OffenceAndRiskCriteria | PlacementRequirementCriteria]: Key extends OffenceAndRiskCriteria
    ? OffenceAndRiskInformationRelevance
    : Key extends PlacementRequirementCriteria
      ? PlacementRequirementPreference
      : never
} & {
  apType: ApTypeCriteria | 'normal'
  specialistSupportCriteria: Array<SpecialistSupportCriteria>
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
    'specialistSupportCriteria',
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
    specialistSupportCriteria: 'If this person would benefit from specialist support, select the relevant option below',
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

  specialistSupportOptions = specialistSupportOptions

  constructor(
    private _body: Partial<MatchingInformationBody>,
    public assessment: Assessment,
  ) {}

  set body(value: MatchingInformationBody) {
    this._body = { ...value, isWheelchairDesignated: this.isWheelchairDesignated(), lengthOfStay: this.lengthInDays() }
  }

  get body(): MatchingInformationBody {
    return {
      ...this._body,
      specialistSupportCriteria: this._body.specialistSupportCriteria
        ? [this._body.specialistSupportCriteria].flat()
        : [],
    } as MatchingInformationBody
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

    const selectedOptions = this.body.specialistSupportCriteria || []

    response['Specialist support needs'] = selectedOptions.length
      ? selectedOptions.map((k: string) => this.specialistSupportOptions[k]).join(', ')
      : 'None'

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

  get suggestedLengthOfStay() {
    return DateFormats.formatDuration(daysToWeeksAndDays(placementDurationFromApplication(this.assessment.application)))
  }

  get specialistSupportCheckboxes() {
    return Object.keys(specialistSupportOptions).map((k: SpecialistSupportCriteria) => {
      return {
        value: k,
        text: specialistSupportOptions[k],
        checked: (this.body.specialistSupportCriteria || []).includes(k),
      }
    })
  }

  private isWheelchairDesignated(): PlacementRequirementPreference {
    if (this.body.isWheelchairDesignated) {
      return this.body.isWheelchairDesignated
    }

    const needsWheelchair = retrieveOptionalQuestionResponseFromFormArtifact(
      this.assessment.application,
      AccessNeedsFurtherQuestions,
      'needsWheelchair',
    )

    return needsWheelchair === 'yes' ? 'essential' : 'notRelevant'
  }

  private lengthInDays(): string | undefined {
    if (this.body.lengthOfStayAgreed === 'no') {
      if (this.body.lengthOfStayDays && this.body.lengthOfStayWeeks) {
        const lengthOfStayWeeksInDays = weeksToDays(Number(this.body.lengthOfStayWeeks))
        const totalLengthInDays = lengthOfStayWeeksInDays + Number(this.body.lengthOfStayDays)

        return String(totalLengthInDays)
      }
    }

    return undefined
  }
}
