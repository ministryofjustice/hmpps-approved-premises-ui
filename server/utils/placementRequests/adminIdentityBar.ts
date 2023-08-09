import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'
import adminPaths from '../../paths/admin'

export const adminIdentityBar = (placementRequest: PlacementRequestDetail): IdentityBar => ({
  title: {
    html: title(placementRequest),
  },
  menus: [{ items: adminActions(placementRequest) }],
})

export const adminActions = (placementRequest: PlacementRequestDetail): Array<IdentityBarMenuItem> => {
  if (placementRequest.status === 'matched') {
    return [
      {
        href: managePaths.bookings.dateChanges.new({
          premisesId: placementRequest.booking.premisesId,
          bookingId: placementRequest.booking.id,
        }),
        text: 'Amend placement',
      },
      {
        href: managePaths.bookings.cancellations.new({
          premisesId: placementRequest.booking.premisesId,
          bookingId: placementRequest.booking.id,
        }),
        text: 'Cancel placement',
      },
    ]
  }
  return [
    {
      href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequest.id }),
      text: 'Create placement',
    },
    {
      href: adminPaths.admin.placementRequests.withdrawal.new({ id: placementRequest.id }),
      text: 'Withdraw placement request',
    },
  ]
}

export const title = (placementRequest: PlacementRequestDetail) => `
<span class="govuk-caption-l">Placement request</span>
<h1 class="govuk-heading-l">${placementRequest.person.name || 'Limited Access Offender'}</h1>
`
