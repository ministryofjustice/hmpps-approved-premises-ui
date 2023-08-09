import { placementRequestDetailFactory } from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'
import adminPaths from '../../paths/admin'

describe('adminIdentityBar', () => {
  describe('adminActions', () => {
    it('should return actions to amend a booking if the status is `matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'matched' })

      expect(adminActions(placementRequestDetail)).toEqual([
        {
          href: managePaths.bookings.dateChanges.new({
            premisesId: placementRequestDetail.booking.premisesId,
            bookingId: placementRequestDetail.booking.id,
          }),
          text: 'Amend placement',
        },
        {
          href: managePaths.bookings.cancellations.new({
            premisesId: placementRequestDetail.booking.premisesId,
            bookingId: placementRequestDetail.booking.id,
          }),
          text: 'Cancel placement',
        },
      ])
    })

    it('should return actions to create a booking and withdraw a placement request if the status is not `matched`', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ status: 'notMatched' })

      expect(adminActions(placementRequestDetail)).toEqual([
        {
          href: adminPaths.admin.placementRequests.bookings.new({ id: placementRequestDetail.id }),
          text: 'Create placement',
        },
        {
          href: adminPaths.admin.placementRequests.withdrawal.new({ id: placementRequestDetail.id }),
          text: 'Withdraw placement request',
        },
      ])
    })
  })

  describe('title', () => {
    it('should return HTML for the title', () => {
      const placementRequestDetail = placementRequestDetailFactory.build()

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">${placementRequestDetail.person.name}</h1>
      `)
    })

    it('should return Limited Access Offender if the person has no name', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ person: { name: undefined } })

      expect(title(placementRequestDetail)).toMatchStringIgnoringWhitespace(`
      <span class="govuk-caption-l">Placement request</span>
      <h1 class="govuk-heading-l">Limited Access Offender</h1>
      `)
    })
  })

  describe('adminIdentityBar', () => {
    it('should return the admin identity bar', () => {
      const placementRequestDetail = placementRequestDetailFactory.build()

      expect(adminIdentityBar(placementRequestDetail)).toEqual({
        title: {
          html: title(placementRequestDetail),
        },
        menus: [{ items: adminActions(placementRequestDetail) }],
      })
    })
  })
})
