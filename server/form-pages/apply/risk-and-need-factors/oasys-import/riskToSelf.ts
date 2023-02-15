import type { DataServices, PersonRisksUI, OASysSectionUIArray } from '@approved-premises/ui'

import type { ApprovedPremisesApplication, OASysSections } from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse, sortOasysImportSummaries } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RiskToSelfBody = {
  riskToSelfAnswers: Array<string> | Record<string, string> | null
  riskToSelfSummaries: OASysSectionUIArray
}
@Page({
  name: 'risk-to-self',
  bodyProperties: ['riskToSelfAnswers', 'riskToSelfSummaries'],
})
export default class RiskToSelf implements TasklistPage {
  title = 'Edit risk information'

  riskToSelfSummaries: RiskToSelfBody['riskToSelfSummaries']

  riskToSelfAnswers: RiskToSelfBody['riskToSelfAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  constructor(public body: Partial<RiskToSelfBody>) {}

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

    const riskToSelf = sortOasysImportSummaries(oasysSections.riskToSelf)

    body.riskToSelfSummaries = riskToSelf

    const page = new RiskToSelf(body)
    page.riskToSelfSummaries = riskToSelf as OASysSectionUIArray
    page.oasysCompleted = oasysSections?.dateCompleted || oasysSections?.dateStarted
    page.risks = mapApiPersonRisksForUi(application.risks)

    return page
  }

  previous() {
    return 'risk-management-plan'
  }

  next() {
    return ''
  }

  response() {
    return oasysImportReponse(this.body.riskToSelfAnswers, this.body.riskToSelfSummaries)
  }

  errors() {
    return {}
  }
}
