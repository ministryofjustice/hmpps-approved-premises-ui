import { bookingFactory, bookingPremisesSummaryFactory, personFactory } from '../../../server/testutils/factories'

import { DepartureDateChangeConfirmationPage, DepartureDateChangePage } from '../../pages/manage'
import { signIn } from '../signIn'

context('Departure date', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member
    signIn('cru_member')
  })

  it('should show a form to change a bookings departure date', () => {
    const booking = bookingFactory.build({
      departureDate: '2022-06-03',
      person: personFactory.build(),
      premises: bookingPremisesSummaryFactory.build(),
    })
    const newDepartureDate = '2022-07-03'

    cy.task('stubBookingExtensionCreate', { premisesId: booking.premises.id, booking })
    cy.task('stubBookingGet', { premisesId: booking.premises.id, booking })

    // When I visit the booking extension page
    const page = DepartureDateChangePage.visit(booking.premises.id, booking.id)

    // And I fill in the extension form
    page.completeForm(newDepartureDate)
    page.clickSubmit()

    // Then I should be redirected to the confirmation page
    const bookingConfirmationPage = new DepartureDateChangeConfirmationPage()

    bookingConfirmationPage.verifyBookingIsVisible(booking)

    // And the extension should be created in the API
    cy.task('verifyBookingExtensionCreate', {
      premisesId: booking.premises.id,
      bookingId: booking.id,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newDepartureDate).equal(newDepartureDate)
    })
  })

  it('should show errors', () => {
    const booking = bookingFactory.build({
      departureDate: new Date(Date.UTC(2022, 5, 3, 0, 0, 0)).toISOString(),
      premises: bookingPremisesSummaryFactory.build(),
    })

    cy.task('stubBookingGet', {
      premisesId: booking.premises.id,
      booking: { ...booking, person: personFactory.build() },
    })

    // When I visit the booking extension page
    const page = DepartureDateChangePage.visit(booking.premises.id, booking.id)

    // And I don't enter details into the field
    cy.task('stubBookingExtensionErrors', {
      premisesId: booking.premises.id,
      bookingId: booking.id,
      params: ['newDepartureDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to the field
    page.shouldShowErrorMessagesForFields(['newDepartureDate'])
  })
})
