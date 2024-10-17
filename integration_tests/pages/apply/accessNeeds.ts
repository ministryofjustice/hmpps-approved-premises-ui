import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class AccessNeedsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Access, cultural and healthcare needs',
      application,
      'access-and-healthcare',
      'access-needs',
      paths.applications.show({ id: application.id }),
    )
  }

  checkAdditionalNeedsBoxes() {
    this.checkCheckboxesFromPageBody('additionalNeeds')
  }

  checkingAdditionalNeedsNoneDeselectsOtherCheckBoxes() {
    this.checkAdditionalNeedsBoxes()

    this.checkCheckboxByNameAndValue('additionalNeeds', 'none')

    cy.get('input[name="additionalNeeds"]:not([value="none"])').should('not.be.checked')

    this.uncheckCheckboxbyNameAndValue('additionalNeeds', 'none')
  }

  completeReligiousOrCulturalNeedsSection() {
    this.checkRadioButtonFromPageBody('religiousOrCulturalNeeds')
    this.completeTextInputFromPageBody('religiousOrCulturalNeedsDetail')
  }

  completeCareAndSupportNeedsSection() {
    this.checkRadioButtonFromPageBody('careAndSupportNeeds')
    this.completeTextInputFromPageBody('careAndSupportNeedsDetail')
  }

  completeNeedsInterpreterSection() {
    this.checkRadioByNameAndValue('needsInterpreter', 'yes')
    this.completeTextInputFromPageBody('interpreterLanguage')
  }

  completeForm() {
    this.checkingAdditionalNeedsNoneDeselectsOtherCheckBoxes()
    this.checkAdditionalNeedsBoxes()
    this.completeReligiousOrCulturalNeedsSection()
    this.completeNeedsInterpreterSection()
    this.completeCareAndSupportNeedsSection()
    this.checkRadioByNameAndValue('careActAssessmentCompleted', 'yes')
  }
}
