import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'

export type Body = {
  duration: string
  reason: string
} & ObjectWithDateParts<'arrivalDate'>

@Page({
  name: 'additional-placement-details',
  bodyProperties: ['arrivalDate', 'arrivalDate-day', 'arrivalDate-month', 'arrivalDate-year', 'duration', 'reason'],
})
export default class AdditionalPlacementDetails implements TasklistPage {
  title = 'Placement details'

  body: Body

  questions = {
    arrivalDate: 'When will the person arrive?',
    duration: 'How long should the Approved Premises placement last? (in weeks)',
    reason: 'Why are you requesting this placement?',
  }

  constructor(_body: Body) {
    this.body = {
      'arrivalDate-year': _body['arrivalDate-year'],
      'arrivalDate-month': _body['arrivalDate-month'],
      'arrivalDate-day': _body['arrivalDate-day'],
      arrivalDate: DateFormats.dateAndTimeInputsToIsoString(_body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')
        .arrivalDate,
      duration: _body.duration,
      reason: _body.reason,
    }
  }

  previous() {
    return 'reason-for-placement'
  }

  next() {
    return 'updates-to-application'
  }

  response() {
    return {
      [this.questions.arrivalDate]: DateFormats.isoDateToUIDate(this.body.arrivalDate),
      [this.questions.duration]: `${this.body.duration} weeks`,
      [this.questions.reason]: this.body.reason,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arrivalDate) {
      errors.arrivalDate = "You must state the person's arrival date"
    } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')) {
      errors.arrivalDate = 'The placement date is invalid'
    }

    if (!this.body.duration) {
      errors.duration = 'You must state the duration of the placement'
    }

    if (!this.body.reason) {
      errors.reason = 'You must state the reason for the placement'
    }

    return errors
  }
}
