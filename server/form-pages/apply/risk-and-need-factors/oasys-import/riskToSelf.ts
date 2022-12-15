import type { DataServices, PersonRisksUI } from '@approved-premises/ui'

import type {
  ApprovedPremisesApplication,
  ArrayOfOASysRiskToSelfQuestions,
  OASysSections,
} from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RiskToSelfBody = {
  riskToSelfAnswers: Array<string> | Record<string, string>
  riskToSelfSummaries: ArrayOfOASysRiskToSelfQuestions
}

@Page({
  name: 'risk-to-self',
  bodyProperties: ['riskToSelfAnswers', 'riskToSelfSummaries'],
})
export default class RiskToSelf implements TasklistPage {
  title = 'Edit risk information'

  riskToSelfSummaries: RiskToSelfBody['riskToSelfSummaries']

  riskToSelfAnswers: RiskToSelfBody['riskToSelfAnswers']

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

    const riskToSelf = oasysSections.riskToSelf.sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber))

    body.riskToSelfSummaries = riskToSelf

    const page = new RiskToSelf(body)
    page.riskToSelfSummaries = riskToSelf
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
