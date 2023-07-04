import { ApprovedPremisesApplication, ArrayOfOASysRiskManagementPlanQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RiskManagementPlan extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly riskRiskManagementPlanSummaries: ArrayOfOASysRiskManagementPlanQuestions,
    private readonly oasysMissing: boolean,
  ) {
    const title = oasysMissing ? 'Provide risk information' : 'Edit risk information'

    super(
      title,
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'supporting-information' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.riskRiskManagementPlanSummaries, 'riskManagementAnswers', this.oasysMissing)
  }
}
