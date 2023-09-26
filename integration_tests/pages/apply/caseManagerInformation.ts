import { ApprovedPremisesApplication } from '@approved-premises/api'

import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class CaseManagerInformation extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Add case manager information',
      application,
      'basic-information',
      'case-manager-information',
      paths.applications.pages.show({
        id: application.id,
        task: 'basic-information',
        page: 'confirm-your-details',
      }),
    )
  }

  completeForm(): void {
    this.completeTextInputFromPageBody('name')
    this.completeTextInputFromPageBody('emailAddress')
    this.completeTextInputFromPageBody('phoneNumber')
  }
}
