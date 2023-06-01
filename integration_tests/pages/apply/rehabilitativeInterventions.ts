import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RehabilitativeInterventions extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?",
      application,
      'risk-management-features',
      'rehabilitative-interventions',
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('rehabilitativeInterventions')
    this.completeTextInputFromPageBody('otherIntervention')
    this.completeTextInputFromPageBody('summary')
  }
}
