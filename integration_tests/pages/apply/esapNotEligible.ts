import Page from '../page'

export default class EsapNotEligible extends Page {
  constructor() {
    super(`The person is not eligible for an Enhanced Security Approved Premises (ESAP) placement.`)
  }

  clickContinueWithApplication() {
    cy.get('a[role="button"]').contains('Continue with application').click()
  }
}
