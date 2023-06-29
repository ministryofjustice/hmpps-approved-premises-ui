import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { DateFormats, uiDateOrDateEmptyMessage } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication } from '../../../../@types/shared'

export type EndDatesBody = ObjectWithDateParts<'sedDate'> &
  ObjectWithDateParts<'ledDate'> &
  ObjectWithDateParts<'pssDate'>

@Page({
  name: 'end-dates',
  bodyProperties: [
    'sedDate',
    'sedDate-year',
    'sedDate-month',
    'sedDate-day',
    'ledDate',
    'ledDate-year',
    'ledDate-month',
    'ledDate-day',
    'pssDate',
    'pssDate-year',
    'pssDate-month',
    'pssDate-day',
  ],
})
export default class EndDates implements TasklistPage {
  title = 'Which of the following dates are relevant?'

  questions = {
    sed: 'Sentence end date (SED)',
    led: 'Licence end date (LED)',
    pss: 'Post-sentence supervision (PSS)',
  }

  body: EndDatesBody

  constructor(_body: Partial<EndDatesBody>, private readonly application: ApprovedPremisesApplication) {
    this.body = {
      'sedDate-year': _body['sedDate-year'],
      'sedDate-month': _body['sedDate-month'],
      'sedDate-day': _body['sedDate-day'],
      sedDate: DateFormats.dateAndTimeInputsToIsoString(_body as ObjectWithDateParts<'sedDate'>, 'sedDate').sedDate,
      'ledDate-year': _body['ledDate-year'],
      'ledDate-month': _body['ledDate-month'],
      'ledDate-day': _body['ledDate-day'],
      ledDate: DateFormats.dateAndTimeInputsToIsoString(_body as ObjectWithDateParts<'ledDate'>, 'ledDate').ledDate,
      'pssDate-year': _body['pssDate-year'],
      'pssDate-month': _body['pssDate-month'],
      'pssDate-day': _body['pssDate-day'],
      pssDate: DateFormats.dateAndTimeInputsToIsoString(_body as ObjectWithDateParts<'pssDate'>, 'pssDate').pssDate,
    }
  }

  response() {
    return {
      [this.questions.sed]: uiDateOrDateEmptyMessage(this.body, 'sedDate', DateFormats.isoDateToUIDate),
      [this.questions.led]: uiDateOrDateEmptyMessage(this.body, 'ledDate', DateFormats.isoDateToUIDate),
      [this.questions.pss]: uiDateOrDateEmptyMessage(this.body, 'pssDate', DateFormats.isoDateToUIDate),
    }
  }

  previous() {
    if (this.application.data?.['basic-information']?.['exception-details']) {
      return 'exception-details'
    }
    return 'transgender'
  }

  next() {
    return 'sentence-type'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
