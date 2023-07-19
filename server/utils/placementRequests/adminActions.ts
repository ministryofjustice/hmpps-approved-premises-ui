import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBarMenu, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'

export const adminActions = (placementRequest: PlacementRequestDetail): Array<IdentityBarMenu> => {
  let items: Array<IdentityBarMenuItem> = []

  if (placementRequest.booking) {
    items = [
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
  } else {
    items = [
      {
        href: '#',
        text: 'Create placement',
      },
    ]
  }

  return [
    {
      items,
    },
  ]
}
