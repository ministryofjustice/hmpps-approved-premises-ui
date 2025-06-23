import Page from './page'

export default class DashboardPage extends Page {
  constructor() {
    super('Approved Premises')
    this.checkPhaseBanner()
  }

  static visit(): DashboardPage {
    cy.visit('/')
    return new DashboardPage()
  }

  shouldShowCard(service: string) {
    cy.get(`[data-cy-card-service="${service}"]`).should('exist')
  }

  shouldNotShowCard(service: string) {
    cy.get(`[data-cy-card-service="${service}"]`).should('not.exist')
  }

  followLinkTo(dashboardLink: string) {
    cy.get('a').contains(dashboardLink).click()
  }
}
