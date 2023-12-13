import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export const relevantDatesDictionary = {
  paroleEligbilityDate: 'Parole eligibility date',
  homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date',
  licenceExpiryDate: 'Licence expiry date',
  pssStartDate: 'Post sentence supervision (PSS) start date',
  pssEndDate: 'Post sentence supervision (PSS) end date',
  sedDate: 'Sentence expiry date',
} as const

export const relevantDateKeys = Object.keys(relevantDatesDictionary) as ReadonlyArray<RelevantDateKeys>

export type RelevantDates = typeof relevantDatesDictionary
export type RelevantDateKeys = keyof RelevantDates
export type RelevantDateLabels = RelevantDates[RelevantDateKeys]

export type EndDatesBody = { selectedDates: ReadonlyArray<RelevantDateKeys> } & ObjectWithDateParts<RelevantDateKeys>

@Page({
  name: 'end-dates',
  bodyProperties: [...relevantDateKeys.map(key => dateBodyProperties(key)).flat(), 'selectedDates'],
})
export default class EndDates implements TasklistPage {
  title = 'Which of the following dates are relevant?'

  hint = 'Select any dates that are relevant to this application. Select all that apply'

  relevantDateKeys = relevantDateKeys

  relevantDatesDictionary = relevantDatesDictionary

  body: EndDatesBody

  constructor(
    body: Partial<EndDatesBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  response() {
    const response = {}

    relevantDateKeys.forEach(key => {
      response[this.relevantDatesDictionary[key]] = !dateIsBlank(this.body, key)
        ? DateFormats.dateAndTimeInputsToUiDate(this.body, key)
        : 'No date supplied'
    })

    return response
  }

  previous() {
    if (this.application.data?.['basic-information']?.['exception-details']) {
      return 'exception-details'
    }
    return 'transgender'
  }

  next() {
    return 'sentence-type'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    relevantDateKeys.forEach(date => {
      if (!this.body.selectedDates?.includes(date)) return

      if (dateIsBlank(this.body, date)) {
        errors[date] = `When the box is checked you must enter a ${this.relevantDatesDictionary[date]} date`
      } else if (!dateAndTimeInputsAreValidDates(this.body, date)) {
        errors[date] = `${this.relevantDatesDictionary[date]} must be a valid date`
      }
    })

    return errors
  }
}
