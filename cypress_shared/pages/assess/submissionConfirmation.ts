import Page from '../page'

export default class SubmissionConfirmation extends Page {
  constructor() {
    super('You have marked this application as unsuitable.')
  }

  clickBackToDashboard() {
    cy.contains('a', 'Back to dashboard').click()
  }
}
