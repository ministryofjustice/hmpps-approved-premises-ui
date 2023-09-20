import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class RehabilitativeInterventions extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      "Which of the rehabilitative activities will assist the person's rehabilitation in the Approved Premises (AP)?",
      application,
      'risk-management-features',
      'rehabilitative-interventions',
      paths.applications.pages.show({ id: application.id, task: 'risk-management-features', page: 'date-of-offence' }),
    )
  }

  completeForm(): void {
    this.checkCheckboxesFromPageBody('rehabilitativeInterventions')
    this.completeTextInputFromPageBody('otherIntervention')
    this.completeTextInputFromPageBody('summary')
  }
}
