import type {
  ObjectWithDateParts,
  TaskListErrors,
  YesNoOrIDKWithDetail,
  YesOrNo,
  YesOrNoWithDetail,
} from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'
import { yesNoOrDontKnowResponseWithDetail, yesOrNoResponseWithDetail } from '../../../utils'

import TasklistPage from '../../../tasklistPage'
import { DateFormats } from '../../../../utils/dateUtils'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment'
import AccessNeeds from './accessNeeds'

export type AccessNeedsFurtherQuestionsBody = {
  needsWheelchair: YesOrNo
  isPersonPregnant?: YesOrNo
  otherPregnancyConsiderations: string
  childRemoved?: YesOrNo | 'decisionPending'
} & ObjectWithDateParts<'expectedDeliveryDate'> &
  YesOrNoWithDetail<'healthConditions'> &
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
    'childRemoved',
    'expectedDeliveryDate',
    'expectedDeliveryDate-year',
    'expectedDeliveryDate-month',
    'expectedDeliveryDate-day',
    'otherPregnancyConsiderations',
  ],
})
export default class AccessNeedsFurtherQuestions implements TasklistPage {
  title = 'Access, cultural and healthcare needs'

  questions = {
    wheelchair: `Does ${this.application.person.name} require the use of a wheelchair?`,
    healthConditions: `Does ${this.application.person.name} have any known health conditions?`,
    healthConditionsDetail: 'Provide details',
    prescribedMedication: `Does ${this.application.person.name} have any prescribed medication?`,
    prescribedMedicationDetail: 'Provide details',
    isPersonPregnant: `Is ${this.application.person.name} pregnant?`,
    expectedDeliveryDate: 'What is their expected date of delivery?',
    otherPregnancyConsiderations: 'Are there any other considerations',
    childRemoved: `Will the child be removed from ${this.application.person.name}'s care at birth?`,
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

  answeredYesToPregnancyHealthcareQuestion() {
    return retrieveOptionalQuestionResponseFromApplicationOrAssessment(
      this.application,
      AccessNeeds,
      'additionalNeeds',
    ).includes('pregnancy')
  }

  response() {
    const response = {
      [this.questions.wheelchair]: sentenceCase(this.body.needsWheelchair),
      [this.questions.healthConditions]: yesOrNoResponseWithDetail('healthConditions', this.body),
      [this.questions.prescribedMedication]: yesNoOrDontKnowResponseWithDetail('prescribedMedication', this.body),
    }

    if (this.answeredYesToPregnancyHealthcareQuestion()) {
      response[this.questions.isPersonPregnant] = sentenceCase(this.body.isPersonPregnant)

      if (this.body.isPersonPregnant === 'yes') {
        response[this.questions.expectedDeliveryDate] = DateFormats.isoDateToUIDate(this.body.expectedDeliveryDate)
        response[this.questions.otherPregnancyConsiderations] = this.body.otherPregnancyConsiderations
        response[this.questions.childRemoved] = sentenceCase(this.body.childRemoved)
      }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.needsWheelchair) {
      errors.needsWheelchair = 'You must confirm the need for a wheelchair'
    }

    if (!this.body.healthConditions) {
      errors.healthConditions = `You must specify if ${this.application.person.name} has any known health conditions`
    }

    if (this.body.healthConditions === 'yes' && !this.body.healthConditionsDetail) {
      errors.healthConditionsDetail = `You must provide details of ${this.application.person.name}'s health conditions`
    }

    if (!this.body.prescribedMedication) {
      errors.prescribedMedication = `You must specify if ${this.application.person.name} has any prescribed medication`
    }

    if (this.body.prescribedMedication === 'yes' && !this.body.prescribedMedicationDetail) {
      errors.prescribedMedicationDetail = `You must provide details of ${this.application.person.name}'s prescribed medication`
    }

    if (this.answeredYesToPregnancyHealthcareQuestion()) {
      if (!this.body.isPersonPregnant) {
        errors.isPersonPregnant = `You must confirm if ${this.application.person.name} is pregnant`
      }

      if (this.body.isPersonPregnant === 'yes') {
        if (!this.body.expectedDeliveryDate) {
          errors.expectedDeliveryDate = 'You must enter the expected delivery date'
        }
        if (!this.body.childRemoved) {
          errors.childRemoved = 'You must confirm if the child will be removed at birth'
        }
      }
    }

    return errors
  }
}
