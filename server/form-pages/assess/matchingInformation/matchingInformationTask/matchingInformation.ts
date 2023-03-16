import type { ApType, Gender } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { lowerCase, sentenceCase } from '../../../../utils/utils'

const apTypes: Record<ApType, string> = {
  normal: 'Standard AP',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
  rfap: 'Recovery Focused Approved Premises (RFAP)',
} as const

const apGenders: Array<Gender> = ['male', 'female']

const placementRequirementPreferences = ['essential' as const, 'desirable' as const, 'notRelevant' as const]
type PlacementRequirementPreference = (typeof placementRequirementPreferences)[number]

export const placementRequirements = [
  'wheelchairAccessible' as const,
  'singleRoom' as const,
  'adaptedForHearingImpairments' as const,
  'adaptedForVisualImpairments' as const,
  'adaptedForRestrictedMobility' as const,
  'cateringRequired' as const,
]

export const offenceAndRiskInformationKeys = [
  'contactSexualOffencesAgainstAnAdultAdults',
  'nonContactSexualOffencesAgainstAnAdultAdults',
  'contactSexualOffencesAgainstChildren',
  'nonContactSexualOffencesAgainstChildren',
  'nonSexualOffencesAgainstChildren',
  'arsonOffences',
  'hateBasedOffences',
  'vulnerableToExploitation',
]

const offenceAndRiskInformationRelevance = ['relevant', 'notRelevant']
type OffenceAndRiskInformationRelevance = (typeof offenceAndRiskInformationRelevance)[number]

export type MatchingInformationBody = {
  apType: ApType
  apGender: Gender
  mentalHealthSupport?: '1' | '' | undefined
  wheelchairAccessible: PlacementRequirementPreference
  singleRoom: PlacementRequirementPreference
  adaptedForHearingImpairments: PlacementRequirementPreference
  adaptedForVisualImpairments: PlacementRequirementPreference
  adaptedForRestrictedMobility: PlacementRequirementPreference
  cateringRequired: PlacementRequirementPreference
  contactSexualOffencesAgainstAnAdultAdults: OffenceAndRiskInformationRelevance
  nonContactSexualOffencesAgainstAnAdultAdults: OffenceAndRiskInformationRelevance
  contactSexualOffencesAgainstChildren: OffenceAndRiskInformationRelevance
  nonContactSexualOffencesAgainstChildren: OffenceAndRiskInformationRelevance
  nonSexualOffencesAgainstChildren: OffenceAndRiskInformationRelevance
  arsonOffences: OffenceAndRiskInformationRelevance
  hateBasedOffences: OffenceAndRiskInformationRelevance
  vulnerableToExploitation: OffenceAndRiskInformationRelevance
}

@Page({
  name: 'matching-information',
  bodyProperties: [
    'apType',
    'apGender',
    'mentalHealthSupport',
    ...placementRequirements,
    ...offenceAndRiskInformationKeys,
  ],
})
export default class MatchingInformation implements TasklistPage {
  name = 'matching-information'

  title = 'Matching information'

  apTypeQuestion = 'What type of AP is required?'

  apTypes = apTypes

  apGenderQuestion = 'Which gender AP is required?'

  apGenders = apGenders

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

  constructor(public body: MatchingInformationBody) {
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
      [this.apGenderQuestion]: sentenceCase(this.apGenders[this.body.apGender === 'male' ? 0 : 1]),
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
    if (!this.body.apType) errors.apGender = 'You must select the gender of AP required'

    this.placementRequirements.forEach(placementRequirement => {
      if (!this.body[placementRequirement]) {
        errors[placementRequirement] = `You must specify a preference for ${lowerCase(placementRequirement)}`
      }
    })

    this.offenceAndRiskInformationKeys.forEach(offenceOrRiskInformation => {
      if (!this.body[offenceOrRiskInformation]) {
        errors[offenceOrRiskInformation] = `You must specify if ${lowerCase(offenceOrRiskInformation)} is relevant`
      }
    })

    return errors
  }
}
