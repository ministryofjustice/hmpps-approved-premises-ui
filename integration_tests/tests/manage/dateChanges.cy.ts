import { BookingShowPage, NewDateChangePage } from '../../pages/manage'
import Page from '../../pages/page'
import { bookingFactory, premisesFactory } from '../../../server/testutils/factories'
import { signIn } from '../signIn'

context('Date Changes', () => {
  const premises = premisesFactory.build()
  const booking = bookingFactory.build()

  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as a CRU member
    signIn({ permissions: ['cas1_booking_change_dates'] })

    // And I have a booking for a premises
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
  })

  it('shows an error if neither date is selected', () => {
    // And I visit the date change page
    const dateChangePage = NewDateChangePage.visit(premises.id, booking.id)

    // And I click submit without selecting any dates
    dateChangePage.clickSubmit()

    // Then I should see an error message
    dateChangePage.shouldShowErrorMessagesForFields(['datesToChange'], {
      datesToChange: 'You must select a date to change',
    })
  })

  it('changes a date', () => {
    cy.task('stubDateChange', { premisesId: premises.id, bookingId: booking.id })

    // And I visit the date change page
    const dateChangePage = NewDateChangePage.visit(premises.id, booking.id)

    // And I change the date of my booking
    dateChangePage.completeForm('2023-01-01', '2023-03-02')
    dateChangePage.clickSubmit()

    // Then I should see a confirmation message
    const bookingPage = Page.verifyOnPage(BookingShowPage, [premises.id, booking])
    bookingPage.shouldShowBanner('Booking changed successfully')

    // And the change booking endpoint should have been called with the correct parameters
    cy.task('verifyDateChange', {
      premisesId: premises.id,
      bookingId: booking.id,
    }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.newArrivalDate).equal('2023-01-01')
      expect(requestBody.newDepartureDate).equal('2023-03-02')
    })
  })

  it('show arrival errors when the user chooses to change a date, but does not enter dates', () => {
    cy.task('stubDateChangeErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['newArrivalDate', 'newDepartureDate'],
    })

    // And I visit the date change page
    const dateChangePage = NewDateChangePage.visit(premises.id, booking.id)

    // And I check the date change checkboxes, but don't add dates
    dateChangePage.checkDatesToChangeOption('newArrivalDate')
    dateChangePage.checkDatesToChangeOption('newDepartureDate')

    // And I click submit
    dateChangePage.clickSubmit()

    // Then I should see errors
    dateChangePage.shouldShowErrorMessagesForFields(['newArrivalDate', 'newDepartureDate'])
  })

  it('show arrival errors when the API returns an error', () => {
    cy.task('stubDateChangeErrors', {
      premisesId: premises.id,
      bookingId: booking.id,
      params: ['newArrivalDate', 'newDepartureDate'],
    })

    // And I visit the date change page
    const dateChangePage = NewDateChangePage.visit(premises.id, booking.id)

    // And I click submit
    dateChangePage.checkDatesToChangeOption('newArrivalDate')
    dateChangePage.checkDatesToChangeOption('newDepartureDate')
    dateChangePage.clickSubmit()

    // Then I should see errors
    dateChangePage.shouldShowErrorMessagesForFields(['newArrivalDate', 'newDepartureDate'])

    // And the back link should be populated correctly
    dateChangePage.shouldHaveCorrectBacklink()
  })
})
