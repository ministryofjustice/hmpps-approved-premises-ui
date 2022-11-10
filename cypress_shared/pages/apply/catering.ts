import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class CateringPage extends Page {
  constructor(person: Person) {
    super('Catering requirements')
    cy.get('.govuk-form-group').contains(`Do you have any concerns about ${person.name} catering for themselves?`)
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('catering', 'yes')
    this.completeTextArea('cateringDetail', 'Some details here')
  }
}
