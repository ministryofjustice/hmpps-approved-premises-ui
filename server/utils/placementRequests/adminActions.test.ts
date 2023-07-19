import { placementRequestDetailFactory } from '../../testutils/factories'
import { adminActions } from './adminActions'

import managePaths from '../../paths/manage'

describe('adminActions', () => {
  it('should return actions to amend a booking if there is a booking', () => {
    const placementRequestDetail = placementRequestDetailFactory.build()

    expect(adminActions(placementRequestDetail)).toEqual([
      {
        items: [
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
        ],
      },
    ])
  })

  it('should return actions to create a booking if there is a booking', () => {
    const placementRequestDetail = placementRequestDetailFactory.build({ booking: undefined })

    expect(adminActions(placementRequestDetail)).toEqual([
      {
        items: [
          {
            href: '#',
            text: 'Create placement',
          },
        ],
      },
    ])
  })
})
