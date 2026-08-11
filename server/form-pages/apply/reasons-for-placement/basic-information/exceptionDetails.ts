import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export type ExceptionDetailsBody = ObjectWithDateParts<'agreementDate'> & {
  managerName: string
  agreementSummary: string
}

@Page({
  name: 'exception-details',
  bodyProperties: ['managerName', ...dateBodyProperties('agreementDate'), 'agreementSummary'],
  mergeBody: true,
})
export default class ExceptionDetails implements TasklistPage {
  title = 'Exceptional case details'

  questions = {
    managerName: 'Name of senior manager who approved exemption',
    agreementDate: 'Date of approval',
    agreementSummary: 'Reason for exceptional case',
  }

  body: ExceptionDetailsBody

  constructor(_body: Partial<ExceptionDetailsBody>) {
    this.body = {
      managerName: _body.managerName,
      'agreementDate-year': _body['agreementDate-year'],
      'agreementDate-month': _body['agreementDate-month'],
      'agreementDate-day': _body['agreementDate-day'],
      agreementDate: DateFormats.dateAndTimeInputsToIsoString(
        _body as ObjectWithDateParts<'agreementDate'>,
        'agreementDate',
      ).agreementDate,
      agreementSummary: _body.agreementSummary,
    }
  }

  response() {
    return {
      [this.questions.managerName]: this.body.managerName,
      [this.questions.agreementDate]: DateFormats.isoDateToUIDate(this.body.agreementDate),
      [this.questions.agreementSummary]: this.body.agreementSummary,
    }
  }

  previous() {
    return 'is-exceptional-case'
  }

  next() {
    return 'confirm-your-details'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.managerName) {
      errors.managerName = 'Enter the name of the senior manager who approved the exemption'
    }

    if (
      !this.body.agreementDate ||
      !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'agreementDate'>, 'agreementDate')
    ) {
      errors.agreementDate = 'Enter a date of approval'
    }

    if (!this.body.agreementSummary) {
      errors.agreementSummary = 'Enter a reason for the exceptional case'
    }

    return errors
  }
}
