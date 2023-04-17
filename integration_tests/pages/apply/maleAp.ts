import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class MaleAp extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Has the Complex Case Board determined that the person should be placed in a male AP?',
      application,
      'basic-information',
      'male-ap',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'board-taken-place',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('shouldPersonBePlacedInMaleAp')
  }
}
