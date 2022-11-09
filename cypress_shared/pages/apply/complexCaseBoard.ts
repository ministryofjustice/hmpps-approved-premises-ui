import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class ComplexCaseBoardPage extends Page {
  constructor(person: Person) {
    super('Complex case board')
    cy.get('.govuk-form-group').contains(
      `Does ${person.name}'s gender identity require a complex case board to review their application? `,
    )
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('complexCaseBoard', 'yes')
    this.completeTextArea('complexCaseBoardDetail', 'Some details here')
  }
}
