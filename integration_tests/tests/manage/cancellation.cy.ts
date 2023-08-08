import { bookingFactory, cancellationFactory, premisesFactory } from '../../../server/testutils/factories'

import { BookingShowPage, CancellationCreatePage } from '../../pages/manage'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('Cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCancellationReferenceData')

    // Given I am signed in
    signIn(['workflow_manager'])
  })

  it('should allow me to create a cancellation', () => {
    // Given a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = cancellationFactory.build({ date: '2022-06-01' })
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })

    const page = CancellationCreatePage.visit(premises.id, booking.id)

    // And I fill out the cancellation form
    page.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: premises.id,
      bookingId: booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.date).equal(cancellation.date)
      expect(requestBody.notes).equal(cancellation.notes)
      expect(requestBody.reason).equal(cancellation.reason.id)
    })

    // And I should see a confirmation message
    const bookingPage = Page.verifyOnPage(BookingShowPage, [premises.id, booking])
    bookingPage.shouldShowBanner('Booking cancelled')
  })

  it('should show errors', () => {
    // Given a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = cancellationFactory.build({ date: new Date(Date.UTC(2022, 5, 1, 0, 0, 0)).toISOString() })
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })

    const page = CancellationCreatePage.visit(premises.id, booking.id)

    // And I miss a required field
    cy.task('stubCancellationErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['date', 'reason'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['date', 'reason'])

    // And the back link should be populated correctly
    page.shouldHaveCorrectBacklink()
  })
})
