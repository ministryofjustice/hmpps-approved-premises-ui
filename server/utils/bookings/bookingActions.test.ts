import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingActions', () => {
  describe('when the user does not have any relevant permissions', () => {
    const user = userDetailsFactory.build({ permissions: [] })

    it.each([
      ['awaiting arrival', bookingFactory.arrivingToday()],
      ['arrived', bookingFactory.arrived()],
      ['cancelled', bookingFactory.cancelledWithFutureArrivalDate()],
      ['departed', bookingFactory.departedToday()],
      ['not arrived', bookingFactory.notArrived()],
    ])('should return nothing if the booking is %s', (_, factory) => {
      const booking = factory.build()

      expect(bookingActions(user, booking)).toEqual(null)
    })
  })

  describe('when the user has the permission to change the booking dates', () => {
    const user = userDetailsFactory.build({ permissions: ['cas1_booking_change_dates'] })

    it('should return an action to change the placement dates if the booking is awaiting arrival', () => {
      const booking = bookingFactory.arrivingToday().build()

      expect(bookingActions(user, booking)).toEqual([
        {
          items: [
            {
              text: 'Change placement dates',
              classes: 'govuk-button--secondary',
              href: paths.bookings.dateChanges.new({ premisesId: booking.premises.id, bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it('should return an action to update the departure date if the booking is arrived', () => {
      const booking = bookingFactory.arrived().build()

      expect(bookingActions(user, booking)).toEqual([
        {
          items: [
            {
              text: 'Update departure date',
              classes: 'govuk-button--secondary',
              href: paths.bookings.extensions.new({ premisesId: booking.premises.id, bookingId: booking.id }),
            },
          ],
        },
      ])
    })

    it.each([
      ['cancelled', bookingFactory.cancelledWithFutureArrivalDate()],
      ['departed', bookingFactory.departedToday()],
      ['not arrived', bookingFactory.notArrived()],
    ])('should return nothing if the booking is %s', (_, factory) => {
      const booking = factory.build()

      expect(bookingActions(user, booking)).toEqual(null)
    })
  })

  describe('when the user has the permission to withdraw the booking', () => {
    const user = userDetailsFactory.build({
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

    it.each([
      ['awaiting arrival', bookingFactory.arrivingToday()],
      ['arrived', bookingFactory.arrived()],
    ])('should return an action to withdraw if the booking is %s', (_, factory) => {
      const booking = factory.build()

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Withdraw placement',
        classes: 'govuk-button--secondary',
        href: applyPaths.applications.withdraw.new({ id: booking.applicationId }),
      })
    })

    it.each([
      ['awaiting arrival', bookingFactory.arrivingToday()],
      ['arrived', bookingFactory.arrived()],
    ])('should return an action to cancel if the booking is %s with no linked application', (_, factory) => {
      const booking = factory.build({ applicationId: undefined })

      expect(bookingActions(user, booking)).toContainMenuItem({
        text: 'Withdraw placement',
        classes: 'govuk-button--secondary',
        href: paths.bookings.cancellations.new({ premisesId: booking.premises.id, bookingId: booking.id }),
      })
    })
  })

  describe('when the user has all permissions', () => {
    const user = userDetailsFactory.build({
      permissions: ['cas1_booking_withdraw', 'cas1_booking_change_dates'],
    })

    it.each([
      [2, 'awaiting arrival', bookingFactory.arrivingToday()],
      [2, 'arrived', bookingFactory.arrived()],
      [0, 'cancelled', bookingFactory.cancelledWithFutureArrivalDate()],
      [0, 'departed', bookingFactory.departedToday()],
      [0, 'not arrived', bookingFactory.notArrived()],
    ])('should return %s actions if the booking is %s', (count, _, factory) => {
      const booking = factory.build()

      const result = bookingActions(user, booking)

      if (count === 0) {
        expect(result).toEqual(null)
      } else {
        expect(result[0].items.length).toEqual(count)
      }
    })
  })
})
