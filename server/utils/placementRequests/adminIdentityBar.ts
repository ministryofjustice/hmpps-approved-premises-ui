import { PlacementRequestDetail } from '../../@types/shared'
import { IdentityBar, IdentityBarMenuItem, UserDetails } from '../../@types/ui'

import managePaths from '../../paths/manage'
import matchPaths from '../../paths/match'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { isUnknownPerson, nameOrPlaceholderCopy } from '../personUtils'
import config from '../../config'
import { hasPermission } from '../users'

export const adminIdentityBar = (placementRequest: PlacementRequestDetail, user: UserDetails): IdentityBar => {
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

export const adminActions = (
  placementRequest: PlacementRequestDetail,
  user: UserDetails,
): Array<IdentityBarMenuItem> => {
  if (placementRequest.status === 'matched') {
    const matchedActions = [
      {
        href: managePaths.bookings.dateChanges.new({
          premisesId: placementRequest?.booking?.premisesId || '',
          bookingId: placementRequest?.booking?.id || '',
        }),
        text: 'Amend placement',
      },
    ]
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
      href: adminPaths.admin.placementRequests.unableToMatch.new({ id: placementRequest.id }),
      text: 'Mark as unable to match',
    },
  ]

  if (hasPermission(user, ['cas1_booking_create'])) {
    if (config.flags.v2MatchEnabled === 'true' || config.flags.v2MatchEnabled === true) {
      actions.unshift({
        href: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
        text: 'Search for a space',
      })
    } else {
      actions.unshift({
        href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequest.id }),
        text: 'Create placement',
      })
    }
  }

  return actions
}

export const title = (placementRequest: PlacementRequestDetail) => {
  const { person } = placementRequest
  let heading = nameOrPlaceholderCopy(
    person,
    isUnknownPerson(person) ? `Not Found CRN: ${person.crn}` : `LAO: ${person.crn}`,
  )
  if (placementRequest.isWithdrawn) {
    heading += `<strong class="govuk-tag govuk-tag--red govuk-!-margin-5">Request for placement withdrawn</strong>`
  }
  return `<span class="govuk-caption-l">Placement request</span><h1 class="govuk-heading-l">${heading}</h1>`
}
