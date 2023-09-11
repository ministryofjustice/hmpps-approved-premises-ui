import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ComplexCaseBoardPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Does the person's gender identity require a complex case board to review their application?`,
      application,
      'basic-information',
      'complex-case-board',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'transgender',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('reviewRequired')
  }
}
