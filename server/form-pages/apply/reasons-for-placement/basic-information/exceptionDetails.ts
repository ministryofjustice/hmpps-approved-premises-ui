import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export type ExceptionDetailsBody = ObjectWithDateParts<'agreementDate'> & {
  agreedCaseWithManager: YesOrNo
  managerName: string
  agreementSummary: string
}

@Page({
  name: 'exception-details',
  bodyProperties: ['agreedCaseWithManager', 'managerName', ...dateBodyProperties('agreementDate'), 'agreementSummary'],
  mergeBody: true,
})
export default class ExceptionDetails implements TasklistPage {
  title = 'Provide details for exemption application'

  questions = {
    agreedCaseWithManager: 'Have you agreed the case with a senior manager?',
    managerName: 'Name of senior manager',
    agreementDate: 'What date was this agreed?',
    agreementSummary: 'Provide a summary of the reasons why this is an exempt application',
  }

  body: ExceptionDetailsBody

  constructor(_body: Partial<ExceptionDetailsBody>) {
    this.body = {
      agreedCaseWithManager: _body.agreedCaseWithManager,
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
    let response = { [this.questions.agreedCaseWithManager]: sentenceCase(this.body.agreedCaseWithManager) }

    if (this.body.agreedCaseWithManager === 'yes') {
      response = {
        ...response,
        [this.questions.managerName]: this.body.managerName,
        [this.questions.agreementDate]: DateFormats.isoDateToUIDate(this.body.agreementDate),
        [this.questions.agreementSummary]: this.body.agreementSummary,
      }
    }

    return response
  }

  previous() {
    return 'is-exceptional-case'
  }

  next() {
    if (this.body.agreedCaseWithManager === 'no') {
      return 'not-eligible'
    }

    return 'confirm-your-details'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.agreedCaseWithManager) {
      errors.agreedCaseWithManager = 'You must state if you have agreed the case with a senior manager'
    }

    if (this.body.agreedCaseWithManager === 'yes') {
      if (!this.body.agreementDate) {
        errors.agreementDate = 'You must provide an agreement date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'agreementDate'>, 'agreementDate')) {
        errors.agreementDate = 'The agreement date is an invalid date'
      }

      if (!this.body.managerName) {
        errors.managerName = 'You must provide the name of the senior manager'
      }

      if (!this.body.agreementSummary) {
        errors.agreementSummary = 'You must provide a summary of the reasons why this is an exempt application'
      }
    }

    return errors
  }
}
