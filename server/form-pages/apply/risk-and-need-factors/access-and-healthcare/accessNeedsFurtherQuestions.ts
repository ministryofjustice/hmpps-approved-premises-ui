import type { TaskListErrors, YesNoOrIDKWithDetail, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'
import { yesNoOrDontKnowResponseWithDetail, yesOrNoResponseWithDetailForYes } from '../../../utils'

import TasklistPage from '../../../tasklistPage'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import AccessNeeds, { AdditionalNeed, additionalNeeds } from './accessNeeds'

export type AccessNeedsFurtherQuestionsBody = {
  needsWheelchair: YesOrNo
  isPersonPregnant?: YesOrNo
  additionalAdjustments: string
} & YesOrNoWithDetail<'healthConditions'> &
  YesNoOrIDKWithDetail<'prescribedMedication'>

@Page({
  name: 'access-needs-further-questions',
  bodyProperties: [
    'needsWheelchair',
    'healthConditions',
    'healthConditionsDetail',
    'prescribedMedication',
    'prescribedMedicationDetail',
    'isPersonPregnant',
    'additionalAdjustments',
  ],
})
export default class AccessNeedsFurtherQuestions implements TasklistPage {
  title = 'Access, cultural and healthcare needs'

  questions = {
    wheelchair: `Does the person require the use of a wheelchair?`,
    healthConditions: `Does the person have any known health conditions?`,
    healthConditionsDetail: 'Provide details',
    prescribedMedication: `Does the person have any prescribed medication?`,
    prescribedMedicationDetail: 'Provide details',
    isPersonPregnant: `Is the person pregnant?`,
    additionalAdjustments: `Specify any additional details and adjustments required for the person's ${this.listOfNeeds}`,
  }

  yesToPregnancyHealthcareQuestion: boolean = this.answeredYesToPregnancyHealthcareQuestion()

  constructor(
    public body: Partial<AccessNeedsFurtherQuestionsBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'access-needs'
  }

  next() {
    return this.body.isPersonPregnant === 'yes' ? 'pregnancy' : 'covid'
  }

  public get additionalNeeds(): Array<AdditionalNeed> {
    return retrieveOptionalQuestionResponseFromFormArtifact(this.application, AccessNeeds, 'additionalNeeds')
  }

  public get listOfNeeds(): string {
    const needs = this.additionalNeeds.map(need => additionalNeeds[need])

    if (needs.length > 0) {
      if (needs.length === 1) {
        return lowerCase(`${needs[0]} needs`)
      }

      const lastNeed = needs.splice(-1)

      return lowerCase(`${needs.join(', ')} or ${lastNeed} needs`)
    }

    return null
  }

  answeredYesToPregnancyHealthcareQuestion() {
    return this.additionalNeeds.includes('pregnancy')
  }

  response() {
    const response = {
      [this.questions.wheelchair]: sentenceCase(this.body.needsWheelchair),
      [this.questions.healthConditions]: yesOrNoResponseWithDetailForYes('healthConditions', this.body),
      [this.questions.prescribedMedication]: yesNoOrDontKnowResponseWithDetail('prescribedMedication', this.body),
    }

    if (this.answeredYesToPregnancyHealthcareQuestion()) {
      response[this.questions.isPersonPregnant] = sentenceCase(this.body.isPersonPregnant)
    }

    response[this.questions.additionalAdjustments] = this.body.additionalAdjustments

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.needsWheelchair) {
      errors.needsWheelchair = 'You must confirm the need for a wheelchair'
    }

    if (!this.body.healthConditions) {
      errors.healthConditions = `You must specify if the person has any known health conditions`
    }

    if (this.body.healthConditions === 'yes' && !this.body.healthConditionsDetail) {
      errors.healthConditionsDetail = `You must provide details of the person's health conditions`
    }

    if (!this.body.prescribedMedication) {
      errors.prescribedMedication = `You must specify if the person has any prescribed medication`
    }

    if (this.body.prescribedMedication === 'yes' && !this.body.prescribedMedicationDetail) {
      errors.prescribedMedicationDetail = `You must provide details of the person's prescribed medication`
    }

    if (this.answeredYesToPregnancyHealthcareQuestion()) {
      if (!this.body.isPersonPregnant) {
        errors.isPersonPregnant = `You must confirm if the person is pregnant`
      }
    }

    return errors
  }
}
