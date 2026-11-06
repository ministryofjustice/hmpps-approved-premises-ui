import { ApprovedPremisesUser, ApprovedPremisesUserPermission, ApprovedPremisesUserRole } from '@approved-premises/api'
import { roleToPermissions } from '../../server/utils/users/roles'
import { makeArrayOfType } from '../../server/utils/utils'

export const defaultUserId = '70596333-63d4-4fb2-8acc-9ca55563d878'

export const signIn = (
  role: ApprovedPremisesUserRole | Array<ApprovedPremisesUserRole>,
  user?: Partial<ApprovedPremisesUser>,
) => {
  cy.task('debug', 'signIn: stubbing OAuth endpoints')
  cy.task('stubSignIn')
  cy.task('debug', 'signIn: OAuth endpoints stubbed')
  const rolesPermissions = makeArrayOfType<ApprovedPremisesUserRole>(role).reduce(
    (permissionList, userRole: ApprovedPremisesUserRole) => [...permissionList, ...roleToPermissions(userRole)],
    [] as Array<ApprovedPremisesUserPermission>,
  )
  cy.task('debug', 'signIn: stubbing user')
  cy.task('stubAuthUser', { role, ...user, permissions: [...rolesPermissions, ...(user?.permissions || [])] })
  cy.task('debug', 'signIn: user stubbed')
  cy.task('debug', 'signIn: starting Cypress sign-in command')
  cy.signIn()
  cy.task('debug', 'signIn: Cypress sign-in command complete')
}
