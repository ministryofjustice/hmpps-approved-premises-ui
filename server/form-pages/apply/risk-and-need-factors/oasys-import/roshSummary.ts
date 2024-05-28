/* eslint-disable no-underscore-dangle */
import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { getOasysSections, oasysImportReponse } from '../../../../utils/oasysImportUtils'

type RoshSummaryBody = {
  roshAnswers: Record<string, string>
  roshSummaries: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

@Page({
  name: 'rosh-summary',
  bodyProperties: ['roshAnswers', 'roshSummaries'],
})
export default class RoshSummary implements OasysPage {
  title = 'RoSH summary'

  riskTaskStep = 1

  roshSummaries: RoshSummaryBody['roshSummaries']

  risks: PersonRisksUI

  roshAnswers: RoshSummaryBody['roshAnswers']

  oasysCompleted: string

  oasysSuccess: boolean

  constructor(public body: Partial<RoshSummaryBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    return getOasysSections(body, application, token, dataServices, RoshSummary, {
      sectionName: 'roshSummary',
      summaryKey: 'roshSummaries',
      answerKey: 'roshAnswers',
    })
  }

  previous() {
    return 'optional-oasys-sections'
  }

  next() {
    return 'offence-details'
  }

  response() {
    return oasysImportReponse(this.body.roshAnswers, this.body.roshSummaries)
  }

  errors() {
    return {}
  }
}
