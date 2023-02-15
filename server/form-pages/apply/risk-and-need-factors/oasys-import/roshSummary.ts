/* eslint-disable no-underscore-dangle */
import type { DataServices, PersonRisksUI, OASysSectionUIArray } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, OASysSections } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse, sortOasysImportSummaries } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RoshSummaryBody = {
  roshAnswers: Array<string> | Record<string, string> | null
  roshSummaries: OASysSectionUIArray
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

  oasysCompleted: string

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
    page.roshSummary = roshSummaries as OASysSectionUIArray
    page.oasysCompleted = oasysSections?.dateCompleted || oasysSections?.dateStarted
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
