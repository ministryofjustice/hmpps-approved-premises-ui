import {
  applicationFactory,
  bookingFactory,
  cancellationFactory,
  cas1SpaceBookingFactory,
  extendedPremisesSummaryFactory,
  newCancellationFactory,
  premisesFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'

import { CancellationCreatePage } from '../../pages/manage'
import { signIn } from '../signIn'
import BookingCancellationConfirmPage from '../../pages/manage/bookingCancellationConfirmation'

context('Cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCancellationReferenceData')

    // Given I am signed in
    signIn(['workflow_manager'], ['cas1_booking_withdraw', 'cas1_space_booking_withdraw'])
  })

  it('should allow me to create a cancellation with a reason of "other" ', () => {
    // Given a booking is available
    const application = applicationFactory.build()
    const booking = bookingFactory.arrivingToday().build({ applicationId: application.id })
    const premises = extendedPremisesSummaryFactory.build({ bookings: [booking], id: booking.premises.id })

    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = newCancellationFactory.withOtherReason().build({
      otherReason: 'other reason',
    })
    const withdrawable = withdrawableFactory.build({ id: booking.id, type: 'booking' })
    cy.task('stubPremisesSummary', premises)
    cy.task('stubWithdrawablesWithNotes', { applicationId: application.id, withdrawables: [withdrawable] })
    cy.task('stubBookingFindWithoutPremises', booking)

    // And I fill out the cancellation form with a reason of "other" but without a note
    cy.task('stubCancellationErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['otherReason'],
    })

    const cancellationPage = CancellationCreatePage.visit(premises.id, booking.id)
    cancellationPage.completeForm({ ...cancellation, otherReason: '' })

    // Then I should see an error message
    cancellationPage.shouldShowErrorMessagesForFields(['otherReason'], {
      otherReason: 'You must enter the other reason',
    })

    // Given I retry completing the form
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })
    // When I complete the reason and notes
    cancellationPage.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: premises.id,
      bookingId: booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(2)
      const requestBody = JSON.parse(requests[1].body)

      expect(requestBody.reason).equal(cancellation.reason)
      expect(requestBody.otherReason).equal(cancellation.otherReason)
    })

    // And I should see a confirmation message
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()
  })

  it('should allow me to create a cancellation for a booking without an applicationId', () => {
    // Given a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build({ applicationId: undefined })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = newCancellationFactory.build()
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })

    const page = CancellationCreatePage.visit(premises.id, booking.id)

    // Then the backlink should be populated correctly
    page.shouldShowBacklinkToBooking()

    // When I fill out the cancellation form
    page.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: premises.id,
      bookingId: booking.id,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.reason).equal(cancellation.reason)
    })

    // And I should see a confirmation message
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()
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
      params: ['reason'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['reason'])

    // And the back link should be populated correctly
    page.shouldShowBackLinkToApplicationWithdraw(booking.applicationId)
  })

  it('should allow me to create a cancellation for a space booking ', () => {
    // Given a booking is available
    const application = applicationFactory.build()
    const placement = cas1SpaceBookingFactory.upcoming().build({ applicationId: application.id })
    const premises = extendedPremisesSummaryFactory.build({ bookings: [placement], id: placement.premises.id })

    const placementId = placement.id

    cy.task('stubSpaceBookingShow', placement)

    const cancellation = newCancellationFactory.withOtherReason().build({
      otherReason: 'other reason',
    })
    const withdrawable = withdrawableFactory.build({ id: placement.id, type: 'space_booking' })
    cy.task('stubPremisesSummary', premises)
    cy.task('stubWithdrawablesWithNotes', { applicationId: application.id, withdrawables: [withdrawable] })
    cy.task('stubSpaceBookingGetWithoutPremises', placement)
    cy.task('stubCancellationCreate', { premisesId: premises.id, placementId, cancellation })

    // When I navigate to the booking's cancellation page
    const cancellationPage = CancellationCreatePage.visitWithSpaceBooking(premises.id, placement.id)

    // And I complete the reason and notes
    cancellationPage.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifySpaceBookingCancellationCreate', {
      premisesId: premises.id,
      placementId,
      cancellation,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)
      expect(requestBody.reasonId).equal(cancellation.reason)
      expect(requestBody.reasonNotes).equal(cancellation.otherReason)
    })

    // And I should see a confirmation message
    const confirmationPage = new BookingCancellationConfirmPage()
    confirmationPage.shouldShowPanel()
  })
})
