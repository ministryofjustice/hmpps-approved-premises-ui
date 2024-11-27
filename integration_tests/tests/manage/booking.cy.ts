import {
  applicationFactory,
  assessmentFactory,
  bookingFactory,
  cancellationFactory,
  cancellationReasonFactory,
  extendedPremisesSummaryFactory,
  personFactory,
} from '../../../server/testutils/factories'

import { BookingShowPage } from '../../pages/manage'

import { signIn } from '../signIn'

context('Booking', () => {
  const person = personFactory.build()
  const premises = extendedPremisesSummaryFactory.build()
  const application = applicationFactory.build({
    status: 'submitted',
  })
  const assessment = assessmentFactory.build({
    status: 'completed',
  })
  const cancellationReason = cancellationReasonFactory.build({ name: 'Other' })
  const cancellation = cancellationFactory.build({ reason: cancellationReason, otherReason: 'otherReason' })
  const booking = bookingFactory.build({
    person,
    arrivalDate: '2022-06-01',
    departureDate: '2022-06-01',
    applicationId: application.id,
    assessmentId: assessment.id,
    cancellations: [cancellation],
  })

  it('should allow me to see a booking', () => {
    // Given I am signed in as a user with no specific role
    signIn([])

    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldShowBookingDetails(booking)
  })
})
