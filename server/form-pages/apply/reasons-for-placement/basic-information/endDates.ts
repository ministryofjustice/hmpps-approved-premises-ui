import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export type EndDatesBody = ObjectWithDateParts<'sedDate'> &
  ObjectWithDateParts<'ledDate'> &
  ObjectWithDateParts<'pssDate'>

@Page({
  name: 'end-dates',
  bodyProperties: [
    ...dateBodyProperties('sedDate'),
    ...dateBodyProperties('ledDate'),
    ...dateBodyProperties('pssDate'),
  ],
})
export default class EndDates implements TasklistPage {
  title = 'Which of the following dates are relevant?'

  questions = {
    sedDate: 'Sentence end date (SED)',
    ledDate: 'Licence end date (LED)',
    pssDate: 'Post-sentence supervision (PSS)',
  }

  body: EndDatesBody

  constructor(
    body: Partial<EndDatesBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  response() {
    const response = {}

    Object.keys(this.questions).forEach(key => {
      response[this.questions[key]] = !dateIsBlank(this.body, key)
        ? DateFormats.dateAndTimeInputsToUiDate(this.body, key)
        : 'No date supplied'
    })

    return response
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

    ;['sedDate', 'ledDate', 'pssDate'].forEach(date => {
      if (!dateIsBlank(this.body, date)) {
        if (!dateAndTimeInputsAreValidDates(this.body, date)) {
          errors[date] = `${this.questions[date]} must be a valid date`
        }
      }
    })

    return errors
  }
}
