import type {
  ObjectWithDateParts,
  TaskListErrors,
  YesNoOrIDKWithDetail,
  YesOrNo,
  YesOrNoWithDetail,
} from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { lowerCase, sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'
import { yesNoOrDontKnowResponseWithDetail, yesOrNoResponseWithDetailForYes } from '../../../utils'

import TasklistPage from '../../../tasklistPage'
import { DateFormats } from '../../../../utils/dateUtils'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import AccessNeeds, { AdditionalNeed, additionalNeeds } from './accessNeeds'

export type AccessNeedsFurtherQuestionsBody = {
  needsWheelchair: YesOrNo
  isPersonPregnant?: YesOrNo
  childRemoved?: YesOrNo | 'decisionPending'
  additionalAdjustments: string
} & ObjectWithDateParts<'expectedDeliveryDate'> &
  YesOrNoWithDetail<'healthConditions'> &
  YesNoOrIDKWithDetail<'prescribedMedication'> &
  YesNoOrIDKWithDetail<'socialCareInvolvement'> &
  YesOrNoWithDetail<'otherPregnancyConsiderations'>

@Page({
  name: 'access-needs-further-questions',
  bodyProperties: [
    'needsWheelchair',
    'healthConditions',
    'healthConditionsDetail',
    'prescribedMedication',
    'prescribedMedicationDetail',
    'isPersonPregnant',
    'childRemoved',
    'expectedDeliveryDate',
    'expectedDeliveryDate-year',
    'expectedDeliveryDate-month',
    'expectedDeliveryDate-day',
    'socialCareInvolvement',
    'socialCareInvolvementDetail',
    'otherPregnancyConsiderations',
    'otherPregnancyConsiderationsDetail',
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
    expectedDeliveryDate: 'What is their expected date of delivery?',
    otherPregnancyConsiderationsDetail: 'Provide details',
    socialCareInvolvement: 'Is there social care involvement?',
    socialCareInvolvementDetail: 'Provide details',
    otherPregnancyConsiderations: 'Are there any pregnancy related issues relevant to placement?',
    childRemoved: `Will the child be removed from the person's care at birth?`,
    additionalAdjustments: `Specify any additional details and adjustments required for the person's ${this.listOfNeeds}`,
  }

  yesToPregnancyHealthcareQuestion: boolean = this.answeredYesToPregnancyHealthcareQuestion()

  constructor(
    private _body: Partial<AccessNeedsFurtherQuestionsBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  public set body(value: Partial<AccessNeedsFurtherQuestionsBody>) {
    if (value.isPersonPregnant === 'yes') {
      this._body = {
        ...value,
        'expectedDeliveryDate-year': value['expectedDeliveryDate-year'] as string,
        'expectedDeliveryDate-month': value['expectedDeliveryDate-month'] as string,
        'expectedDeliveryDate-day': value['expectedDeliveryDate-day'] as string,
        expectedDeliveryDate: DateFormats.dateAndTimeInputsToIsoString(
          value as ObjectWithDateParts<'expectedDeliveryDate'>,
          'expectedDeliveryDate',
        ).expectedDeliveryDate,
      }
    }
  }

  public get body(): AccessNeedsFurtherQuestionsBody {
    return this._body as AccessNeedsFurtherQuestionsBody
  }

  previous() {
    return 'access-needs'
  }

  next() {
    return 'covid'
  }

  public get additionalNeeds(): Array<AdditionalNeed> {
    return retrieveOptionalQuestionResponseFromApplicationOrAssessment(this.application, AccessNeeds, 'additionalNeeds')
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

      if (this.body.isPersonPregnant === 'yes') {
        response[this.questions.expectedDeliveryDate] = DateFormats.isoDateToUIDate(this.body.expectedDeliveryDate)
        response[this.questions.childRemoved] = sentenceCase(this.body.childRemoved)
        response[this.questions.socialCareInvolvement] = yesNoOrDontKnowResponseWithDetail(
          'socialCareInvolvement',
          this.body,
        )
      }

      response[this.questions.otherPregnancyConsiderations] = yesOrNoResponseWithDetailForYes(
        'otherPregnancyConsiderations',
        this.body,
      )
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

      if (this.body.isPersonPregnant === 'yes') {
        if (!this.body.expectedDeliveryDate) {
          errors.expectedDeliveryDate = 'You must enter the expected delivery date'
        }
        if (!this.body.childRemoved) {
          errors.childRemoved = 'You must confirm if the child will be removed at birth'
        }
        if (!this.body.socialCareInvolvement) {
          errors.socialCareInvolvement = 'You must confirm if there is social care involvement'
        }
        if (this.body.socialCareInvolvement === 'yes' && !this.body.socialCareInvolvementDetail) {
          errors.socialCareInvolvementDetail = 'You must provide details of any social care involvement'
        }
      }

      if (this.body.otherPregnancyConsiderations === 'yes' && !this.body.otherPregnancyConsiderationsDetail) {
        errors.otherPregnancyConsiderationsDetail =
          'You must provide details of any pregnancy related issues relevant to the placement'
      }
    }

    return errors
  }
}
