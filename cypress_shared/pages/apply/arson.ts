import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class ArsonPage extends Page {
  constructor(person: Person) {
    super('Arson')
    cy.get('.govuk-form-group').contains(`Does ${person.name} need a specialist arson room?`)
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('arson', 'yes')
    this.completeTextArea('arsonDetail', 'Some details here')
  }
}
