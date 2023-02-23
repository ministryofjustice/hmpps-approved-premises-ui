import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import { convertToTitleCase } from '../../../../utils/utils'

type ReleaseDateType = ObjectWithDateParts<'releaseDate'> & {
  knowReleaseDate: YesOrNo
}

@Page({
  name: 'release-date',
  bodyProperties: ['releaseDate', 'releaseDate-year', 'releaseDate-month', 'releaseDate-day', 'knowReleaseDate'],
})
export default class ReleaseDate implements TasklistPage {
  title = `Do you know ${this.application.person.name}’s release date?`

  constructor(
    private _body: Partial<ReleaseDateType>,
    readonly application: ApprovedPremisesApplication,
    readonly previousPage: string,
  ) {}

  public set body(value: Partial<ReleaseDateType>) {
    this._body = {
      knowReleaseDate: value.knowReleaseDate as YesOrNo,
    }
    if (value.knowReleaseDate === 'yes') {
      this._body = {
        knowReleaseDate: value.knowReleaseDate as YesOrNo,
        'releaseDate-year': value['releaseDate-year'] as string,
        'releaseDate-month': value['releaseDate-month'] as string,
        'releaseDate-day': value['releaseDate-day'] as string,
        releaseDate: DateFormats.dateAndTimeInputsToIsoString(
          value as ObjectWithDateParts<'releaseDate'>,
          'releaseDate',
        ).releaseDate,
      }
    }
  }

  public get body(): ReleaseDateType {
    return this._body as ReleaseDateType
  }

  next() {
    return this.body.knowReleaseDate === 'yes' ? 'placement-date' : 'oral-hearing'
  }

  previous() {
    return this.previousPage
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.knowReleaseDate),
    } as Record<string, string>

    if (this.body.knowReleaseDate === 'yes') {
      response['Release Date'] = DateFormats.isoDateToUIDate(this.body.releaseDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.knowReleaseDate) {
      errors.knowReleaseDate = 'You must specify if you know the release date'
    }

    if (this.body.knowReleaseDate === 'yes') {
      if (dateIsBlank(this.body)) {
        errors.releaseDate = 'You must specify the release date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'releaseDate'>, 'releaseDate')) {
        errors.releaseDate = 'The release date is an invalid date'
      } else if (dateIsInThePast(this.body.releaseDate)) {
        errors.releaseDate = 'The release date must not be in the past'
      }
    }

    return errors
  }
}
