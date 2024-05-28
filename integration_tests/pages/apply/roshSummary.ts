import { ApprovedPremisesApplication, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RoshSummary extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly roshSummary: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
    private readonly oasysMissing: boolean,
  ) {
    const title = oasysMissing ? 'Provide risk information' : 'RoSH summary'

    super(
      title,
      application,
      'oasys-import',
      'rosh-summary',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'optional-oasys-sections' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.roshSummary, 'roshAnswers', this.oasysMissing)
  }
}
