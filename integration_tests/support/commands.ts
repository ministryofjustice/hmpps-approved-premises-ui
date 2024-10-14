Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.task('stubAllPremises', [])
  cy.task('stubCas1AllPremises', [])
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
