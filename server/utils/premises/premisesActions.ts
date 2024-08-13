import type { Premises } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import paths from '../../paths/manage'

export const premisesActions = (user: UserDetails, premises: Premises) => {
  const actions = []

  const premisesBedsPath = user.roles?.includes('future_manager')
    ? paths.v2Manage.premises.beds.index({ premisesId: premises.id })
    : paths.premises.beds.index({ premisesId: premises.id })

  actions.push({
    text: 'Manage beds',
    classes: 'govuk-button--secondary',
    href: premisesBedsPath,
  })

  if (user.roles?.includes('future_manager')) {
    actions.push({
      text: 'Manage out of service bed records',
      classes: 'govuk-button--secondary',
      href: paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
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
