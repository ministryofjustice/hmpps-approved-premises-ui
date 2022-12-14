import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class AccessNeedsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Access needs', application, 'access-and-healthcare', 'access-needs')
  }

  checkAdditionalNeedsBoxes() {
    this.checkCheckboxesFromPageBody('additionalNeeds')
  }

  checkingAdditionalNeedsOtherDisablesOtherCheckBoxes() {
    this.checkAdditionalNeedsBoxes()

    this.checkCheckboxByNameAndValue('additionalNeeds', 'none')

    cy.get('input[name="additionalNeeds"]:not([value="none"])').should('be.disabled')

    this.uncheckCheckboxbyNameAndValue('additionalNeeds', 'none')
  }

  completeReligiousOrCulturalNeedsSection() {
    this.checkRadioButtonFromPageBody('religiousOrCulturalNeeds')
    this.completeTextInputFromPageBody('religiousOrCulturalNeedsDetails')
  }

  completeNeedsInterpreterSection() {
    this.checkRadioByNameAndValue('needsInterpreter', 'yes')
    this.completeTextInputFromPageBody('interpreterLanguage')
  }

  completeForm() {
    this.checkingAdditionalNeedsOtherDisablesOtherCheckBoxes()
    this.checkAdditionalNeedsBoxes()
    this.completeReligiousOrCulturalNeedsSection()
    this.completeNeedsInterpreterSection()
    this.checkRadioByNameAndValue('careActAssessmentCompleted', 'yes')
  }
}
