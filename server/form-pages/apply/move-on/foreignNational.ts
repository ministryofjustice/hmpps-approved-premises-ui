import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'
import { DateFormats, dateIsBlank } from '../../../utils/dateUtils'

export default class ForeignNational implements TasklistPage {
  name = 'foreign-national'

  title = 'Placement duration and move on'

  question =
    "Have you informed the Home Office 'Foreign National Returns Command' that accommodation will be required after placement?"

  subquestion = 'Date of notification'

  hint =
    'For any foreign nationals without recourse to public funds, you must notify the Home Office before you submit your application. You do not need to have any offers of accommodation yet.'

  body:
    | ({
        response: 'yes'
      } & ObjectWithDateParts<'date'>)
    | { response: 'no' }

  constructor(body: Record<string, unknown>) {
    this.body = {
      response: body.response as 'no',
    }
    if (body.response === 'yes') {
      this.body = {
        response: body.response as 'yes',
        'date-year': body['date-year'] as string,
        'date-month': body['date-month'] as string,
        'date-day': body['date-day'] as string,
        date: DateFormats.convertDateAndTimeInputsToIsoString(body as ObjectWithDateParts<'date'>, 'date').date,
      }
    }
  }

  previous() {
    return 'type-of-accommodation'
  }

  next() {
    return ''
  }

  response() {
    const response = { [this.question]: sentenceCase(this.body.response) }

    if (this.body.response === 'yes') {
      return { ...response, [this.subquestion]: DateFormats.isoDateToUIDate(this.body.date) }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> & { date?: string } = {}

    if (!this.body.response)
      errors.response =
        'You must confirm whether you have informed the Home Office that accommodation will be required after placement'

    if (this.body.response === 'yes' && dateIsBlank(this.body))
      errors.date = 'You must confirm the date of notification'

    return errors
  }
}
