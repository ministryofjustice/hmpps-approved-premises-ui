import { ApprovedPremisesUserPermission } from '@approved-premises/api'

export const signIn = (roles: Array<string>, permissions?: Array<ApprovedPremisesUserPermission>) => {
  cy.task('stubSignIn')
  cy.task('stubAuthUser', { roles, permissions })
  cy.signIn()
}
