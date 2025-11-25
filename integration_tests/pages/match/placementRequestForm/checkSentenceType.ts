import Page from '../../page'

export default class CheckSentenceTypePage extends Page {
  constructor() {
    super('Check the sentencing information')
  }

  verifyPageContent() {
    cy.contains('Sentence information selected on the original application.')
  }
}
