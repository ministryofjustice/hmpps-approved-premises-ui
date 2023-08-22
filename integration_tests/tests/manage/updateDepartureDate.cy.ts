import { bookingFactory, personFactory, premisesFactory } from '../../../server/testutils/factories'

import { DepartureDateChangeConfirmationPage, DepartureDateChangePage } from '../../pages/manage'
import { signIn } from '../signIn'

context('Departure date', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in
    signIn(['workflow_manager'])
  })

  it('should show a form to change a bookings departure date', () => {
    const booking = bookingFactory.build({
      departureDate: '2022-06-03',
      person: personFactory.build(),
    })
    const newDepartureDate = '2022-07-03'
    const premises = premisesFactory.build()

    cy.task('stubBookingExtensionCreate', { premisesId: premises.id, booking })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubSinglePremises', { premisesId: premises.id, booking })

    // When I visit the booking extension page
    const page = DepartureDateChangePage.visit(premises.id, booking.id)

    // And I fill in the extension form
    page.completeForm(newDepartureDate)
    page.clickSubmit()

    // Then I should be redirected to the confirmation page
    const bookingConfirmationPage = new DepartureDateChangeConfirmationPage()

    bookingConfirmationPage.verifyBookingIsVisible(booking)

    // And the extension should be created in the API
    cy.task('verifyBookingExtensionCreate', { premisesId: premises.id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newDepartureDate).equal(newDepartureDate)
    })
  })

  it('should show errors', () => {
    const premises = premisesFactory.build()
    const booking = bookingFactory.build({
      departureDate: new Date(Date.UTC(2022, 5, 3, 0, 0, 0)).toISOString(),
    })

    cy.task('stubSinglePremises', { premisesId: premises.id })
    cy.task('stubBookingGet', { premisesId: premises.id, booking: { ...booking, person: personFactory.build() } })

    // When I visit the booking extension page
    const page = DepartureDateChangePage.visit(premises.id, booking.id)

    // And I don't enter details into the field
    cy.task('stubBookingExtensionErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['newDepartureDate'],
    })
    page.clickSubmit()

    // Then I should see error messages relating to the field
    page.shouldShowErrorMessagesForFields(['newDepartureDate'])
  })
})
