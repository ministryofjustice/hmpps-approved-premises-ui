import Page from '../page'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Are you sure you want to withdraw this placement application?')
  }

  clickConfirm() {
    cy.get('button').contains('Continue').click()
  }
}
