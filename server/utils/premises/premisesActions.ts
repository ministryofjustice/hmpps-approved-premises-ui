import type { Cas1Premises } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import paths from '../../paths/manage'
import { hasPermission } from '../users'

export const premisesActions = (user: UserDetails, premises: Cas1Premises) => {
  const actions = []

  const premisesBedsPath = paths.premises.beds.index({ premisesId: premises.id })

  actions.push({
    text: 'Manage beds',
    classes: 'govuk-button--secondary',
    href: premisesBedsPath,
  })

  if (hasPermission(user, ['cas1_out_of_service_bed_create'])) {
    actions.push({
      text: 'Manage out of service bed records',
      classes: 'govuk-button--secondary',
      href: paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }),
    })
  }

  if (hasPermission(user, ['cas1_premises_view']) && premises.supportsSpaceBookings) {
    actions.push({
      text: 'View spaces',
      classes: 'govuk-button--secondary',
      href: paths.premises.occupancy.view({ premisesId: premises.id }),
    })
  }

  return actions
}
