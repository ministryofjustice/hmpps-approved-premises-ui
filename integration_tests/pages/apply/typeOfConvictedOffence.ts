import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class TypeOfConvictedOffence extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `What type of offending has ${nameOrPlaceholderCopy(application.person)} been convicted of?`,
      application,
      'risk-management-features',
      'type-of-convicted-offence',
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('offenceConvictions')
  }
}
