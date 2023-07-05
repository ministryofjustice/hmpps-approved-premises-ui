import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'

import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInThePast } from '../../../../utils/dateUtils'
import { Page } from '../../../utils/decorators'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import ReleaseDate from './releaseDate'

type PlacementDateBody = ObjectWithDateParts<'startDate'> & {
  startDateSameAsReleaseDate: YesOrNo
}

@Page({
  name: 'placement-date',
  bodyProperties: ['startDate', 'startDate-day', 'startDate-month', 'startDate-year', 'startDateSameAsReleaseDate'],
})
export default class PlacementDate implements TasklistPage {
  title: string

  constructor(private _body: Partial<PlacementDateBody>, public application: ApprovedPremisesApplication) {
    const formattedReleaseDate = DateFormats.isoDateToUIDate(
      retrieveQuestionResponseFromFormArtifact(application, ReleaseDate),
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
    if (this.getNoticeType() === 'standard') {
      return 'placement-purpose'
    }

    return 'reason-for-short-notice'
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
      if (dateIsBlank(this.body, 'startDate')) {
        errors.startDate = 'You must enter a start date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'startDate'>, 'startDate')) {
        errors.startDate = 'The start date is an invalid date'
      } else if (dateIsInThePast(this.body.startDate)) {
        errors.startDate = 'The start date must not be in the past'
      }
    }

    return errors
  }

  private getNoticeType() {
    return noticeTypeFromApplication({
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
