import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { nameOrPlaceholderCopy } from '../personUtils'

export const adminIdentityBar = (placementRequest: PlacementRequestDetail): IdentityBar => {
  const identityBar: IdentityBar = {
    title: {
      html: title(placementRequest),
    },
  }

  if (!placementRequest.isWithdrawn) {
    identityBar.menus = [{ items: adminActions(placementRequest) }]
  }

  return identityBar
}

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
      text: 'Withdraw request for placement',
    },
    {
      href: adminPaths.admin.placementRequests.unableToMatch.new({ id: placementRequest.id }),
      text: 'Mark as unable to match',
    },
  ]
}

export const title = (placementRequest: PlacementRequestDetail) => {
  let heading = nameOrPlaceholderCopy(placementRequest.person, 'Limited Access Offender')
  if (placementRequest.isWithdrawn) {
    heading += `<strong class="govuk-tag govuk-tag--red govuk-!-margin-5">Request for placement withdrawn</strong>`
  }
  return `<span class="govuk-caption-l">Placement request</span><h1 class="govuk-heading-l">${heading}</h1>`
}
