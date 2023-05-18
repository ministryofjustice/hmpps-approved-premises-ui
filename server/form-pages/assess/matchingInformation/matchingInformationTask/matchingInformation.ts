import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'

import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { placementDurationFromApplication } from '../../../../utils/assessments/placementDurationFromApplication'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import {
  AccessibilityCriteria,
  ApTypeCriteria,
  OffenceAndRiskCriteria,
  PlacementRequirementCriteria,
  SpecialistSupportCriteria,
  accessibilityOptions,
  apTypeOptions,
  offenceAndRiskOptions,
  placementCriteria,
  placementRequirementOptions,
  specialistSupportOptions,
} from '../../../../utils/placementCriteriaUtils'

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
  accessibilityCriteria: Array<AccessibilityCriteria>
  specialistSupportCriteria: Array<SpecialistSupportCriteria>
  cruInformation: string
} & YesOrNoWithDetail<'lengthOfStayAgreed'>

@Page({
  name: 'matching-information',
  bodyProperties: [
    'apType',
    'accessibilityCriteria',
    'specialistSupportCriteria',
    'lengthOfStayAgreed',
    'lengthOfStayAgreedDetail',
    'cruInformation',
    ...placementRequirements,
    ...offenceAndRiskInformationKeys,
  ],
})
export default class MatchingInformation implements TasklistPage {
  name = 'matching-information'

  title = 'Matching information'

  apTypeQuestion = 'What type of AP is required?'

  apTypes = apTypeOptions

  placementRequirementTableHeadings = ['Specify placement requirements', 'Essential', 'Desirable', 'Not relevant']

  placementRequirements = placementRequirements

  placementRequirementPreferences = placementRequirementPreferences

  relevantInformationTableHeadings = ['Risks and offences to consider', 'Relevant', 'Not relevant']

  offenceAndRiskInformationKeys = offenceAndRiskInformationKeys

  offenceAndRiskInformationRelevance = offenceAndRiskInformationRelevance

  accessibilityOptions = accessibilityOptions

  specialistSupportOptions = specialistSupportOptions

  constructor(private _body: Partial<MatchingInformationBody>, public assessment: Assessment) {}

  set body(value: MatchingInformationBody) {
    this._body = value
  }

  get body(): MatchingInformationBody {
    return {
      ...this._body,
      accessibilityCriteria: this._body.accessibilityCriteria ? [this._body.accessibilityCriteria].flat() : [],
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
      [this.apTypeQuestion]: this.apTypes[this.body.apType],
    }

    response['Specialist support needs'] = this.selectedOptions('specialistSupport')
    response['Accessibility needs'] = this.selectedOptions('accessibility')

    this.placementRequirements.forEach(placementRequirement => {
      response[`${sentenceCase(placementRequirement)}`] = `${sentenceCase(this.body[placementRequirement])}`
    })

    this.offenceAndRiskInformationKeys.forEach(offenceOrRiskInformation => {
      response[`${sentenceCase(offenceOrRiskInformation)}`] = `${sentenceCase(this.body[offenceOrRiskInformation])}`
    })

    response['Do you agree with the suggested length of stay?'] = sentenceCase(this.body.lengthOfStayAgreed)

    if (this.body.lengthOfStayAgreedDetail) {
      response['Recommended length of stay'] = `${this.body.lengthOfStayAgreedDetail} weeks`
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

    if (this.body.lengthOfStayAgreed === 'no' && !this.body.lengthOfStayAgreedDetail) {
      errors.lengthOfStayAgreedDetail = 'You must provide a recommended length of stay'
    }

    return errors
  }

  get suggestedLengthOfStay() {
    return placementDurationFromApplication(this.assessment.application)
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

  get accessibilityCheckBoxes() {
    return Object.keys(accessibilityOptions).map((k: AccessibilityCriteria) => {
      return {
        value: k,
        text: accessibilityOptions[k],
        checked: (this.body.accessibilityCriteria || []).includes(k),
      }
    })
  }

  private selectedOptions(key: 'specialistSupport' | 'accessibility') {
    const selectedOptions = this.body[`${key}Criteria`] || []

    return selectedOptions.length ? selectedOptions.map((k: string) => this[`${key}Options`][k]).join(', ') : 'None'
  }
}
