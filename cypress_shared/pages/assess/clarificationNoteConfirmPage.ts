import Page from '../page'

export default class SufficientInformationPage extends Page {
  constructor() {
    super('Note Created')
  }

  clickBackToDashboard() {
    cy.get('a').contains('Back to dashboard').click()
  }
}
