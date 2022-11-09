import Page from '../page'
import { Person } from '../../../server/@types/shared'

export default class PreviousPlacementsPage extends Page {
  constructor(person: Person) {
    super('Previous placements')
    cy.get('.govuk-form-group').contains(`Has ${person.name} stayed or been offered a placement in an AP before?`)
  }

  completeForm(): void {
    this.checkRadioByNameAndValue('previousPlacement', 'yes')
    this.completeTextArea('previousPlacementDetail', 'Some details here')
  }
}
