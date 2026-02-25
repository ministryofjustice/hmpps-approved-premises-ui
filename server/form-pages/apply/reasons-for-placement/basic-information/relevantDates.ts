import type { ObjectWithDateParts, PageResponse, TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication } from '../../../../@types/shared'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export const relevantDatesDictionary = {
  paroleEligibilityDate: 'Parole eligibility date',
  homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date',
  licenceExpiryDate: 'Licence expiry date',
  pssStartDate: 'Post sentence supervision (PSS) start date',
  pssEndDate: 'Post sentence supervision (PSS) end date',
  sentenceExpiryDate: 'Sentence expiry date',
} as const

export const relevantDateKeys = Object.keys(relevantDatesDictionary) as ReadonlyArray<RelevantDateKeys>

export type RelevantDatesT = typeof relevantDatesDictionary
export type RelevantDateKeys = keyof RelevantDatesT
export type RelevantDateLabels = RelevantDatesT[RelevantDateKeys]

export type RelevantDatesBody = {
  selectedDates: ReadonlyArray<RelevantDateKeys>
} & ObjectWithDateParts<RelevantDateKeys>
@Page({
  name: 'relevant-dates',
  bodyProperties: [...relevantDateKeys.map(key => [...dateBodyProperties(key), key]).flat(), 'selectedDates'],
})
export default class RelevantDates implements TasklistPage {
  title = 'Which of the following dates are relevant?'

  hint = 'Select any dates that are relevant to this application. Select all that apply'

  relevantDateKeys = relevantDateKeys

  relevantDatesDictionary = relevantDatesDictionary

  _body: RelevantDatesBody

  constructor(
    _body: Partial<RelevantDatesBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  public set body(value: Partial<RelevantDatesBody>) {
    this._body = {} as RelevantDatesBody
    this._body.selectedDates = value.selectedDates || []
    this._body.selectedDates.forEach((selectedDate: RelevantDateKeys) => {
      ;[...dateBodyProperties(selectedDate), selectedDate].forEach(element => {
        this._body[element] = value[element]
      })
    })
  }

  public get body() {
    return this._body
  }

  response() {
    const response: PageResponse = {}

    relevantDateKeys.forEach((key: keyof typeof relevantDatesDictionary) => {
      const responseKey: string = this.relevantDatesDictionary[key]
      response[responseKey] =
        this.body.selectedDates?.includes(key) && !dateIsBlank(this.body, key)
          ? DateFormats.dateAndTimeInputsToUiDate(this._body, key)
          : 'No date supplied'
    })

    return response
  }

  previous() {
    if (this.application.data?.['basic-information']?.transgender?.transgenderOrHasTransgenderHistory === 'yes') {
      if (this.application.data?.['basic-information']?.['complex-case-board']?.reviewRequired === 'yes') {
        return 'board-taken-place'
      }
      return 'complex-case-board'
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
      } else if (!dateAndTimeInputsAreValidDates(this._body, date)) {
        errors[date] = `${this.relevantDatesDictionary[date]} must be a valid date`
      }
    })

    return errors
  }
}
