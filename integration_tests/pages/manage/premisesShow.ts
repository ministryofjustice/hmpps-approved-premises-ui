import type { Booking, ExtendedPremisesSummary, FullPerson, PremisesBooking } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class PremisesShowPage extends Page {
  constructor(private readonly premises: ExtendedPremisesSummary) {
    super(premises.name)
  }

  static visit(premises: ExtendedPremisesSummary, { v2 } = { v2: false }): PremisesShowPage {
    cy.visit(
      v2 ? paths.v2Manage.premises.show({ premisesId: premises.id }) : paths.premises.show({ premisesId: premises.id }),
    )
    return new PremisesShowPage(premises)
  }

  clickViewCalendar() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('View calendar').click()
  }

  shouldShowPremisesDetail(): void {
    cy.get('.govuk-summary-list__key')
      .contains('Code')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.apCode)

    cy.get('.govuk-summary-list__key')
      .contains('Postcode')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.postcode)

    cy.get('.govuk-summary-list__key')
      .contains('Number of Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.bedCount)

    cy.get('.govuk-summary-list__key')
      .contains('Available Beds')
      .siblings('.govuk-summary-list__value')
      .should('contain', this.premises.availableBedsForToday)
  }

  shouldShowBookings(
    bookingsArrivingToday: Array<PremisesBooking>,
    bookingsLeavingToday: Array<PremisesBooking>,
    bookingsArrivingSoon: Array<PremisesBooking>,
    bookingsLeavingSoon: Array<PremisesBooking>,
  ): void {
    cy.get('a').contains('Arriving Today').click()
    this.tableShouldContainBookings(bookingsArrivingToday, 'arrival')

    cy.get('a').contains('Departing Today').click()
    this.tableShouldContainBookings(bookingsLeavingToday, 'departure')

    cy.get('a').contains('Upcoming Arrivals').click()
    this.tableShouldContainBookings(bookingsArrivingSoon, 'arrival')

    cy.get('a').contains('Upcoming Departures').click()
    this.tableShouldContainBookings(bookingsLeavingSoon, 'departure')
  }

  private tableShouldContainBookings(bookings: Array<PremisesBooking>, type: 'arrival' | 'departure') {
    bookings.forEach((item: Booking) => {
      const date = type === 'arrival' ? item.arrivalDate : item.departureDate
      cy.contains((item.person as FullPerson).name)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.person.crn)
          cy.get('td').eq(1).contains(DateFormats.isoDateToUIDate(date))
          cy.get('td')
            .eq(2)
            .contains(item.bed?.name ? item.bed.name : 'Not allocated')
          cy.get('td')
            .eq(3)
            .contains('Manage')
            .should('have.attr', 'href', paths.bookings.show({ premisesId: this.premises.id, bookingId: item.id }))
        })
    })
  }

  shouldShowCurrentResidents(currentResidents: Array<PremisesBooking>) {
    cy.get('h2').should('contain', 'Current residents')
    currentResidents.forEach((item: Booking) => {
      cy.contains((item.person as FullPerson).name)
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.person.crn)
          cy.get('td').eq(1).contains(DateFormats.isoDateToUIDate(item.departureDate))
          cy.get('td')
            .eq(2)
            .contains(item.bed?.name ? item.bed.name : 'Not allocated')
          cy.get('td')
            .eq(3)
            .contains('Manage')
            .should('have.attr', 'href', paths.bookings.show({ premisesId: this.premises.id, bookingId: item.id }))
        })
    })
  }

  shouldShowOvercapacityMessage(overcapacityStartDate: string, overcapacityEndDate: string) {
    this.shouldShowBanner(
      `The premises is over capacity for the period ${DateFormats.isoDateToUIDate(
        overcapacityStartDate,
      )} to ${DateFormats.isoDateToUIDate(overcapacityEndDate)}`,
    )
  }

  clickManageBooking(booking: PremisesBooking) {
    cy.get(`[data-cy-booking-id="${booking.id}"]`).click()
  }

  shouldShowMoveConfirmation() {
    this.shouldShowBanner('Bed move logged')
  }
}
