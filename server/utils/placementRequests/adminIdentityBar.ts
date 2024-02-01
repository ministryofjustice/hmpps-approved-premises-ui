import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { nameOrPlaceholderCopy } from '../personUtils'

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
          premisesId: placementRequest?.booking?.premisesId || '',
          bookingId: placementRequest?.booking?.id || '',
        }),
        text: 'Amend placement',
      },
      {
        href: applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
        text: 'Withdraw placement',
      },
    ]
  }
  return [
    {
      href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequest.id }),
      text: 'Create placement',
    },
    {
      href: applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
      text: 'Withdraw placement request',
    },
    {
      href: adminPaths.admin.placementRequests.unableToMatch.new({ id: placementRequest.id }),
      text: 'Mark as unable to match',
    },
  ]
}

export const title = (placementRequest: PlacementRequestDetail) => `
<span class="govuk-caption-l">Placement request</span>
<h1 class="govuk-heading-l">${nameOrPlaceholderCopy(placementRequest.person, 'Limited Access Offender')}</h1>
`
