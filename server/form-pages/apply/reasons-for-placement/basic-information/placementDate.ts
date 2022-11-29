/* eslint-disable no-underscore-dangle */
import type { ObjectWithDateParts, YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'
import { retrieveQuestionResponseFromApplication, convertToTitleCase } from '../../../../utils/utils'
import { dateIsBlank, dateAndTimeInputsAreValidDates, DateFormats } from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'

type PlacementDateBody = ObjectWithDateParts<'startDate'> & {
  startDateSameAsReleaseDate: YesOrNo
}

@Page({
  name: 'placement-date',
  bodyProperties: ['startDate', 'startDate-day', 'startDate-month', 'startDate-year', 'startDateSameAsReleaseDate'],
})
export default class PlacementDate implements TasklistPage {
  title: string

  constructor(private _body: Partial<PlacementDateBody>, application: Application) {
    const formattedReleaseDate = DateFormats.isoDateToUIDate(
      retrieveQuestionResponseFromApplication(application, 'basic-information', 'releaseDate'),
    )

    this.title = `Is ${formattedReleaseDate} the date you want the placement to start?`
  }

  public set body(value: Partial<PlacementDateBody>) {
    this._body = {
      startDateSameAsReleaseDate: value.startDateSameAsReleaseDate as YesOrNo,
    }
    if (value.startDateSameAsReleaseDate === 'no') {
      this._body = {
        startDateSameAsReleaseDate: value.startDateSameAsReleaseDate as YesOrNo,
        'startDate-year': value['startDate-year'] as string,
        'startDate-month': value['startDate-month'] as string,
        'startDate-day': value['startDate-day'] as string,
        startDate: DateFormats.dateAndTimeInputsToIsoString(value as ObjectWithDateParts<'startDate'>, 'startDate')
          .startDate,
      }
    }
  }

  public get body(): PlacementDateBody {
    return this._body as PlacementDateBody
  }

  next() {
    return 'placement-purpose'
  }

  previous() {
    return 'release-date'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.startDateSameAsReleaseDate),
    } as Record<string, string>

    if (this.body.startDateSameAsReleaseDate === 'no') {
      response['Placement Start Date'] = DateFormats.isoDateToUIDate(this.body.startDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.startDateSameAsReleaseDate) {
      errors.startDateSameAsReleaseDate = 'You must specify if the start date is the same as the release date'
    }

    if (this.body.startDateSameAsReleaseDate === 'no') {
      if (dateIsBlank(this.body)) {
        errors.startDate = 'You must enter a start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'startDate'>, 'startDate')) {
        errors.startDate = 'The start date is an invalid date'
      }
    }

    return errors
  }
}
