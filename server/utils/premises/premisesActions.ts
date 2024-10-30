import type { Premises } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import paths from '../../paths/manage'

export const premisesActions = (user: UserDetails, premises: Premises) => {
  const actions = []

  const premisesBedsPath = paths.premises.beds.index({ premisesId: premises.id })

  actions.push({
    text: 'Manage beds',
    classes: 'govuk-button--secondary',
    href: premisesBedsPath,
  })

  if (user.roles?.includes('future_manager')) {
    actions.push({
      text: 'Manage out of service bed records',
      classes: 'govuk-button--secondary',
      href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
    })
  }

  return actions
}
