import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { Cas1Application as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { adjacentPageFromSentenceType } from '../../../../utils/applications/adjacentPageFromSentenceType'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceType from './sentenceType'
import { PrefillMapping } from '../../../utils'

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
    readonly application: Application,
  ) {}

  public set body(value: Partial<ReleaseDateType>) {
    const { 'releaseDate-year': year, 'releaseDate-month': month, 'releaseDate-day': day, knowReleaseDate } = value
    this._body = {knowReleaseDate}
    if (year) {
      this._body = {
        knowReleaseDate: 'yes' as YesOrNo,
        'releaseDate-year': year,
        'releaseDate-month': month,
        'releaseDate-day':day,
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

  static getPrefillMapping(): PrefillMapping {
    return {
      releaseDate: { fieldName: 'releaseDate', type: 'DATE' },
    }
  }
}
