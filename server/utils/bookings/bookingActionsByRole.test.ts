import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingUtils bookingActions by role', () => {
  describe('bookingActionsByRole', () => {
    describe('when the user has the "workflow_manager" role and the "cas1_booking_withdraw" permission', () => {
      const user = userDetailsFactory.build({
        roles: ['workflow_manager'],
        permissions: ['cas1_booking_withdraw'],
      })
      const booking = bookingFactory.build()

      it('includes the WITHDRAW action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Withdraw placement',
          classes: 'govuk-button--secondary',
          href: applyPaths.applications.withdraw.new({ id: booking?.applicationId }),
        })
      })

      it('does NOT include the ARRIVED action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
          text: 'Mark as arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.arrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('does NOT include the NOT_ARRIVED action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
          text: 'Mark as not arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.nonArrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('does NOT include the MOVE PERSON action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
          text: 'Move person to a new bed',
          classes: 'govuk-button--secondary',
          href: paths.bookings.moves.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('does NOT include the CHANGE DATES action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
          text: 'Change placement dates',
          classes: 'govuk-button--secondary',
          href: paths.bookings.dateChanges.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      describe('when the booking has arrived', () => {
        const arrivedBooking = bookingFactory.arrived().build({
          applicationId: undefined,
        })
        it('does NOT include the DEPARTED action', () => {
          expect(bookingActions(user, arrivedBooking)).not.toContainMenuItem({
            text: 'Log departure',
            classes: 'govuk-button--secondary',
            href: paths.bookings.departures.new({
              premisesId: arrivedBooking.premises.id,
              bookingId: arrivedBooking.id,
            }),
          })
        })
      })
    })

    describe('when the user has the "future_manager" role and the "cas1_booking_change_dates" permission', () => {
      const user = userDetailsFactory.build({
        roles: ['future_manager'],
        permissions: ['cas1_booking_change_dates'],
      })

      describe('when booking has NOT arrived', () => {
        const booking = bookingFactory.build()

        it('includes the CHANGE DATES action', () => {
          expect(bookingActions(user, booking)).toContainMenuItem({
            text: 'Change placement dates',
            classes: 'govuk-button--secondary',
            href: paths.bookings.dateChanges.new({ premisesId: booking?.premises.id, bookingId: booking?.id }),
          })
        })
      })
    })

    describe('when the user has the "future_manager" role and the "cas1_booking_withdraw" permission', () => {
      const user = userDetailsFactory.build({
        roles: ['future_manager'],
        permissions: ['cas1_booking_withdraw'],
      })

      describe('when booking has NOT arrived', () => {
        const booking = bookingFactory.build()

        it('includes the WITHDRAW action', () => {
          expect(bookingActions(user, booking)).toContainMenuItem({
            text: 'Withdraw placement',
            classes: 'govuk-button--secondary',
            href: applyPaths.applications.withdraw.new({ id: booking?.applicationId }),
          })
        })

        it('includes only this one action', () => {
          expect(bookingActions(user, booking)[0].items.length).toEqual(1)
        })
      })

      describe('when booking HAS arrived', () => {
        const arrivedBooking = bookingFactory.arrived().build({
          applicationId: undefined,
        })

        it('contains no actions at all', () => {
          expect(bookingActions(user, arrivedBooking)).toEqual([])
        })
      })
    })
  })
})
