import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { sentenceCase } from '../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'

export type Body = {
  duration: string
} & ObjectWithDateParts<'arrivalDate'>

@Page({
  name: 'dates-of-placement',
  bodyProperties: ['arrivalDate', 'arrivalDate-day', 'arrivalDate-month', 'arrivalDate-year', 'duration'],
})
export default class DatesOfPlacement implements TasklistPage {
  title = 'Dates of placement'

  questions = {
    arrivalDate: 'When will the person arrive?',
    duration: 'How long should the Approved Premises placement last? (in weeks)',
  }

  body: Body

  constructor(_body: Body) {
    this.body = {
      'arrivalDate-year': _body['arrivalDate-year'],
      'arrivalDate-month': _body['arrivalDate-month'],
      'arrivalDate-day': _body['arrivalDate-day'],
      arrivalDate: DateFormats.dateAndTimeInputsToIsoString(_body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')
        .arrivalDate,
      duration: _body.duration,
    }
  }

  previous() {
    return 'same-ap'
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.questions.arrivalDate]: DateFormats.isoDateToUIDate(this.body.arrivalDate),
      [this.questions.duration]: `${sentenceCase(this.body.duration)} weeks`,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arrivalDate) {
      errors.arrivalDate = "You must state the person's arrival date"
    } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'arrivalDate'>, 'arrivalDate')) {
      errors.arrivalDate = 'The placement date is invalid'
    }

    if (!this.body.duration) errors.duration = 'You must state the duration of the placement'

    return errors
  }
}
