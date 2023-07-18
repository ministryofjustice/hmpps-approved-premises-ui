import { placementRequestDetailFactory } from '../../testutils/factories'
import { adminActions, adminIdentityBar, title } from './adminIdentityBar'

import managePaths from '../../paths/manage'

describe('adminIdentityBar', () => {
  describe('adminActions', () => {
    it('should return actions to amend a booking if there is a booking', () => {
      const placementRequestDetail = placementRequestDetailFactory.build()

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

    it('should return actions to create a booking if there is a booking', () => {
      const placementRequestDetail = placementRequestDetailFactory.build({ booking: undefined })

      expect(adminActions(placementRequestDetail)).toEqual([
        {
          href: '#',
          text: 'Create placement',
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
