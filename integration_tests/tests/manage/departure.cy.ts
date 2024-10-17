import {
  bookingFactory,
  departureFactory,
  premisesFactory,
  referenceDataFactory,
} from '../../../server/testutils/factories'

import { BookingShowPage, DepartureCreatePage } from '../../pages/manage'
import Page from '../../pages/page'
import { signIn } from '../signIn'

context('Departures', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubDepartureReferenceData')

    // Given I am signed in
    signIn(['workflow_manager'])
  })

  it('creates a departure', () => {
    // Given I have a booking for a premises
    const premises = premisesFactory.buildList(5)
    const booking = bookingFactory.withFullPerson().build()

    const departureReason = referenceDataFactory.departureReasons().build()
    const moveOnCategory = referenceDataFactory.moveOnCategories().build()

    const departure = departureFactory.build({
      dateTime: new Date(2022, 1, 11, 12, 35).toISOString(),
      reason: departureReason,
      moveOnCategory,
    })

    cy.task('stubCas1AllPremises', premises)
    cy.task('stubBookingGet', { premisesId: premises[0].id, booking })
    cy.task('stubDepartureCreate', { premisesId: premises[0].id, bookingId: booking.id, departure })

    // When I mark the booking as having departed
    const page = DepartureCreatePage.visit(premises[0].id, booking.id)
    page.verifySummary(booking)
    page.completeForm(departure)

    // Then an departure should be created in the API
    cy.task('verifyDepartureCreate', { premisesId: premises[0].id, bookingId: booking.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.dateTime).equal(departure.dateTime)
      expect(requestBody.reasonId).equal(departure.reason.id)
      expect(requestBody.destinationProviderId).equal(departure.destinationProvider.id)
      expect(requestBody.moveOnCategoryId).equal(departure.moveOnCategory.id)
      expect(requestBody.notes).equal(departure.notes)
    })

    // And I should see a confirmation message
    const bookingPage = Page.verifyOnPage(BookingShowPage, [premises[0].id, booking])
    bookingPage.shouldShowBanner('Departure recorded')
  })

  it('should show errors', () => {
    // Given I have a booking for a premises
    const premises = premisesFactory.buildList(5)
    const booking = bookingFactory.build()

    cy.task('stubCas1AllPremises', premises)
    cy.task('stubBookingGet', { premisesId: premises[0].id, booking })

    // When I visit the departure page
    const page = DepartureCreatePage.visit(premises[0].id, booking.id)

    // And I miss a required field
    cy.task('stubDepartureErrors', {
      premisesId: premises[0].id,
      bookingId: booking.id,
      params: ['destinationProviderId', 'moveOnCategoryId', 'reasonId'],
    })

    page.clickSubmit()

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['reasonId', 'moveOnCategoryId', 'destinationProviderId'])
  })
})
