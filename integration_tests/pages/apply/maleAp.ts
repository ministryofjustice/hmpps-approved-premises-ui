import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class MaleAp extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'What type of AP does the person need?',
      application,
      'basic-information',
      'male-ap',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'transgender',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('shouldPersonBePlacedInMaleAp')
  }
}
