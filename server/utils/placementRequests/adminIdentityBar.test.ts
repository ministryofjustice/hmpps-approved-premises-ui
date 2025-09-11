import { fromPartial } from '@total-typescript/shoehorn'
import { ApprovedPremisesUserPermission, Cas1PlacementRequestDetail } from '@approved-premises/api'
import {
  cas1SpaceBookingSummaryFactory,
  personFactory,
  cas1PlacementRequestDetailFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'
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

  const actionChangePlacement = placementRequestDetail.booking
    ? {
        href: managePaths.premises.placements.changes.new({
          premisesId: placementRequestDetail.booking.premisesId,
          placementId: placementRequestDetail.booking.id,
        }),
        text: 'Change placement',
      }
    : undefined

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
      it.each([
        ['upcoming', cas1SpaceBookingSummaryFactory.upcoming().build()],
        ['arrived', cas1SpaceBookingSummaryFactory.current().build()],
      ])('should return an action to change the placement if it is %s', (_, spaceBooking) => {
        const placementRequestDetail = cas1PlacementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

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
        const placementRequestDetail = cas1PlacementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

        const { adminActionsResult, actionChangePlacement } = setup({
          placementRequestDetail,
          permissions: [],
        })
        expect(adminActionsResult).not.toContainAction(actionChangePlacement)
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
