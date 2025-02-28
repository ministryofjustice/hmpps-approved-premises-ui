import type { PageResponse, TaskListErrors, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponseWithDetail } from '../../../utils'
import { sentenceCase } from '../../../../utils/utils'

const questions = {
  planInPlace: {
    question: 'Is there a trigger plan in place?',
    hint: 'If the document is available on Delius, attach it to this application. If the document is not available, share with the AP manager once the placement is confirmed.',
    error: 'You must confirm if there is a trigger plan in place',
  },
  additionalConditions: {
    question: 'Have additional Licence conditions been requested as an alternative to recall?',
    error: 'You must confirm if additional Licence conditions have been requested as an alternative to recall',
    detailsError: 'You must detail additional Licence conditions have been requested as an alternative to recall',
  },
}

export type TriggerPlanBody = {
  planInPlace: YesOrNo
} & YesOrNoWithDetail<'additionalConditions'>

@Page({
  name: 'trigger-plan',
  bodyProperties: ['planInPlace', 'additionalConditions', 'additionalConditionsDetail'],
})
export default class TriggerPlan implements TasklistPage {
  title = 'Contingency plans'

  questions = questions

  constructor(public body: TriggerPlanBody) {}

  previous() {
    return 'contingency-plan-questions'
  }

  next() {
    return ''
  }

  response() {
    const response: PageResponse = {}

    response[questions.planInPlace.question] = sentenceCase(this.body.planInPlace)
    response[questions.additionalConditions.question] = yesNoOrDontKnowResponseWithDetail(
      'additionalConditions',
      this.body,
    )

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.planInPlace) {
      errors.planInPlace = this.questions.planInPlace.error
    }

    if (!this.body.additionalConditions) {
      errors.additionalConditions = this.questions.additionalConditions.error
    }

    if (this.body.additionalConditions === 'yes' && !this.body.additionalConditionsDetail) {
      errors.additionalConditionsDetail = this.questions.additionalConditions.detailsError
    }

    return errors
  }
}
