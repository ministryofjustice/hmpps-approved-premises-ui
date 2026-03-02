import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ComplexCaseBoardPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Does this person require a complex case board?`,
      application,
      'basic-information',
      'complex-case-board',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'male-ap',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('reviewRequired')
  }
}
