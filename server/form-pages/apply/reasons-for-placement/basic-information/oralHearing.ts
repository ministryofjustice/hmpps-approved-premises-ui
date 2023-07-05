import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { convertToTitleCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

type OralHearingBody = ObjectWithDateParts<'oralHearingDate'> & {
  knowOralHearingDate: YesOrNo
}

@Page({
  name: 'oral-hearing',
  bodyProperties: [
    'oralHearingDate',
    'oralHearingDate-day',
    'oralHearingDate-month',
    'oralHearingDate-year',
    'knowOralHearingDate',
  ],
})
export default class OralHearing implements TasklistPage {
  title = `Do you know ${this.application.person.name}’s oral hearing date?`

  constructor(private _body: Partial<OralHearingBody>, private readonly application: ApprovedPremisesApplication) {}

  public set body(value: Partial<OralHearingBody>) {
    this._body = {
      knowOralHearingDate: value.knowOralHearingDate as YesOrNo,
    }
    if (value.knowOralHearingDate === 'yes') {
      this._body = {
        knowOralHearingDate: value.knowOralHearingDate as YesOrNo,
        'oralHearingDate-year': value['oralHearingDate-year'] as string,
        'oralHearingDate-month': value['oralHearingDate-month'] as string,
        'oralHearingDate-day': value['oralHearingDate-day'] as string,
        oralHearingDate: DateFormats.dateAndTimeInputsToIsoString(
          value as ObjectWithDateParts<'oralHearingDate'>,
          'oralHearingDate',
        ).oralHearingDate,
      }
    }
  }

  public get body(): OralHearingBody {
    return this._body as OralHearingBody
  }

  next() {
    return 'placement-purpose'
  }

  previous() {
    return 'release-date'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.knowOralHearingDate),
    } as Record<string, string>

    if (this.body.knowOralHearingDate === 'yes') {
      response['Oral Hearing Date'] = DateFormats.isoDateToUIDate(this.body.oralHearingDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.knowOralHearingDate) {
      errors.knowOralHearingDate = 'You must specify if you know the oral hearing date'
    }

    if (this.body.knowOralHearingDate === 'yes') {
      if (dateIsBlank(this.body, 'oralHearingDate')) {
        errors.oralHearingDate = 'You must specify the oral hearing date'
      } else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'oralHearingDate'>, 'oralHearingDate')
      ) {
        errors.oralHearingDate = 'The oral hearing date is an invalid date'
      }
    }

    return errors
  }
}
