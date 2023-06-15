import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { weeksToDays } from 'date-fns'
import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'

export type Body = {
  duration: string
  durationDays: string
  durationWeeks: string
} & ObjectWithDateParts<'arrivalDate'>

@Page({
  name: 'dates-of-placement',
  bodyProperties: [
    'arrivalDate',
    'arrivalDate-day',
    'arrivalDate-month',
    'arrivalDate-year',
    'duration',
    'durationDays',
    'durationWeeks',
  ],
})
export default class DatesOfPlacement implements TasklistPage {
  title = 'Dates of placement'

  questions = {
    arrivalDate: 'When will the person arrive?',
    duration: 'How long should the Approved Premises placement last?',
  }

  constructor(private _body: Body) {}

  get body() {
    return {
      'arrivalDate-year': this._body['arrivalDate-year'],
      'arrivalDate-month': this._body['arrivalDate-month'],
      'arrivalDate-day': this._body['arrivalDate-day'],
      arrivalDate: DateFormats.dateAndTimeInputsToIsoString(
        this._body as ObjectWithDateParts<'arrivalDate'>,
        'arrivalDate',
      ).arrivalDate,
      durationDays: this._body.durationDays,
      durationWeeks: this._body.durationWeeks,
      duration: this.lengthInDays(),
    }
  }

  set body(value: Body) {
    this._body = value
  }

  previous() {
    return 'same-ap'
  }

  next() {
    return 'updates-to-application'
  }

  response() {
    return {
      [this.questions.arrivalDate]: DateFormats.isoDateToUIDate(this.body.arrivalDate),
      [this.questions.duration]: DateFormats.formatDuration({
        weeks: this.body.durationDays,
        days: this.body.durationWeeks,
      }),
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

  private lengthInDays(): string {
    if (this._body.durationWeeks && this._body.durationDays) {
      const lengthOfStayWeeksInDays = weeksToDays(Number(this._body.durationWeeks))
      const totalLengthInDays = lengthOfStayWeeksInDays + Number(this._body.durationDays)

      return String(totalLengthInDays)
    }

    return undefined
  }
}
