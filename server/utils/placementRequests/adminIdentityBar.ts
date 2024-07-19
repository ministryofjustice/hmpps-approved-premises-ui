import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem } from '../../@types/ui'

import managePaths from '../../paths/manage'
import matchPaths from '../../paths/match'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { nameOrPlaceholderCopy } from '../personUtils'
import config from '../../config'

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

  let createPlacementAction: { href: string; text: 'Create placement' | 'Search for a space' }

  if (config.flags.v2MatchEnabled === 'true' || config.flags.v2MatchEnabled === true) {
    createPlacementAction = {
      href: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
      text: 'Search for a space',
    }
  } else {
    createPlacementAction = {
      href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequest.id }),
      text: 'Create placement',
    }
  }

  return [
    createPlacementAction,
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
