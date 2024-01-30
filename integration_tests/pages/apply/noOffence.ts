import Page from '../page'

export default class NoOffencePage extends Page {
  constructor() {
    super(`There are no offences for this person`)
  }

  shouldShowParagraphText(paragraphText: string) {
    cy.get('.govuk-body').should('contain', paragraphText)
  }

  confirmLinkText(linkText: string) {
    cy.get('a').contains(linkText)
  }
}
