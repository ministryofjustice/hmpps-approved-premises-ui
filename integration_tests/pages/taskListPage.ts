import Page from './page'

export default class TaskListPage extends Page {
  shouldShowTaskStatus = (task: string, status: string): void => {
    cy.get(`#${task}-status`).should('contain', status)
  }

  shouldNotShowSection = (section: string): void => {
    cy.get('.app-task-list').should('not.contain', section)
  }

  shouldShowMissingCheckboxErrorMessage() {
    cy.get('.govuk-error-summary').should(
      'contain',
      'You must confirm the information provided is complete, accurate and up to date.',
    )
    cy.get(`[data-cy-error-confirmation]`).should(
      'contain',
      'You must confirm the information provided is complete, accurate and up to date.',
    )
  }
}
