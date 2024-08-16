import { fromPartial } from '@total-typescript/shoehorn'
import {
  personFactory,
  placementRequestDetailFactory,
  restrictedPersonFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'
import matchPaths from '../../paths/match'
import adminPaths from '../../paths/admin'
import applyPaths from '../../paths/apply'
import { nameOrPlaceholderCopy } from '../personUtils'
import { fullPersonFactory } from '../../testutils/factories/person'
import config from '../../config'

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

    it('should return actions to amend a booking if the status is `matched`', () => {
      const userId = 'some-id'
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'matched' })
      const user = userDetailsFactory.build({ roles: ['appeals_manager'], id: userId })

      expect(adminActions(placementRequestDetail, fromPartial(user))).toEqual([
        {
          href: managePaths.bookings.dateChanges.new({
            premisesId: placementRequestDetail.booking?.premisesId || '',
            bookingId: placementRequestDetail.booking?.id || '',
          }),
          text: 'Amend placement',
        },
      ])
    })

    it('should return actions to amend and withdraw a booking if the status is `matched` and user has the withdraw permission ', () => {
      const userId = 'some-id'
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'matched' })
      const user = { roles: ['appeals_manager' as const], permissions: ['cas1_booking_withdraw' as const], id: userId }

      expect(adminActions(placementRequestDetail, fromPartial(user))).toEqual([
        {
          href: managePaths.bookings.dateChanges.new({
            premisesId: placementRequestDetail.booking?.premisesId || '',
            bookingId: placementRequestDetail.booking?.id || '',
          }),
          text: 'Amend placement',
        },
        {
          href: applyPaths.applications.withdraw.new({ id: placementRequestDetail.applicationId }),
          text: 'Withdraw placement',
        },
      ])
    })

    describe('if ENABLE_V2_MATCH is false', () => {
      it('returns the "Create placement" action', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })
        const userId = 'some-id'
        const user = { roles: ['appeals_manager' as const], permissions: ['cas1_booking_create' as const], id: userId }

        expect(adminActions(placementRequestDetail, fromPartial(user))).toContainAction({
          href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequestDetail.id }),
          text: 'Create placement',
        })
      })

      it('does not return the "Create placement" action when user does not have cas1 booking create permission', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })
        const userId = 'some-id'
        const user = { roles: ['appeals_manager' as const], id: userId }

        expect(adminActions(placementRequestDetail, fromPartial(user))).not.toContainAction({
          href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequestDetail.id }),
          text: 'Create placement',
        })
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
        const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })
        const userId = 'some-id'
        const user = { roles: ['appeals_manager' as const], permissions: ['cas1_booking_create' as const], id: userId }

        expect(adminActions(placementRequestDetail, fromPartial(user))).toContainAction({
          href: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequestDetail.id }),
          text: 'Search for a space',
        })
      })

      it('does not return the "Search for a space" action when user does not have cas1 booking create permission', () => {
        const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })
        const userId = 'some-id'
        const user = {
          roles: ['appeals_manager' as const],
          permissions: ['cas1_booking_withdraw' as const],
          id: userId,
        }

        expect(adminActions(placementRequestDetail, fromPartial(user))).not.toContainAction({
          href: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequestDetail.id }),
          text: 'Search for a space',
        })
      })
    })
  })

  describe('title', () => {
    it('should return HTML for the title', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ person: personFactory.build() })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">${nameOrPlaceholderCopy(placementRequestDetail.person)}</h1>
      `)
    })

    it('should return Not Found if the person is unknown person', () => {
      const placementRequestDetailWithRestrictedAccessOffender = placementRequestDetailFactory.build()
      placementRequestDetailWithRestrictedAccessOffender.person = restrictedPersonFactory.build({
        type: 'UnknownPerson',
      })

      expect(title(placementRequestDetailWithRestrictedAccessOffender)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">Not Found CRN: ${placementRequestDetailWithRestrictedAccessOffender.person.crn}</h1>
      `)
    })

    it('should return Limited Access Offender if the person has no name', () => {
      const placementRequestDetailWithRestrictedAccessOffender = placementRequestDetailFactory.build()
      const person = personFactory.build({ isRestricted: true })
      placementRequestDetailWithRestrictedAccessOffender.person = person

      expect(title(placementRequestDetailWithRestrictedAccessOffender)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l"> ${person.name}</h1>
      `)
    })

    it('should return a withdrawn tag if the request for placement has been withdrawn', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({
        isWithdrawn: true,
        person: fullPersonFactory.build(),
      })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
<span class="govuk-caption-l">Placement request</span>
<h1 class="govuk-heading-l">
${nameOrPlaceholderCopy(placementRequestDetail.person)}
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
