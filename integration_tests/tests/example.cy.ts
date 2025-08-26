context('Example feature', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('Sample API data is visible on page', () => {
    cy.task('stubExampleData')
    cy.signIn()

    cy.get('p').contains('some sample data')
  })

  it('ExampleApi failure shows error page with custom error message', () => {
    cy.task('stubExampleData', 500)

    cy.signIn({ failOnStatusCode: false })

    cy.get('h1').contains('Internal Server Error')
  })
})
