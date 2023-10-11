import {
  applicationFactory,
  assessmentFactory,
  bedDetailFactory,
  bedSummaryFactory,
  bookingFactory,
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  lostBedFactory,
  personFactory,
  premisesBookingFactory,
  restrictedPersonFactory,
} from '../../../server/testutils/factories'

import { BookingFindPage, BookingNewPage, BookingShowPage, PremisesShowPage } from '../../pages/manage'
import Page from '../../pages/page'

import BookingConfirmation from '../../pages/manage/booking/confirmation'
import { bedFactory } from '../../../server/testutils/factories/room'
import MoveBedPage from '../../pages/manage/bed/moveBed'
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
  const booking = bookingFactory.build({
    person,
    arrivalDate: '2022-06-01',
    departureDate: '2022-06-01',
    applicationId: application.id,
    assessmentId: assessment.id,
  })

  beforeEach(() => {
    cy.task('reset')
    // Given a booking is available
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubApplicationGet', { application })
    cy.task('stubAssessment', assessment)
    cy.task('stubPremisesSummary', premises)
  })

  it('should shown an error if I search for an LAO', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])
    const lao = restrictedPersonFactory.build()
    cy.task('stubFindPerson', { person: lao })

    // And I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id, 'bedId')

    // When I enter a restricted CRN into the form
    bookingNewPage.enterCrn(lao.crn)
    bookingNewPage.clickSubmit()

    // Then I should be shown an error stating that the person is restricted
    bookingNewPage.shouldShowRestrictedCrnMessage(lao)
  })

  it('should show the CRN form followed by the booking form', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

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

    premises.bookings = [
      premisesBookingFactory.build({
        person,
        arrivalDate: booking.arrivalDate,
        departureDate: booking.departureDate,
      }),
    ]

    premises.dateCapacities = [
      firstOvercapacityPeriodStartDate,
      firstOvercapacityPeriodEndDate,
      atCapacityDate,
      secondOvercapacityPeriodStartDate,
      secondOvercapacityPeriodEndDate,
    ]

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubPremisesSummary', premises)
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

    // And the booking should be created in the API
    cy.task('verifyBookingCreate', { premisesId: premises.id }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.arrivalDate).equal(booking.arrivalDate)
      expect(requestBody.departureDate).equal(booking.departureDate)
    })
  })

  it('should show errors for the find page and the new booking page', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    const bedId = bedFactory.build().id

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
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    const bedId = bedFactory.build().id
    const conflictingLostBed = lostBedFactory.build()

    cy.task('stubPremisesSummary', premises)
    cy.task('stubFindPerson', { person })
    cy.task('stubBookingCreateConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingLostBed.id,
      conflictingEntityType: 'lost-bed',
    })
    cy.task('stubLostBed', { premisesId: premises.id, lostBed: conflictingLostBed })

    const conflictingBooking = bookingFactory.build({
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
    bookingNewPage.completeForm(conflictingBooking)
    bookingNewPage.clickSubmit()

    // Then I should see an error message
    bookingNewPage.shouldShowDateConflictErrorMessages(conflictingLostBed, 'lost-bed')
  })

  it('should allow me to see a booking', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldShowBookingDetails(booking)
  })

  it('should allow me to move a booking', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    const bedId = 'bedId'
    const bedSummaries = bedSummaryFactory.buildList(5)
    bedSummaries[0].id = bedId
    cy.task('stubBeds', { premisesId: premises.id, bedSummaries })

    const bookingPage = BookingShowPage.visit(premises.id, booking)

    // When I click the move button
    bookingPage.clickMoveBooking()

    // Then I should see the move booking page
    const bed = bedDetailFactory.build({ id: bedId })
    const moveBedPage = MoveBedPage.visit(premises.id, booking.id)

    // And be able to complete the form
    cy.task('stubMoveBooking', { premisesId: premises.id, bookingId: booking.id, bedMove: { notes: 'note', bedId } })
    moveBedPage.completeForm(bed)
    moveBedPage.clickSubmit()

    // Then I should see the Premises details page with a success message
    const premisesPage = Page.verifyOnPage(PremisesShowPage, premises)
    premisesPage.shouldShowMoveConfirmation()
  })

  it('should not show the manage links for non-workflow managers', () => {
    // Given I am signed in as a manager
    signIn(['manager'])

    // When I navigate to the booking's manage page
    const page = BookingShowPage.visit(premises.id, booking)

    // Then I should see the details for that booking
    page.shouldNotShowManageActions()
  })
})
