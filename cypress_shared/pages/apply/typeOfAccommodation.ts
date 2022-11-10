import { Person } from '../../../server/@types/shared'
import Page from '../page'

export default class TypeOfAccomodationPage extends Page {
  constructor(person: Person) {
    super('Placement duration and move on')
    cy.get('.govuk-form-group').contains(`What type of accommodation will ${person.name} have when they leave the AP?`)
  }

  completeForm() {
    this.checkRadioByNameAndValue('accommodationType', 'other')
    this.getTextInputByIdAndEnterDetails('otherAccommodationType', 'Another type')
  }
}
