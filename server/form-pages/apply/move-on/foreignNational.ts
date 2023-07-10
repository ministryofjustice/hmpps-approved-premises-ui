import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'
import { DateFormats, dateIsBlank } from '../../../utils/dateUtils'
import { Page } from '../../utils/decorators'
import { dateBodyProperties } from '../../utils/dateBodyProperties'

type ForeignNationalBody =
  | ({
      response: 'yes'
    } & ObjectWithDateParts<'date'>)
  | { response: 'no' }

@Page({ name: 'foreign-national', bodyProperties: ['response', ...dateBodyProperties('date')] })
export default class ForeignNational implements TasklistPage {
  name = 'foreign-national'

  title = 'Placement duration and move on'

  question =
    "Have you informed the Home Office 'Foreign National Returns Command' that accommodation will be required after placement?"

  subquestion = 'Date of notification'

  hint =
    'For any foreign nationals without recourse to public funds, you must notify the Home Office before you submit your application. You do not need to have any offers of accommodation yet.'

  constructor(private _body: Partial<ForeignNationalBody>) {}

  public set body(value: Partial<ForeignNationalBody>) {
    this._body = {
      response: value.response as 'no',
    }
    if (value.response === 'yes') {
      this._body = {
        response: value.response as 'yes',
        'date-year': value['date-year'] as string,
        'date-month': value['date-month'] as string,
        'date-day': value['date-day'] as string,
        date: DateFormats.dateAndTimeInputsToIsoString(value as ObjectWithDateParts<'date'>, 'date').date,
      }
    }
  }

  public get body(): ForeignNationalBody {
    return this._body as ForeignNationalBody
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

    if (this.body.response === 'yes' && dateIsBlank(this.body, 'date'))
      errors.date = 'You must confirm the date of notification'

    return errors
  }
}
