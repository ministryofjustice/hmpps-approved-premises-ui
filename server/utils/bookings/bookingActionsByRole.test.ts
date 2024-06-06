import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingUtils bookingActions by role', () => {
  describe('bookingActionsByRole', () => {
    describe('when the user has the "workflow_manager" role', () => {
      const user = userDetailsFactory.build({
        roles: ['workflow_manager'],
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

    describe('when the user has the "manager" role', () => {
      const user = userDetailsFactory.build({
        roles: ['manager'],
      })
      const booking = bookingFactory.build()

      it('does NOT include the WITHDRAW action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
          text: 'Withdraw placement',
          classes: 'govuk-button--secondary',
          href: applyPaths.applications.withdraw.new({ id: booking?.applicationId }),
        })
      })

      it('includes the ARRIVED action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Mark as arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.arrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('includes the NOT_ARRIVED action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Mark as not arrived',
          classes: 'govuk-button--secondary',
          href: paths.bookings.nonArrivals.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('includes the MOVE PERSON action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Move person to a new bed',
          classes: 'govuk-button--secondary',
          href: paths.bookings.moves.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('includes the CHANGE DATES action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Change placement dates',
          classes: 'govuk-button--secondary',
          href: paths.bookings.dateChanges.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      describe('when the booking has arrived', () => {
        const arrivedBooking = bookingFactory.arrived().build({
          applicationId: undefined,
        })
        it('includes the DEPARTED action', () => {
          expect(bookingActions(user, arrivedBooking)).toContainMenuItem({
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

    describe('when the user has the "legacy_manager" role', () => {
      const user = userDetailsFactory.build({
        roles: ['legacy_manager'],
      })
      const booking = bookingFactory.build()

      it('does NOT include the WITHDRAW action', () => {
        expect(bookingActions(user, booking)).not.toContainMenuItem({
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

      it('includes the MOVE PERSON action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Move person to a new bed',
          classes: 'govuk-button--secondary',
          href: paths.bookings.moves.new({ premisesId: booking.premises.id, bookingId: booking.id }),
        })
      })

      it('includes the CHANGE DATES action', () => {
        expect(bookingActions(user, booking)).toContainMenuItem({
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
  })
})
