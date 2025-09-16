import Page from './page'

export default class HomePage extends Page {
  constructor() {
    super('Community Payback')
  }

  static visit(): HomePage {
    cy.visit('/')

    return new HomePage()
  }

  shouldShowSignOutButton(): void {
    cy.get('[data-qa="signOut"]').should('exist')
  }

  shouldShowCards(sections: Array<string>) {
    sections.forEach(section => cy.get(`[data-cy-card-section="${section}"]`).should('exist'))
  }
}
