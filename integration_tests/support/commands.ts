Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.task('debug', 'cy.signIn: requesting /sign-in')
  cy.request('/sign-in')
  cy.task('debug', 'cy.signIn: /sign-in request complete')
  cy.task('debug', 'cy.signIn: looking up OAuth callback URL')
  return cy.task('getSignInUrl').then((url: string) => {
    cy.task('debug', 'cy.signIn: callback URL received, requesting callback')
    return cy.request({ url, failOnStatusCode: options.failOnStatusCode, followRedirect: false }).then(response => {
      cy.task('debug', 'cy.signIn: callback request complete')
      const locationHeader = response.headers.location
      const redirectLocation = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader
      if (!redirectLocation) throw new Error('OAuth callback did not return a redirect location')
      const redirectTarget = new URL(redirectLocation, Cypress.config('baseUrl'))
      cy.task(
        'debug',
        `cy.signIn: visiting callback redirect target ${redirectTarget.origin}${redirectTarget.pathname}`,
      )
      return cy
        .visit(redirectTarget.href, options)
        .then(window => cy.task('debug', 'cy.signIn: callback redirect target loaded').then(() => window))
    })
  })
})
