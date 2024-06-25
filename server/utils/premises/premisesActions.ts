import type { Premises } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import paths from '../../paths/manage'

export const premisesActions = (user: UserDetails, premises: Premises) => {
  const actions = [
    {
      text: 'Manage beds',
      classes: 'govuk-button--secondary',
      href: paths.premises.beds.index({ premisesId: premises.id }),
    },
  ]

  if (user.roles?.includes('future_manager')) {
    actions.push({
      text: 'Manage out of service bed records',
      classes: 'govuk-button--secondary',
      href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id }),
    })
  }

  if (user.roles?.includes('workflow_manager')) {
    actions.push({
      text: 'Create a placement',
      classes: 'govuk-button--secondary',
      href: paths.bookings.new({ premisesId: premises.id }),
    })
  }

  if (user.roles?.includes('manager')) {
    actions.push({
      text: 'View calendar',
      classes: 'govuk-button--secondary',
      href: paths.premises.calendar({ premisesId: premises.id }),
    })
  }

  return actions
}
