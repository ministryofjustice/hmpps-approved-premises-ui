import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class MaleAp extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'What type of AP has the complex case board agreed to?',
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
