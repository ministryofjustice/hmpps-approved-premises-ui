import { ApprovedPremisesApplication, ArrayOfOASysRiskToSelfQuestions } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RiskToSelf extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly riskToSelfummaries: ArrayOfOASysRiskToSelfQuestions,
  ) {
    super('Edit risk information', application, 'oasys-import', 'offence-details')
  }

  completeForm() {
    this.completeOasysImportQuestions(this.riskToSelfummaries, 'riskToSelfAnswers')
  }
}
