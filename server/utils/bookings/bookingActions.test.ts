import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingUtils bookingActions', () => {
  describe('behaviour not linked to roles', () => {
    const user = userDetailsFactory.build({
      roles: ['workflow_manager'],
      permissions: ['cas1_booking_withdraw'],
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
        text: 'Withdraw placement',
        classes: 'govuk-button--secondary',
        href: applyPaths.applications.withdraw.new({ id: booking.applicationId }),
      })
    })

    it('should return link to the cancellations new page if the booking doesnt have an applicationId', () => {
      const booking = bookingFactory.arrived().build({
        applicationId: undefined,
      })

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Withdraw placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })
    })
  })
})
