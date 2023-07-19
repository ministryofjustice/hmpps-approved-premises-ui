import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'

export const adminIdentityBar = (placementRequest: PlacementRequestDetail): IdentityBar => ({
  title: {
    html: title(placementRequest),
  },
  menus: [{ items: adminActions(placementRequest) }],
})

export const adminActions = (placementRequest: PlacementRequestDetail): Array<IdentityBarMenuItem> => {
  if (placementRequest.booking) {
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
      href: '#',
      text: 'Create placement',
    },
  ]
}

export const title = (placementRequest: PlacementRequestDetail) => `
<span class="govuk-caption-l">Placement request</span>
<h1 class="govuk-heading-l">${placementRequest.person.name || 'Limited Access Offender'}</h1>
`
