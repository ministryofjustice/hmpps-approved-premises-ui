import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import type { PlacementApplication } from '@approved-premises/api'
import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../utils/dateUtils'
import { sentenceCase } from '../../../utils/utils'
import { dateBodyProperties } from '../../utils/dateBodyProperties'

export type Body = ObjectWithDateParts<'lastPlacementDate'> & {
  previousRotlPlacement: YesOrNo
  lastAp: string
  details: string
}

@Page({
  name: 'previous-rotl-placement',
  bodyProperties: ['previousRotlPlacement', ...dateBodyProperties('lastPlacementDate'), 'lastAp', 'details'],
  mergeBody: true,
})
export default class PreviousRotlPlacement implements TasklistPage {
  title = 'Previous ROTL placements'

  questions = {
    previousRotlPlacement: 'Has this person previously had a placement at an Approved Premises for ROTL?',
    lastPlacementDate: 'When was the last placement?',
    lastAp: 'Which Approved Premises did the person last stay at?',
    details: 'Provide details of any other previous ROTL placements (including the location) and dates of stays.',
  }

  body: Body

  constructor(
    public _body: Body,
    private placementApplication: PlacementApplication,
  ) {
    this.body = {
      previousRotlPlacement: _body.previousRotlPlacement,

      lastAp: _body.lastAp,
      ...DateFormats.dateAndTimeInputsToIsoString(
        _body as ObjectWithDateParts<'lastPlacementDate'>,
        'lastPlacementDate',
      ),
      details: _body.details,
    }
  }

  previous() {
    const { sentenceTypeCheck } = this.placementApplication.data?.['request-a-placement']?.['sentence-type-check'] || {}
    return sentenceTypeCheck === 'yes' ? 'release-type' : 'sentence-type-check'
  }

  next() {
    return this.body.previousRotlPlacement === 'yes' ? 'same-ap' : 'dates-of-placement'
  }

  response() {
    let response = { [this.questions.previousRotlPlacement]: sentenceCase(this.body.previousRotlPlacement) }

    if (this.body.previousRotlPlacement === 'yes') {
      response = {
        ...response,
        [this.questions.lastAp]: this.body.lastAp,
        [this.questions.lastPlacementDate]: DateFormats.isoDateToUIDate(this.body.lastPlacementDate),
        [this.questions.details]: this.body.details,
      }
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.previousRotlPlacement) {
      errors.previousRotlPlacement =
        'You must state if the person has previously had a placement at an Approved Premises for ROTL'
    }

    if (this.body.previousRotlPlacement === 'yes') {
      if (!this.body.lastPlacementDate) {
        errors.lastPlacementDate = 'You must provide the date of the last placement'
      } else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'lastPlacementDate'>, 'lastPlacementDate')
      ) {
        errors.lastPlacementDate = 'The placement date is invalid'
      }

      if (!this.body.lastAp) {
        errors.lastAp = 'You must provide the name of the last Approved Premises the person stayed at'
      }

      if (!this.body.details) {
        errors.details =
          'You must provide details of any other previous ROT placements (including the location) and dates of stays.'
      }
    }

    return errors
  }
}
