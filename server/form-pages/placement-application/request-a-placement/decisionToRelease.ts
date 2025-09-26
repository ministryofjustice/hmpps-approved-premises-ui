import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { PlacementApplication } from '@approved-premises/api'
import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'
import { dateBodyProperties } from '../../utils/dateBodyProperties'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import SentenceTypeCheck from './sentenceTypeCheck'

export type Body = {
  informationFromDirectionToRelease: string
} & ObjectWithDateParts<'decisionToReleaseDate'>

@Page({
  name: 'decision-to-release',
  bodyProperties: [...dateBodyProperties('decisionToReleaseDate'), 'informationFromDirectionToRelease'],
  mergeBody: true,
})
export default class DecisionToRelease implements TasklistPage {
  title = 'Release details'

  questions = {
    decisionToReleaseDate: 'Enter the date of decision',
    informationFromDirectionToRelease:
      'Provide relevant information from the direction to release that will impact the placement',
  }

  body: Body

  constructor(
    _body: Body,
    private readonly placementApplication: PlacementApplication,
  ) {
    this.body = {
      ...DateFormats.dateAndTimeInputsToIsoString(
        _body as ObjectWithDateParts<'decisionToReleaseDate'>,
        'decisionToReleaseDate',
      ),
      informationFromDirectionToRelease: _body.informationFromDirectionToRelease,
    }
  }

  previous() {
    return retrieveQuestionResponseFromFormArtifact(
      this.placementApplication,
      SentenceTypeCheck,
      'sentenceTypeCheck',
    ) === 'yes'
      ? 'release-type'
      : 'sentence-type-check'
  }

  next() {
    return 'additional-documents'
  }

  response() {
    return {
      [this.questions.decisionToReleaseDate]: DateFormats.isoDateToUIDate(this.body.decisionToReleaseDate),
      [this.questions.informationFromDirectionToRelease]: this.body.informationFromDirectionToRelease,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.decisionToReleaseDate) {
      errors.decisionToReleaseDate = 'You must state the date of the decision to release'
    } else if (
      !dateAndTimeInputsAreValidDates(
        this.body as ObjectWithDateParts<'decisionToReleaseDate'>,
        'decisionToReleaseDate',
      )
    ) {
      errors.decisionToReleaseDate = 'The decision to release date is invalid'
    }

    if (!this.body.informationFromDirectionToRelease)
      errors.informationFromDirectionToRelease = 'You must state the relevant information from the direction to release'

    return errors
  }
}
