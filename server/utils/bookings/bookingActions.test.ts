import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingUtils bookingActions', () => {
  describe('behaviour not linked to roles', () => {
    const user = userDetailsFactory.build({
      roles: ['workflow_manager', 'manager', 'legacy_manager'],
    })

    it('should return null when the booking is cancelled, departed or did not arrive', () => {
      const cancelledBooking = bookingFactory.cancelledWithFutureArrivalDate().build()
      const departedBooking = bookingFactory.departedToday().build()
      const nonArrivedBooking = bookingFactory.notArrived().build()

      expect(bookingActions(user, cancelledBooking)).toEqual(null)
      expect(bookingActions(user, departedBooking)).toEqual(null)
      expect(bookingActions(user, nonArrivedBooking)).toEqual(null)
    })
  })
})
