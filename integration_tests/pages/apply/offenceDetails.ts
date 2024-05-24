import { ApprovedPremisesApplication, ArrayOfOASysOffenceDetailsQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class OffenceDetails extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly offenceDetailSummaries: ArrayOfOASysOffenceDetailsQuestions,
    private readonly oasysMissing: boolean,
  ) {
    const title = oasysMissing ? 'Provide risk information' : 'Offence details'
    super(
      title,
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'rosh-summary' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.offenceDetailSummaries, 'offenceDetailsAnswers', this.oasysMissing)
  }
}
