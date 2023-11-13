import { ApplicationTimelineNote } from '../../../server/@types/shared'
import Page from '../page'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Do you want to add this note')
  }

  shouldShowNote(note: ApplicationTimelineNote) {
    cy.get('.govuk-inset-text').should('contain', note.note)
  }

  clickConfirm() {
    cy.get('button').contains('Confirm').click()
  }
}
