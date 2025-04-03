import { ApprovedPremisesUser, ApprovedPremisesUserRole } from '@approved-premises/api'
import { roleToPermissions } from '../../server/utils/users/roles'

export const signIn = (role: ApprovedPremisesUserRole, user?: Partial<ApprovedPremisesUser>) => {
  cy.task('stubSignIn')
  cy.task('stubAuthUser', { role, permissions: roleToPermissions(role), ...user })
  cy.signIn()
}
