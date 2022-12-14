/* eslint-disable no-underscore-dangle */
import type { DataServices, PersonRisksUI } from '@approved-premises/ui'

import type { Application, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions, OASysSections } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { escape } from '../../../../utils/formUtils'

type RoshSummaryBody = {
  roshAnswers: Array<string> | Record<string, string>
  roshSummaries: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

@Page({
  name: 'rosh-summary',
  bodyProperties: ['roshAnswers', 'roshSummaries'],
})
export default class RoshSummary implements TasklistPage {
  title = 'Edit risk information'

  roshSummary: RoshSummaryBody['roshSummaries']

  risks: PersonRisksUI

  roshAnswers: RoshSummaryBody['roshAnswers']

  constructor(public body: Partial<RoshSummaryBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSections: OASysSections = await dataServices.personService.getOasysSections(
      token,
      application.person.crn,
    )
    const risks = await dataServices.personService.getPersonRisks(token, application.person.crn)

    const roshSummaries = oasysSections.roshSummary.sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber))
    const roshAnswers = body?.roshAnswers ? body.roshAnswers : []

    body.roshSummaries = roshSummaries
    body.roshAnswers = roshAnswers

    const page = new RoshSummary(body)
    page.roshSummary = roshSummaries
    page.risks = risks

    return page
  }

  previous() {
    return 'optional-oasys-sections'
  }

  next() {
    return ''
  }

  roshTextAreas() {
    return this.roshSummary
      .map(roshQuestion => {
        return `<div class="govuk-form-group">
                <h3 class="govuk-label-wrapper">
                    <label class="govuk-label govuk-label--m" for=roshAnswers[${roshQuestion.questionNumber}]>
                        ${roshQuestion.label}
                    </label>
                </h3>
                <textarea class="govuk-textarea" id=roshAnswers[${roshQuestion.questionNumber}] name=roshAnswers[${
          roshQuestion.questionNumber
        }] rows="8">${escape(roshQuestion?.answer)}</textarea>
            </div>
            <hr>`
      })
      .join('')
  }

  response() {
    if (Array.isArray(this.body.roshAnswers)) {
      return (this.body.roshAnswers as Array<string>).reduce((prev, question, i) => {
        return {
          ...prev,
          [`${this.body.roshSummaries[i].questionNumber}. ${this.body.roshSummaries[i].label}`]: question,
        }
      }, {}) as Record<string, string>
    }
    if (!this.body.roshAnswers) {
      return {}
    }
    return this.body.roshAnswers
  }

  errors() {
    return {}
  }
}
