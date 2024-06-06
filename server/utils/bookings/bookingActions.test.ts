import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'
import paths from '../../paths/manage'

describe('bookingUtils bookingActions', () => {
  describe('bookingActions', () => {
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
    })
  })
})
