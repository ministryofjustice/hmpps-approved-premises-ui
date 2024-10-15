import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import paths from '../../../server/paths/apply'

export default class PregnancyPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Access, cultural and healthcare needs',
      application,
      'access-and-healthcare',
      'pregnancy',
      paths.applications.pages.show({
        id: application.id,
        task: 'access-and-healthcare',
        page: 'access-needs-further-questions',
      }),
    )
    cy.get('.govuk-form-group').contains(`What is their expected date of delivery?`)
  }

  completeForm() {
    this.completeDateInputsFromPageBody('expectedDeliveryDate')
    this.checkRadioButtonFromPageBody('socialCareInvolvement')
    this.completeTextInputFromPageBody('socialCareInvolvementDetail')
    this.checkRadioButtonFromPageBody('otherPregnancyConsiderations')
    this.completeTextInputFromPageBody('otherPregnancyConsiderationsDetail')
    this.checkRadioButtonFromPageBody('childRemoved')
  }
}
