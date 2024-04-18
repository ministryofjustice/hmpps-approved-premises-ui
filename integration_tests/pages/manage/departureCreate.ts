import type { Booking, Departure, FullPerson } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class DepartureCreatePage extends Page {
  constructor(
    private readonly premisesId: string,
    private readonly bookingId: string,
  ) {
    super('Log a departure')
  }

  static visit(premisesId: string, bookingId: string): DepartureCreatePage {
    cy.visit(paths.bookings.departures.new({ premisesId, bookingId }))

    return new DepartureCreatePage(premisesId, bookingId)
  }

  public verifySummary(booking: Booking): void {
    this.assertDefinition('Name', (booking.person as FullPerson).name)
    this.assertDefinition('CRN', booking.person.crn)
  }

  public completeForm(departure: Departure): void {
    const dateTime = new Date(Date.parse(departure.dateTime))
    const minutes = dateTime.getMinutes()
    const hours = dateTime.getHours()

    cy.get('input[name="dateTime-day"]').clear()
    cy.get('input[name="dateTime-day"]').type(String(dateTime.getDate()))
    cy.get('input[name="dateTime-month"]').clear()
    cy.get('input[name="dateTime-month"]').type(String(dateTime.getMonth() + 1))
    cy.get('input[name="dateTime-year"]').clear()
    cy.get('input[name="dateTime-year"]').type(String(dateTime.getFullYear()))
    cy.get('input[name="dateTime-time"]').type(`${hours}:${minutes}`)

    cy.get(`input[name="departure[reasonId]"][value="${departure.reason.id}"]`).check()

    cy.get(`input[name="departure[moveOnCategoryId]"][value="${departure.moveOnCategory.id}"]`).check()

    cy.get(`input[name="departure[destinationProviderId]"][value="${departure.destinationProvider.id}"]`).check()

    cy.get('textarea[name="departure[notes]"]').type(departure.notes)
    this.clickSubmit()
  }
}
