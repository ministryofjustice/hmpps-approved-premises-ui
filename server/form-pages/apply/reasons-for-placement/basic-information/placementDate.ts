import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'

import { isAfter, isSameDay } from 'date-fns'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import {
  DateFormats,
  dateAndTimeInputsAreValidDates,
  dateIsBlank,
  dateIsToday,
  datetimeIsInThePast,
} from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'
import ReleaseDate from './releaseDate'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { startDateOutsideOfNationalStandardsTimescales } from '../../../../utils/applications/startDateOutsideOfNationalStandardsTimescales'

type PlacementDateBody = ObjectWithDateParts<'startDate'> & {
  startDateSameAsReleaseDate: YesOrNo
}

@Page({
  name: 'placement-date',
  bodyProperties: [...dateBodyProperties('startDate'), 'startDateSameAsReleaseDate'],
})
export default class PlacementDate implements TasklistPage {
  title: string

  private releaseDatePast: boolean

  constructor(
    private _body: Partial<PlacementDateBody>,
    public application: ApprovedPremisesApplication,
  ) {
    const releaseDate = retrieveOptionalQuestionResponseFromFormArtifact(application, ReleaseDate)

    if (releaseDate) {
      const releaseDateObj = DateFormats.isoToDateObj(releaseDate)
      const applicationDate = DateFormats.isoToDateObj(application.createdAt)

      if (isAfter(releaseDateObj, applicationDate) || isSameDay(applicationDate, releaseDateObj)) {
        const formattedReleaseDate = DateFormats.isoDateToUIDate(releaseDate)
        this.title = `Is ${formattedReleaseDate} the date you want the placement to start?`
        this.releaseDatePast = false
      } else {
        this.releaseDatePast = true
      }
    }

    if (!releaseDate || this.releaseDatePast) {
      this.title = 'What date you want the placement to start?'
      this.releaseDatePast = true
    }
  }

  public set body(value: Partial<PlacementDateBody>) {
    if (this.releaseDatePast) {
      this._body = {
        startDateSameAsReleaseDate: 'no',
        'startDate-year': value['startDate-year'] as string,
        'startDate-month': value['startDate-month'] as string,
        'startDate-day': value['startDate-day'] as string,
        startDate: DateFormats.dateAndTimeInputsToIsoString(value as ObjectWithDateParts<'startDate'>, 'startDate')
          .startDate,
      }
    } else {
      this._body = {
        startDateSameAsReleaseDate: value.startDateSameAsReleaseDate as YesOrNo,
      }
      if (value.startDateSameAsReleaseDate === 'no') {
        this._body = {
          startDateSameAsReleaseDate: 'no',
          'startDate-year': value['startDate-year'] as string,
          'startDate-month': value['startDate-month'] as string,
          'startDate-day': value['startDate-day'] as string,
          startDate: DateFormats.dateAndTimeInputsToIsoString(value as ObjectWithDateParts<'startDate'>, 'startDate')
            .startDate,
        }
      }
    }
  }

  public get body(): PlacementDateBody {
    return this._body as PlacementDateBody
  }

  next() {
    if (this.isOutsideOfNationalStandardsTimescales()) {
      return 'reason-for-short-notice'
    }

    return 'placement-purpose'
  }

  previous() {
    return 'release-date'
  }

  response() {
    let response: Record<string, string>

    if (this.releaseDatePast) {
      response = { [this.title]: DateFormats.isoDateToUIDate(this.body.startDate) }
    } else {
      response = { [this.title]: convertToTitleCase(this.body.startDateSameAsReleaseDate) }

      if (this.body.startDateSameAsReleaseDate === 'no') {
        response['Placement Start Date'] = DateFormats.isoDateToUIDate(this.body.startDate)
      }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.releaseDatePast && !this.body.startDateSameAsReleaseDate) {
      errors.startDateSameAsReleaseDate = 'You must specify if the start date is the same as the release date'
    }

    if (this.releaseDatePast || this.body.startDateSameAsReleaseDate === 'no') {
      if (dateIsBlank(this.body, 'startDate')) {
        errors.startDate = 'You must enter a start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'startDate'>, 'startDate')) {
        errors.startDate = 'The start date is an invalid date'
      } else if (!dateIsToday(this.body.startDate) && datetimeIsInThePast(this.body.startDate)) {
        errors.startDate = 'The start date must not be in the past'
      }
    }

    return errors
  }

  private isOutsideOfNationalStandardsTimescales() {
    return startDateOutsideOfNationalStandardsTimescales({
      ...this.application,
      data: {
        'basic-information': {
          ...this.application.data['basic-information'],
          'placement-date': this.body,
        },
      },
    })
  }
}
