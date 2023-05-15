import type { TaskListErrors } from '@approved-premises/ui'

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
  mentalHealthSupport: '1' | '' | undefined
}

@Page({
  name: 'matching-information',
  bodyProperties: ['apType', 'mentalHealthSupport', ...placementRequirements, ...offenceAndRiskInformationKeys],
})
export default class MatchingInformation implements TasklistPage {
  name = 'matching-information'

  title = 'Matching information'

  apTypeQuestion = 'What type of AP is required?'

  apTypes = apTypeOptions

  placementRequirementTableHeadings = ['Placement requirements', 'Essential', 'Desirable', 'Not relevant']

  placementRequirements = placementRequirements

  placementRequirementPreferences = placementRequirementPreferences

  relevantInformationTableHeadings = ['Offence and risk information', 'Relevant', 'Not relevant']

  offenceAndRiskInformationKeys = offenceAndRiskInformationKeys

  offenceAndRiskInformationRelevance = offenceAndRiskInformationRelevance

  mentalHealthSupport = {
    question: 'If this person requires specialist mental health support, select the box below',
    hint: 'There are only two AP nationally with a semi-specialism in mental health. Placement in one of these AP is not guaranteed.',
    label: 'Semi-specialist mental health',
    value: '',
  }

  constructor(public body: Partial<MatchingInformationBody>) {
    this.mentalHealthSupport.value = body.mentalHealthSupport
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
      [this.mentalHealthSupport.question]:
        this.body.mentalHealthSupport === '1' ? `${this.mentalHealthSupport.label} selected` : 'Unselected',
    }

    this.placementRequirements.forEach(placementRequirement => {
      response[`${sentenceCase(placementRequirement)}`] = `${sentenceCase(this.body[placementRequirement])}`
    })

    this.offenceAndRiskInformationKeys.forEach(offenceOrRiskInformation => {
      response[`${sentenceCase(offenceOrRiskInformation)}`] = `${sentenceCase(this.body[offenceOrRiskInformation])}`
    })

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

    return errors
  }
}
