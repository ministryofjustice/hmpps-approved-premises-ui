import { ApprovedPremisesApplication, ArrayOfOASysRiskManagementPlanQuestions } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RiskManagementPlan extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly riskRiskManagementPlanSummaries: ArrayOfOASysRiskManagementPlanQuestions,
  ) {
    super('Edit risk information', application, 'oasys-import', 'offence-details')
  }

  completeForm() {
    this.completeOasysImportQuestions(this.riskRiskManagementPlanSummaries, 'riskManagementAnswers')
  }
}
