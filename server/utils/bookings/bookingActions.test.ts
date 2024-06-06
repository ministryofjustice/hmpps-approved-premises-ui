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

    it('should return arrival, non-arrival and cancellation actions if a booking is awaiting arrival', () => {
      const booking = bookingFactory.arrivingToday().build()

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Mark as arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.arrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Mark as not arrived',
        classes: 'govuk-button--secondary',
        href: paths.bookings.nonArrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Withdraw placement',
        classes: 'govuk-button--secondary',
        href: applyPaths.applications.withdraw.new({ id: booking.applicationId }),
      })
    })

    it('should return a departure action if a booking is arrived', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Log departure',
        classes: 'govuk-button--secondary',
        href: paths.bookings.departures.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })
    })
  })
})
