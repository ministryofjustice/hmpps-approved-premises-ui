import { fromPartial } from '@total-typescript/shoehorn'
import { ApprovedPremisesUserPermission, PlacementRequestDetail } from '@approved-premises/api'
import {
  bookingSummaryFactory,
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
    text: 'Change placement dates',
  }
  const actionWithdrawPlacement = {
    href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
    text: 'Withdraw placement',
  }
  const adminActionsResult = adminActions(placementRequestDetail, fromPartial(user))
  return {
    placementRequestDetail,
    actionCreatePlacement,
    actionSearchForASpace,
    actionAmendLegacyBooking,
    actionChangePlacement,
    actionWithdrawPlacement,
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
      it('should return actions to amend a legacy booking', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({
          status: 'matched',
          booking: bookingSummaryFactory.build({ type: 'legacy' }),
        })

        const { adminActionsResult, actionAmendLegacyBooking } = setup({
          placementRequestDetail,
          permissions: [],
        })
        expect(adminActionsResult).toEqual([actionAmendLegacyBooking])
      })

      it('should return actions to amend a space booking', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({
          status: 'matched',
          booking: bookingSummaryFactory.build({ type: 'space' }),
        })

        const { adminActionsResult, actionChangePlacement } = setup({
          placementRequestDetail,
          permissions: [],
        })
        expect(adminActionsResult).toEqual([actionChangePlacement])
      })

      it('should return actions to amend and withdraw a booking if the status is `matched` and user has the withdraw permission ', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({
          status: 'matched',
        })

        const { adminActionsResult, actionChangePlacement, actionWithdrawPlacement } = setup({
          placementRequestDetail,
          permissions: ['cas1_booking_withdraw'],
        })

        expect(adminActionsResult).toEqual([actionChangePlacement, actionWithdrawPlacement])
      })
    })

    describe('if the status of the placement request is `not matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({
        status: 'notMatched',
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
