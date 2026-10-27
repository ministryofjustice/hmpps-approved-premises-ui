import type { DataServices, ObjectWithDateParts, PageResponse, TaskListErrors } from '@approved-premises/ui'

import { Cas1Application as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { expect } from '@playwright/test'
import { FieldDefn, FieldType,PrefillMapping } from '../../../utils'

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
    private readonly application: Application,
  ) {}

  // static async initialize(
  //   body: Partial<RelevantDatesBody>,
  //   application: Application,
  //   token: string,
  //   dataServices: DataServices,
  // ): Promise<RelevantDates> {
  //   const page = new RelevantDates(body, application)
  //
  //   const mapping: Partial<Record<RelevantDateKeys,string>> = {
  //     paroleEligibilityDate:'paroleEligibilityDate',
  //     homeDetentionCurfewDate:'homeDetentionCurfewDate',
  //     pssEndDate:'pssEndDate'
  //   }
  //
  //   const preFill = await dataServices.formDataService.getPopulationData(token,application,dataServices,mapping)
  //   console.log('*****  Pre-fill',preFill)
  //
  //   return page
  // }

  public set body(value: Partial<RelevantDatesBody>) {
    this._body = {} as RelevantDatesBody

    let selectedDates = value.selectedDates || []

    relevantDateKeys.forEach((dateKey: RelevantDateKeys) => {
      if (value[dateKey]) {
        if (!selectedDates.includes(dateKey)) {
          selectedDates = [...selectedDates, dateKey]
        }
      }
    })
    this._body = { ...value, selectedDates }
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

  static getPrefillMapping(): PrefillMapping {
    return {
      licenceExpiryDate: { fieldName: 'licenceExpiryDate', type: 'DATE' },
      homeDetentionCurfewDate: { fieldName: 'homeDetentionCurfewDate', type: 'DATE' },
      pssEndDate: { fieldName: 'pssEndDate', type: 'DATE' },
    }
  }
}
