import { ApprovedPremisesApplication, ArrayOfOASysOffenceDetailsQuestions } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class OffenceDetails extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly offenceDetailSummaries: ArrayOfOASysOffenceDetailsQuestions,
  ) {
    super('Edit risk information', application, 'oasys-import', 'offence-details')
  }

  completeForm() {
    this.completeOasysImportQuestions(this.offenceDetailSummaries, 'offenceDetailsAnswers')
  }
}
