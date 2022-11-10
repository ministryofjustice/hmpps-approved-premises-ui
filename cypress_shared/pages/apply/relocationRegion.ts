import { Person } from '../../../server/@types/shared'
import Page from '../page'

export default class RelocationRegionPage extends Page {
  constructor(person: Person) {
    super('Placement duration and move on')
    cy.get('.govuk-form-group').contains(`Where is ${person.name} most likely to live when they move on from the AP?`)
  }

  completeForm() {
    this.getTextInputByIdAndEnterDetails('postcodeArea', 'XX1')
  }
}
