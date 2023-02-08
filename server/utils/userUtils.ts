import { UserRole } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'

export const hasRole = (user: UserDetails, role: UserRole): boolean => {
  return (user.roles || []).includes(role)
}
