export const signIn = (roles: Array<string>) => {
  cy.task('stubSignIn')
  cy.task('stubAuthUser', { roles })
  cy.signIn()
}
