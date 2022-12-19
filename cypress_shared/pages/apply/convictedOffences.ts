import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class ConvictedOffences extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Has ${application.person.name} ever been convicted of the following offences?`,
      application,
      'risk-management-features',
      'convicted-offences',
      paths.applications.pages.show({
        id: application.id,
        task: 'risk-management-features',
        page: 'risk-management-features',
      }),
    )
  }

  completeForm(): void {
    this.checkRadioButtonFromPageBody('response')
  }
}
