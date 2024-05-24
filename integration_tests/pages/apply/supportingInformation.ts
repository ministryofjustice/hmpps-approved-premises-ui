import { ApprovedPremisesApplication, ArrayOfOASysSupportingInformationQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class SupportingInformation extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly supportingInformationSummaries: ArrayOfOASysSupportingInformationQuestions,
    private readonly oasysMissing: boolean,
  ) {
    const title = oasysMissing ? 'Provide risk information' : 'Supporting information'

    super(
      title,
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'offence-details' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(
      this.supportingInformationSummaries,
      'supportingInformationAnswers',
      this.oasysMissing,
    )
  }
}
