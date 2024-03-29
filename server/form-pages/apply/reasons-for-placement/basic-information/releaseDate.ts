import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { adjacentPageFromSentenceType } from '../../../../utils/applications/adjacentPageFromSentenceType'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceType from './sentenceType'

type ReleaseDateType = ObjectWithDateParts<'releaseDate'> & {
  knowReleaseDate: YesOrNo
}

@Page({
  name: 'release-date',
  bodyProperties: [...dateBodyProperties('releaseDate'), 'knowReleaseDate'],
})
export default class ReleaseDate implements TasklistPage {
  title = `Do you know the person's release date?`

  constructor(
    private _body: Partial<ReleaseDateType>,
    readonly application: ApprovedPremisesApplication,
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
    const sentenceType = retrieveQuestionResponseFromFormArtifact(this.application, SentenceType)
    return adjacentPageFromSentenceType(sentenceType)
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
      if (dateIsBlank(this.body, 'releaseDate')) {
        errors.releaseDate = 'You must specify the release date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'releaseDate'>, 'releaseDate')) {
        errors.releaseDate = 'The release date is an invalid date'
      }
    }

    return errors
  }
}
