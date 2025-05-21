import {
  type ObjectWithDateParts,
  PageResponse,
  TaskListErrors,
  type YesNoOrIDKWithDetail,
  type YesOrNo,
  type YesOrNoWithDetail,
} from '@approved-premises/ui'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import { DateFormats } from '../../../../utils/dateUtils'
import { sentenceCase } from '../../../../utils/utils'
import { yesNoOrDontKnowResponseWithDetail, yesOrNoResponseWithDetailForYes } from '../../../utils'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export type PregnancyBody = {
  childRemoved?: YesOrNo | 'decisionPending'
} & ObjectWithDateParts<'expectedDeliveryDate'> &
  YesNoOrIDKWithDetail<'socialCareInvolvement'> &
  YesOrNoWithDetail<'otherPregnancyConsiderations'>

@Page({
  name: 'pregnancy',
  bodyProperties: [
    ...dateBodyProperties('expectedDeliveryDate'),
    'socialCareInvolvement',
    'socialCareInvolvementDetail',
    'childRemoved',
    'otherPregnancyConsiderations',
    'otherPregnancyConsiderationsDetail',
  ],
})
export default class Pregnancy implements TasklistPage {
  title = 'Access, cultural and healthcare needs'

  questions = {
    expectedDeliveryDate: 'What is their expected date of delivery?',
    socialCareInvolvement: 'Is there social care involvement?',
    socialCareInvolvementDetail: 'Provide details',
    childRemoved: `Will the child be removed from the person's care at birth?`,
    otherPregnancyConsiderations: 'Are there any pregnancy related issues relevant to placement?',
    otherPregnancyConsiderationsDetail: 'Provide details',
  }

  constructor(private _body: Partial<PregnancyBody>) {}

  public set body(value: Partial<PregnancyBody>) {
    this._body = {
      ...value,
      ...DateFormats.dateAndTimeInputsToIsoString(
        value as ObjectWithDateParts<'expectedDeliveryDate'>,
        'expectedDeliveryDate',
      ),
    }
  }

  public get body(): PregnancyBody {
    return this._body as PregnancyBody
  }

  errors(): TaskListErrors<this> {
    const errors: TaskListErrors<this> = {}

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

    if (this.body.otherPregnancyConsiderations === 'yes' && !this.body.otherPregnancyConsiderationsDetail) {
      errors.otherPregnancyConsiderationsDetail =
        'You must provide details of any pregnancy related issues relevant to the placement'
    }

    return errors
  }

  next(): string {
    return 'access-needs-additional-details'
  }

  previous(): string {
    return 'access-needs-further-questions'
  }

  response(): PageResponse {
    return {
      [this.questions.expectedDeliveryDate]: DateFormats.isoDateToUIDate(this.body.expectedDeliveryDate),
      [this.questions.socialCareInvolvement]: yesNoOrDontKnowResponseWithDetail('socialCareInvolvement', this.body),
      [this.questions.childRemoved]: sentenceCase(this.body.childRemoved),
      [this.questions.otherPregnancyConsiderations]: yesOrNoResponseWithDetailForYes(
        'otherPregnancyConsiderations',
        this.body,
      ),
    }
  }
}
