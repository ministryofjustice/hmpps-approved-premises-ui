import {
  applicationFactory,
  bookingFactory,
  cancellationFactory,
  extendedPremisesSummaryFactory,
  newCancellationFactory,
  premisesBookingFactory,
  premisesFactory,
  withdrawableFactory,
} from '../../../server/testutils/factories'
import { fullPersonFactory } from '../../../server/testutils/factories/person'

import { BookingShowPage, CancellationCreatePage, PremisesShowPage } from '../../pages/manage'
import NewWithdrawalPage from '../../pages/apply/newWithdrawal'
import { signIn } from '../signIn'
import BookingCancellationConfirmPage from '../../pages/manage/bookingCancellationConfirmation'
import withdrawablesFactory from '../../../server/testutils/factories/withdrawablesFactory'

context('Cancellation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubCancellationReferenceData')

    // Given I am signed in
    signIn(['workflow_manager', 'manager'], ['cas1_booking_withdraw'])
  })

  it('should allow me to create a cancellation through the withdrawal flow for bookings with an applicationId', () => {
    // Given a booking is available
    const application = applicationFactory.build()

    const booking = bookingFactory.arrivingToday().build({ applicationId: application.id })
    const bookings = premisesBookingFactory
      .arrivingToday()
      .buildList(1)
      .map(b => ({ ...b, person: fullPersonFactory.build(), id: booking.id }))
    const premises = extendedPremisesSummaryFactory.build({ bookings, id: booking.premises.id })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's cancellation page
    const cancellation = newCancellationFactory.build()
    const withdrawable = withdrawableFactory.build({ id: booking.id, type: 'booking' })
    cy.task('stubCancellationCreate', { premisesId: premises.id, bookingId: booking.id, cancellation })
    cy.task('stubPremisesSummary', premises)
    const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

    cy.task('stubWithdrawablesWithNotes', { applicationId: application.id, withdrawables })
    cy.task('stubBookingFindWithoutPremises', booking)

    const premisesShowPage = PremisesShowPage.visit(premises)
    premisesShowPage.clickManageBooking(booking)

    const bookingPage = new BookingShowPage()
    bookingPage.clickWithdrawPlacement()

    const withdrawalTypePage = new NewWithdrawalPage('What do you want to withdraw?')
    withdrawalTypePage.selectType('placement')
    withdrawalTypePage.clickSubmit()

    const withdrawablePage = new NewWithdrawalPage('Select your placement')
    withdrawablePage.shouldShowWithdrawableGuidance('placement')
    withdrawablePage.selectWithdrawable(booking.id)
    withdrawablePage.clickSubmit()

    // And I fill out the cancellation form
    const cancellationPage = new CancellationCreatePage(premises.id, booking.id)
    cancellationPage.completeForm(cancellation)

    // Then a cancellation should have been created in the API
    cy.task('verifyCancellationCreate', {
      premisesId: premises.id,
      bookingId: bookings[0].id,
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
})
