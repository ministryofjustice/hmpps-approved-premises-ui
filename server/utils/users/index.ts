import { UserDetails } from '../../@types/ui'
import { hasRole, managerRoles } from './homePageDashboard'

export * from './homePageDashboard'
export * as tableUtils from './tableUtils'
export * from './userManagement'
export * from './roleCheckboxes'
export * from './roleCheckboxes/rolesToCheckboxItems'

export const hasManagerRole = (user: UserDetails) => managerRoles.some(role => hasRole(user, role))
