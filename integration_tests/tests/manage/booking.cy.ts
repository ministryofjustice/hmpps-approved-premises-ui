import {
  activeOffenceFactory,
  applicationFactory,
  assessmentFactory,
  bedDetailFactory,
  bedSummaryFactory,
  bookingFactory,
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  personFactory,
  premisesBookingFactory,
  restrictedPersonFactory,
} from '../../../server/testutils/factories'

import { BookingFindPage, BookingNewPage, BookingShowPage, PremisesShowPage } from '../../pages/manage'
import Page from '../../pages/page'

import BookingConfirmation from '../../pages/manage/booking/confirmation'
import MoveBedPage from '../../pages/manage/bed/moveBed'
import { signIn } from '../signIn'
import { NoOffencePage } from '../../pages/apply'

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
  const offences = activeOffenceFactory.buildList(1)

  beforeEach(() => {
    cy.task('reset')
    // Given a booking is available
    cy.task('stubBookingGet', { premisesId: premises.id, booking })
    cy.task('stubApplicationGet', { application })
    cy.task('stubAssessment', assessment)
    cy.task('stubPremisesSummary', premises)
    cy.task('stubPersonOffences', { person, offences })
  })

  it('should shown an error if I search for an LAO', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])
    const lao = restrictedPersonFactory.build()
    cy.task('stubFindPerson', { person: lao })
    cy.task('stubPersonOffences', { person: lao, offences })

    // And I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id)

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
    const bookingNewPage = BookingFindPage.visit(premises.id)

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
      expect(requestBody.eventNumber).equal(offences[0].deliusEventNumber)
    })
  })

  it('should allow me to select an index offence if there is more than one', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    const multipleOffences = activeOffenceFactory.buildList(3)

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubPremisesSummary', premises)
    cy.task('stubFindPerson', { person })
    cy.task('stubPersonOffences', { person, offences: multipleOffences })

    // Given I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id)

    // When I enter the CRN to the form
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()

    // Then I should be redirected to the second new booking page
    Page.verifyOnPage(BookingNewPage)
    const bookingCreatePage = new BookingNewPage(premises.id)
    bookingCreatePage.verifyPersonIsVisible(person)

    // And the index offence radio buttons should be visible
    bookingCreatePage.shouldShowOffences(multipleOffences)

    // Given I have entered a CRN and the person has been found
    // When I fill in the booking form
    bookingCreatePage.completeForm(booking)
    bookingCreatePage.selectOffence(multipleOffences[1])
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
      expect(requestBody.eventNumber).equal(multipleOffences[1].deliusEventNumber)
    })
  })

  it('should show errors for the find page and the new booking page', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    // Given I visit the find page
    const page = BookingFindPage.visit(premises.id)

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

  it('should show an error when there are multiple offences and one is not selected', () => {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    const multipleOffences = activeOffenceFactory.buildList(3)

    cy.task('stubFindPerson', { premisesId: premises.id, person })
    cy.task('stubPersonOffences', { person, offences: multipleOffences })

    // Given I visit the find page
    const page = BookingFindPage.visit(premises.id)

    // And I enter the CRN
    page.completeForm(person.crn)

    // Given I am signed in and I have found someone to create a placement for by CRN
    // When I visit the new booking page
    const bookingCreatePage = new BookingNewPage(premises.id)

    // And I miss the required fields
    cy.task('stubBookingErrors', {
      premisesId: premises.id,
      params: ['eventNumber'],
    })
    bookingCreatePage.completeForm(booking)
    bookingCreatePage.clickSubmit()

    // Then I should see error messages relating to the event number
    page.shouldShowErrorMessagesForFields(['eventNumber'])
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

  it('redirects to no offence page if there are no offence', function test() {
    // Given I am signed in as a workflow manager
    signIn(['workflow_manager'])

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubPremisesSummary', premises)
    cy.task('stubFindPerson', { person })
    // person has no offences
    const noOffences = activeOffenceFactory.buildList(0)
    cy.task('stubPersonOffences', { person, noOffences })

    // Given I visit the first new booking page
    const bookingNewPage = BookingFindPage.visit(premises.id)

    // When I enter the CRN to the form
    bookingNewPage.enterCrn(person.crn)
    bookingNewPage.clickSubmit()

    // Then I should see a screen telling me they have no offences
    const noOffencePage = Page.verifyOnPage(NoOffencePage)
    noOffencePage.shouldShowParagraphText('a placement in an Approved Premises,')
    noOffencePage.confirmLinkText('Approved Premises')
  })
})
