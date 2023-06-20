import {
  bookingFactory,
  dateCapacityFactory,
  lostBedFactory,
  personFactory,
  premisesFactory,
} from '../../../server/testutils/factories'

import { BookingFindPage, BookingNewPage, BookingShowPage } from '../../pages/manage'
import Page from '../../pages/page'

import BookingConfirmation from '../../pages/manage/booking/confirmation'
import { bedFactory } from '../../../server/testutils/factories/room'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should show the CRN form followed by the booking form', () => {
    const person = personFactory.build()
    const booking = bookingFactory.build({
      person,
      arrivalDate: '2022-06-01',
      departureDate: '2022-06-01',
    })
    const firstOvercapacityPeriodStartDate = dateCapacityFactory.build({
      date: new Date(2023, 0, 1).toISOString(),
      availableBeds: -1,
    })
    const firstOvercapacityPeriodEndDate = dateCapacityFactory.build({
      date: new Date(2023, 1, 1).toISOString(),
      availableBeds: -1,
    })
    const atCapacityDate = dateCapacityFactory.build({
      date: new Date(2023, 1, 1).toISOString(),
      availableBeds: 0,
    })
    const secondOvercapacityPeriodStartDate = dateCapacityFactory.build({
      date: new Date(2023, 2, 1).toISOString(),
      availableBeds: -1,
    })
    const secondOvercapacityPeriodEndDate = dateCapacityFactory.build({
      date: new Date(2023, 3, 1).toISOString(),
      availableBeds: -1,
    })
    const premises = premisesFactory.build()

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubSinglePremises', { premisesId: premises.id, booking })
    cy.task('stubPremisesCapacity', {
      premisesId: premises.id,
      dateCapacities: [
        firstOvercapacityPeriodStartDate,
        firstOvercapacityPeriodEndDate,
        atCapacityDate,
        secondOvercapacityPeriodStartDate,
        secondOvercapacityPeriodEndDate,
      ],
    })
    cy.task('stubFindPerson', { person })

    // Given I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id, booking.bed.id)

    // When I enter the CRN to the form
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()

    // Then I should be redirected to the second new booking page
    Page.verifyOnPage(BookingNewPage)
    const bookingCreatePage = new BookingNewPage(premises.id)
    bookingCreatePage.verifyPersonIsVisible(person)

    cy.task('verifyFindPerson', { person }).then(requests => {
      expect(requests).to.have.length(2)
    })

    // Given I have entered a CRN and the person has been found
    // When I fill in the booking form
    bookingCreatePage.completeForm(booking)
    bookingCreatePage.clickSubmit()

    // Then I should be redirected to the confirmation page
    Page.verifyOnPage(BookingConfirmation)
    const bookingConfirmationPage = new BookingConfirmation()
    bookingConfirmationPage.verifyBookingIsVisible(booking)
    // And I should see the overcapacity message
    bookingConfirmationPage.shouldShowOvercapacityMessage(
      { start: firstOvercapacityPeriodStartDate.date, end: firstOvercapacityPeriodEndDate.date },
      { start: secondOvercapacityPeriodStartDate.date, end: secondOvercapacityPeriodEndDate.date },
    )

    // And the booking should be created in the API
    cy.task('verifyBookingCreate', { premisesId: premises.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.arrivalDate).equal(booking.arrivalDate)
      expect(requestBody.departureDate).equal(booking.departureDate)
    })
  })

  it('should show errors for the find page and the new booking page', () => {
    const premises = premisesFactory.build()
    const person = personFactory.build()
    const bedId = bedFactory.build().id
    cy.task('stubSinglePremises', premises)

    // Given I visit the find page
    const page = BookingFindPage.visit(premises.id, bedId)

    // When I miss a required field
    cy.task('stubPersonNotFound', {
      person,
    })
    page.clickSubmit()

    cy.task('stubFindPerson', { premisesId: premises.id, person })

    // Then I should see error messages relating to that field
    page.shouldShowErrorMessagesForFields(['crn'])
    page.completeForm(person.crn)

    // Given I am signed in and I have found someone to create a placement for by CRN
    // When I visit the new booking page
    const bookingCreatePage = new BookingNewPage(premises.id)

    // And I miss the required fields
    cy.task('stubBookingErrors', {
      premisesId: premises.id,
      params: ['arrivalDate', 'departureDate'],
    })
    bookingCreatePage.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['arrivalDate', 'departureDate'])
  })

  it('should show errors when there is a booking conflict', () => {
    const premises = premisesFactory.build()
    const person = personFactory.build()
    const bedId = bedFactory.build().id
    const conflictingLostBed = lostBedFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubFindPerson', { person })
    cy.task('stubBookingCreateConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingLostBed.id,
      conflictingEntityType: 'lost-bed',
    })
    cy.task('stubLostBed', { premisesId: premises.id, lostBed: conflictingLostBed })

    const booking = bookingFactory.build({
      person,
      arrivalDate: '2022-06-01',
      departureDate: '2022-06-01',
    })

    // Given I visit the find page
    const page = BookingFindPage.visit(premises.id, bedId)

    // When I enter the CRN to the form
    page.completeForm(person.crn)

    // And I fill in the booking form
    const bookingNewPage = new BookingNewPage(premises.id)
    bookingNewPage.completeForm(booking)
    bookingNewPage.clickSubmit()

    // Then I should see an error message
    bookingNewPage.shouldShowDateConflictErrorMessages(conflictingLostBed, 'lost-bed')
  })

  it('should allow me to see a booking', () => {
    // Given a booking is available
    const premises = premisesFactory.build()
    const booking = bookingFactory.build()
    cy.task('stubBookingGet', { premisesId: premises.id, booking })

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldShowBookingDetails(booking)
  })
})
