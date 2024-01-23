import { ApprovedPremisesApplication } from '@approved-premises/api'

import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class ConfirmYourDetails extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Confirm your details',
      application,
      'basic-information',
      'confirm-your-details',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('detailsToUpdate', { addArrayNotationToInputName: true })
    this.completeTextInputFromPageBody('name')
    this.completeTextInputFromPageBody('emailAddress')
    this.completeTextInputFromPageBody('phoneNumber')
    this.checkRadioButtonFromPageBody('caseManagementResponsibility')
    this.selectSelectOptionFromPageBody('area')
  }
}
