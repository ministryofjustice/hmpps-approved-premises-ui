import type { Premises } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import paths from '../../paths/manage'

export const premisesActions = (user: UserDetails, premises: Premises) => {
  const deprecatedManageActions = [
    {
      text: 'View calendar',
      classes: 'govuk-button--secondary',
      href: paths.premises.calendar({ premisesId: premises.id }),
    },
    {
      text: 'Create a placement',
      classes: 'govuk-button--secondary',
      href: paths.bookings.new({ premisesId: premises.id }),
    },
  ]
  const currentManageActions = [
    {
      text: 'Manage beds',
      classes: 'govuk-button--secondary',
      href: paths.premises.beds.index({ premisesId: premises.id }),
    },
  ]

  if (user.roles.includes('manager') || user.roles.includes('workflow_manager')) {
    return [...deprecatedManageActions, ...currentManageActions]
  }

  return currentManageActions
}
