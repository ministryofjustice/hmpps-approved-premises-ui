import { Application } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RehabilitativeInterventions extends ApplyPage {
  constructor(application: Application) {
    super(
      "Which rehabilitative interventions will support the person's Approved Premises (AP) placement?",
      application,
      'risk-management-features',
      'rehabilitative-interventions',
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('rehabilitativeInterventions')
    this.completeTextInputFromPageBody('otherIntervention')
  }
}
