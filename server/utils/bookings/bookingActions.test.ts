import { bookingActions } from './bookingActions'
import { bookingFactory, userDetailsFactory } from '../../testutils/factories'
import applyPaths from '../../paths/apply'

describe('bookingUtils bookingActions', () => {
  describe('bookingActions', () => {
    describe('when the user has the "workflow_manager" role', () => {
      it('includes the WITHDRAW action', () => {
        const user = userDetailsFactory.build({
          roles: ['workflow_manager'],
        })
        const booking = bookingFactory.build()

        expect(bookingActions(user, booking)).toContainMenuItem({
          text: 'Withdraw placement',
          classes: 'govuk-button--secondary',
          href: applyPaths.applications.withdraw.new({ id: booking?.applicationId }),
        })
      })
    })
  })
})
