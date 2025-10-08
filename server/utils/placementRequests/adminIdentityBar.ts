import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem, UserDetails } from '../../@types/ui'

import adminPaths from '../../paths/admin'
import managePaths from '../../paths/manage'
import matchPaths from '../../paths/match'
import applyPaths from '../../paths/apply'
import { hasPermission } from '../users'
import { overallStatus } from '../placements'

export const adminIdentityBar = (placementRequest: Cas1PlacementRequestDetail, user: UserDetails): IdentityBar => {
  const identityBar: IdentityBar = {
    title: {
      html: title(placementRequest),
    },
  }
  if (!placementRequest.isWithdrawn) {
    identityBar.menus = [{ items: adminActions(placementRequest, user) }]
  }

  return identityBar
}

export const changePlacementLink = (placementRequest: Cas1PlacementRequestDetail) => {
  const changeablePlacements = placementRequest.spaceBookings.filter(placement =>
    ['upcoming', 'arrived'].includes(overallStatus(placement)),
  )

  if (changeablePlacements.length > 1) {
    return adminPaths.admin.placementRequests.selectPlacement({ placementRequestId: placementRequest.id })
  }

  if (changeablePlacements.length === 1) {
    return managePaths.premises.placements.changes.new({
      premisesId: changeablePlacements[0].premises.id,
      placementId: changeablePlacements[0].id,
    })
  }

  return undefined
}

export const adminActions = (
  placementRequest: Cas1PlacementRequestDetail,
  user: UserDetails,
): Array<IdentityBarMenuItem> => {
  if (placementRequest.status === 'matched' && placementRequest.spaceBookings.length > 0) {
    const matchedActions = []

    const changeLink = changePlacementLink(placementRequest)

    if (changeLink) {
      matchedActions.push({
        href: changeLink,
        text: 'Change placement',
      })
    }

    if (hasPermission(user, ['cas1_space_booking_create_additional'])) {
      matchedActions.push({
        href: matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId: placementRequest.id }),
        text: 'Create new placement',
      })
    }

    if (hasPermission(user, ['cas1_booking_withdraw'])) {
      matchedActions.push({
        href: applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
        text: 'Withdraw placement',
      })
    }

    return matchedActions
  }

  const actions = [
    {
      href: applyPaths.applications.withdraw.new({ id: placementRequest.applicationId }),
      text: 'Withdraw request for placement',
    },
    {
      href: matchPaths.placementRequests.bookingNotMade.confirm({ placementRequestId: placementRequest.id }),
      text: 'Mark as unable to book',
    },
  ]

  if (hasPermission(user, ['cas1_space_booking_create'])) {
    actions.unshift({
      href: matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: placementRequest.id }),
      text: 'Search for a space',
    })
  }

  return actions
}

export const title = (placementRequest: Cas1PlacementRequestDetail) => {
  let heading = ''
  if (placementRequest.isWithdrawn) {
    heading += `<strong class="govuk-tag govuk-tag--red govuk-!-margin-5">Request for placement withdrawn</strong>`
  }
  return `<h1 class="govuk-heading-l">Placement request${heading}</h1>`
}
