import { cas1PremisesSummaryFactory, premisesSummaryFactory } from '../../server/testutils/factories'
import { signIn } from './signIn'

context('Redirects', () => {
  beforeEach(() => {
    cy.task('reset')
    signIn([])
  })

  const redirects = [
    ['/premises', '/manage/premises'],
    ['/premises/:premisesId', '/manage/premises/:premisesId'],
    ['/premises/:premisesId/beds', '/manage/premises/:premisesId/beds'],
    ['/premises/:premisesId/beds/:bedId', '/manage/premises/:premisesId/beds/:bedId'],
  ]

  redirects.forEach(([from, to]) => {
    it(`redirects from ${from} to ${to}`, () => {
      cy.visit(from, { failOnStatusCode: false })

      cy.location('pathname').should('eq', to)
    })
  })
})
