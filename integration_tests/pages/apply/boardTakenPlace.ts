import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class BoardTakenPlace extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Has the Complex Case Board taken place?',
      application,
      'basic-information',
      'board-taken-place',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'complex-case-board',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('hasBoardTakenPlace')
  }
}
