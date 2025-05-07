import { ApprovedPremisesUser, ApprovedPremisesUserPermission, ApprovedPremisesUserRole } from '@approved-premises/api'
import { roleToPermissions } from '../../server/utils/users/roles'
import { makeArrayOfType } from '../../server/utils/utils'

export const signIn = (
  role: ApprovedPremisesUserRole | Array<ApprovedPremisesUserRole>,
  user?: Partial<ApprovedPremisesUser>,
) => {
  cy.task('stubSignIn')
  const permissions = makeArrayOfType<ApprovedPremisesUserRole>(role).reduce(
    (permissionList, userRole: ApprovedPremisesUserRole) => [...permissionList, ...roleToPermissions(userRole)],
    [] as Array<ApprovedPremisesUserPermission>,
  )
  cy.task('stubAuthUser', { role, permissions, ...user })
  cy.signIn()
}
