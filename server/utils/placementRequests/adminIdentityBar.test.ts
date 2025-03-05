import { fromPartial } from '@total-typescript/shoehorn'
import { ApprovedPremisesUserPermission, PlacementRequestDetail } from '@approved-premises/api'
import {
  cas1SpaceBookingSummaryFactory,
  personFactory,
  placementRequestDetailFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'
import matchPaths from '../../paths/match'
import adminPaths from '../../paths/admin'
import applyPaths from '../../paths/apply'
import { fullPersonFactory } from '../../testutils/factories/person'
import config from '../../config'

const setup = ({
  placementRequestDetail,
  permissions,
}: {
  placementRequestDetail: PlacementRequestDetail
  permissions: Array<ApprovedPremisesUserPermission>
}) => {
  const userId = 'some-id'
  const user = userDetailsFactory.build({ roles: ['appeals_manager'], permissions: [...permissions], id: userId })

  const actionCreatePlacement = {
    href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequestDetail.id }),
    text: 'Create placement',
  }
  const actionSearchForASpace = {
    href: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequestDetail.id }),
    text: 'Search for a space',
  }
  const actionAmendLegacyBooking = {
    href: managePaths.bookings.dateChanges.new({
      premisesId: placementRequestDetail.booking.premisesId,
      bookingId: placementRequestDetail.booking.id,
    }),
    text: 'Amend placement',
  }
  const actionChangePlacement = {
    href: managePaths.premises.placements.changes.new({
      premisesId: placementRequestDetail.booking.premisesId,
      placementId: placementRequestDetail.booking.id,
    }),
    text: 'Change placement',
  }
  const actionWithdrawPlacement = {
    href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
    text: 'Withdraw placement',
  }
  const actionWithdrawPlacementRequest = {
    href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
    text: 'Withdraw request for placement',
  }
  const adminActionsResult = adminActions(placementRequestDetail, user)
  return {
    placementRequestDetail,
    actionCreatePlacement,
    actionSearchForASpace,
    actionAmendLegacyBooking,
    actionChangePlacement,
    actionWithdrawPlacement,
    actionWithdrawPlacementRequest,
    adminActionsResult,
  }
}

describe('adminIdentityBar', () => {
  describe('adminActions', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    describe('if the status of the placement request is `matched`', () => {
      describe('if the placement request has a legacy booking', () => {
        const placementRequestDetail = placementRequestDetailFactory.withLegacyBooking().build()

        it('should return an action to amend the booking', () => {
          const { adminActionsResult, actionAmendLegacyBooking } = setup({
            placementRequestDetail,
            permissions: [],
          })
          expect(adminActionsResult).toEqual([actionAmendLegacyBooking])
        })
      })

      describe('if the placement request has a space booking', () => {
        it.each([
          ['upcoming', cas1SpaceBookingSummaryFactory.upcoming().build()],
          ['arrived', cas1SpaceBookingSummaryFactory.current().build()],
        ])('should return an action to change the placement if it is %s', (_, spaceBooking) => {
          const placementRequestDetail = placementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

          const { adminActionsResult, actionChangePlacement } = setup({
            placementRequestDetail,
            permissions: [],
          })
          expect(adminActionsResult).toEqual([actionChangePlacement])
        })

        it.each([
          ['not arrived', cas1SpaceBookingSummaryFactory.nonArrival().build()],
          ['departed', cas1SpaceBookingSummaryFactory.departed().build()],
        ])('should return no change placement action if the placement is %s', (_, spaceBooking) => {
          const placementRequestDetail = placementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

          const { adminActionsResult, actionChangePlacement } = setup({
            placementRequestDetail,
            permissions: [],
          })
          expect(adminActionsResult).not.toContainAction(actionChangePlacement)
        })
      })

      it('should return an action to withdraw the placement if the user has the withdraw permission', () => {
        const placementRequestDetail = placementRequestDetailFactory.build()

        const { adminActionsResult, actionWithdrawPlacement } = setup({
          placementRequestDetail,
          permissions: ['cas1_booking_withdraw'],
        })

        expect(adminActionsResult).toContainAction(actionWithdrawPlacement)
      })
    })

    describe('if the status of the placement request is `not matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({
        status: 'notMatched',
      })

      it('should return an action to withdraw the placement request if the user has the withdraw permission', () => {
        const { adminActionsResult, actionWithdrawPlacementRequest } = setup({
          placementRequestDetail,
          permissions: ['cas1_booking_withdraw'],
        })

        expect(adminActionsResult).toContainAction(actionWithdrawPlacementRequest)
      })

      describe('if ENABLE_V2_MATCH is false', () => {
        it('returns the "Create placement" action', () => {
          const { adminActionsResult, actionCreatePlacement } = setup({
            placementRequestDetail,
            permissions: ['cas1_booking_create', 'cas1_space_booking_create'],
          })
          expect(adminActionsResult).toContainAction(actionCreatePlacement)
        })

        it('does not return the "Create placement" action when user does not have cas1 booking create permission', () => {
          const { adminActionsResult, actionCreatePlacement } = setup({
            placementRequestDetail,
            permissions: ['cas1_space_booking_create'],
          })
          expect(adminActionsResult).not.toContainAction(actionCreatePlacement)
        })
      })

      describe('if ENABLE_V2_MATCH is true', () => {
        const originalFlagValue = config.flags.v2MatchEnabled
        beforeEach(() => {
          config.flags.v2MatchEnabled = 'true'
        })
        afterEach(() => {
          config.flags.v2MatchEnabled = originalFlagValue
        })

        it('returns the "Search for a space" action', () => {
          const { adminActionsResult, actionSearchForASpace } = setup({
            placementRequestDetail,
            permissions: ['cas1_space_booking_create'],
          })

          expect(adminActionsResult).toContainAction(actionSearchForASpace)
        })

        it('does not return the "Search for a space" action when user does not have cas1 space booking create permission', () => {
          const { adminActionsResult, actionSearchForASpace } = setup({
            placementRequestDetail,
            permissions: ['cas1_booking_create'],
          })

          expect(adminActionsResult).not.toContainAction(actionSearchForASpace)
        })
      })
    })
  })

  describe('title', () => {
    it('should return HTML for the title', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ person: personFactory.build() })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <h1 class="govuk-heading-l">Placement request</h1>
      `)
    })

    it('should return a withdrawn tag if the request for placement has been withdrawn', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({
        isWithdrawn: true,
        person: fullPersonFactory.build(),
      })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
<h1 class="govuk-heading-l">
Placement request
<strong class="govuk-tag govuk-tag--red govuk-!-margin-5">Request for placement withdrawn</strong>
</h1>
      `)
    })
  })

  describe('adminIdentityBar', () => {
    it('should return the admin identity bar', () => {
      const placementRequestDetail = placementRequestDetailFactory.build()
      const userId = 'some-id'
      const user = { roles: ['appeals_manager' as const], id: userId }

      expect(adminIdentityBar(placementRequestDetail, fromPartial(user))).toEqual({
        title: {
          html: title(placementRequestDetail),
        },
        menus: [{ items: adminActions(placementRequestDetail, fromPartial(user)) }],
      })
    })

    it('should return the bar without a menu if the placement request has been withdrawn', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ isWithdrawn: true })
      const userId = 'some-id'
      const user = { roles: ['appeals_manager' as const], id: userId }

      expect(adminIdentityBar(placementRequestDetail, fromPartial(user))).toEqual({
        title: {
          html: title(placementRequestDetail),
        },
      })
    })
  })
})
