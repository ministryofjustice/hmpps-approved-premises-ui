/* eslint-disable no-underscore-dangle */
import type { DataServices, PersonRisksUI } from '@approved-premises/ui'

import type {
  ApprovedPremisesApplication,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  OASysSections,
} from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse, sortOasysImportSummaries } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

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
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ) {
    const oasysSections: OASysSections = await dataServices.personService.getOasysSections(
      token,
      application.person.crn,
    )

    const roshSummaries = sortOasysImportSummaries(oasysSections.roshSummary)
    body.roshSummaries = roshSummaries

    const page = new RoshSummary(body)
    page.roshSummary = roshSummaries
    page.risks = mapApiPersonRisksForUi(application.risks)

    return page
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
