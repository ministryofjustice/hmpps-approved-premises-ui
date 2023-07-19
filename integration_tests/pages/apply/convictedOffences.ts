import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class ConvictedOffences extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Has ${nameOrPlaceholderCopy(application.person)} ever been convicted of the following offences?`,
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
