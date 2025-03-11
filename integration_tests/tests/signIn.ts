import { ApprovedPremisesUser } from '@approved-premises/api'

export const signIn = (user?: Partial<ApprovedPremisesUser>) => {
  cy.task('stubSignIn')
  cy.task('stubAuthUser', user)
  cy.signIn()
}
