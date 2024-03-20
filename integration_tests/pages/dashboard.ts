import Page from './page'

export default class DashboardPage extends Page {
  constructor() {
    super('Approved Premises')
    this.checkPhaseBanner('email us')
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

  clickFeedbackBanner() {
    cy.get('a').contains('Give us your feedback').click()
  }

  shouldShowFeedbackPage() {
    cy.get('span').contains('Satisfaction survey - Approved Premises (AP) also known as CAS1')
  }
}
