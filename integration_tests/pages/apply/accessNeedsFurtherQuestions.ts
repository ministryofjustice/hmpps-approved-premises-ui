import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class AccessNeedsFurtherQuestionsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Access, cultural and healthcare needs',
      application,
      'access-and-healthcare',
      'access-needs-further-questions',
      paths.applications.pages.show({ id: application.id, task: 'access-and-healthcare', page: 'access-needs' }),
    )
    cy.get('.govuk-form-group').contains(`Does the person require the use of a wheelchair?`)
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('needsWheelchair')
    this.checkRadioButtonFromPageBody('healthConditions')
    this.completeTextInputFromPageBody('healthConditionsDetail')
    this.checkRadioButtonFromPageBody('prescribedMedication')
    this.completeTextInputFromPageBody('prescribedMedicationDetail')
    this.checkRadioButtonFromPageBody('isPersonPregnant')
  }
}
