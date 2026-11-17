Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/sign-in')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
