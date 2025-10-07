import { fromPartial } from '@total-typescript/shoehorn'
import { ApprovedPremisesUserPermission, Cas1PlacementRequestDetail } from '@approved-premises/api'
import {
  cas1SpaceBookingSummaryFactory,
  personFactory,
  cas1PlacementRequestDetailFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import adminPaths from '../../paths/admin'
import matchPaths from '../../paths/match'
import applyPaths from '../../paths/apply'
import { fullPersonFactory } from '../../testutils/factories/person'

const setup = ({
  placementRequestDetail,
  permissions,
}: {
  placementRequestDetail: Cas1PlacementRequestDetail
  permissions: Array<ApprovedPremisesUserPermission>
}) => {
  const userId = 'some-id'
  const user = userDetailsFactory.build({ roles: ['appeals_manager'], permissions: [...permissions], id: userId })

  const actionSearchForASpace = {
    href: matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: placementRequestDetail.id }),
    text: 'Search for a space',
  }

  const actionChangePlacement = {
    href: adminPaths.admin.placementRequests.selectPlacement({ placementRequestId: placementRequestDetail.id }),
    text: 'Change placement',
  }

  const actionCreateNewPlacement = {
    href: matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId: placementRequestDetail.id }),
    text: 'Create new placement',
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
    actionSearchForASpace,
    actionChangePlacement,
    actionCreateNewPlacement,
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
      const upcomingBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
      const currentBooking = cas1SpaceBookingSummaryFactory.current().build()
      const notArrivedBooking = cas1SpaceBookingSummaryFactory.nonArrival().build()
      const departedBooking = cas1SpaceBookingSummaryFactory.departed().build()

      it.each([
        ['the only placement is upcoming', [upcomingBooking]],
        ['at least one placement is upcoming', [departedBooking, upcomingBooking]],
        ['the only placement is arrived', [currentBooking]],
        ['at least one placement is arrived', [departedBooking, currentBooking]],
      ])('should return an action to change the placement if %s', (_, spaceBookings) => {
        const placementRequestDetail = cas1PlacementRequestDetailFactory.matched().build({
          spaceBookings,
        })

        const { adminActionsResult, actionChangePlacement } = setup({
          placementRequestDetail,
          permissions: [],
        })
        expect(adminActionsResult).toEqual([actionChangePlacement])
      })

      it.each([
        ['no placement is upcoming or arrived', [departedBooking, notArrivedBooking]],
        ['there are no placements', []],
      ])('should return no change placement action if %s', (_, spaceBookings) => {
        const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
          status: spaceBookings.length > 0 ? 'matched' : 'notMatched',
          spaceBookings,
        })

        const { adminActionsResult, actionChangePlacement } = setup({
          placementRequestDetail,
          permissions: [],
        })
        expect(adminActionsResult).not.toContainAction(actionChangePlacement)
      })

      it('should return an action to create a new placement if the user has the create additional space booking permission', () => {
        const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

        const { adminActionsResult, actionCreateNewPlacement } = setup({
          placementRequestDetail,
          permissions: ['cas1_space_booking_create_additional'],
        })

        expect(adminActionsResult).toContainAction(actionCreateNewPlacement)
      })

      it('should return an action to withdraw the placement if the user has the withdraw permission', () => {
        const placementRequestDetail = cas1PlacementRequestDetailFactory.build()

        const { adminActionsResult, actionWithdrawPlacement } = setup({
          placementRequestDetail,
          permissions: ['cas1_booking_withdraw'],
        })

        expect(adminActionsResult).toContainAction(actionWithdrawPlacement)
      })
    })

    describe('if the status of the placement request is `Ready to book`', () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
        status: 'notMatched',
      })

      it('should return an action to withdraw the placement request if the user has the withdraw permission', () => {
        const { adminActionsResult, actionWithdrawPlacementRequest } = setup({
          placementRequestDetail,
          permissions: ['cas1_booking_withdraw'],
        })

        expect(adminActionsResult).toContainAction(actionWithdrawPlacementRequest)
      })

      it('returns the "Search for a space" action', () => {
        const { adminActionsResult, actionSearchForASpace } = setup({
          placementRequestDetail,
          permissions: ['cas1_space_booking_create'],
        })

        expect(adminActionsResult).toContainAction(actionSearchForASpace)
      })
    })
  })

  describe('title', () => {
    it('should return HTML for the title', () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build({ person: personFactory.build() })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <h1 class="govuk-heading-l">Placement request</h1>
      `)
    })

    it('should return a withdrawn tag if the request for placement has been withdrawn', () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
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
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build()
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
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build({ isWithdrawn: true })
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
