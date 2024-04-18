import type { Arrival } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class ArrivalCreatePage extends Page {
  constructor(
    private readonly premisesId: string,
    private readonly bookingId: string,
  ) {
    super('Mark the person as arrived')
  }

  static visit(premisesId: string, bookingId: string): ArrivalCreatePage {
    cy.visit(paths.bookings.arrivals.new({ premisesId, bookingId }))
    return new ArrivalCreatePage(premisesId, bookingId)
  }

  public completeArrivalForm(arrival: Arrival, staffMemberCode: string): void {
    const arrivalDate = new Date(Date.parse(arrival.arrivalDate))
    const expectedDeparture = new Date(Date.parse(arrival.expectedDepartureDate))

    cy.get('input[name="arrivalDateTime-day"]').clear()
    cy.get('input[name="arrivalDateTime-day"]').type(String(arrivalDate.getDate()))
    cy.get('input[name="arrivalDateTime-month"]').clear()
    cy.get('input[name="arrivalDateTime-month"]').type(String(arrivalDate.getMonth() + 1))
    cy.get('input[name="arrivalDateTime-year"]').clear()
    cy.get('input[name="arrivalDateTime-year"]').type(String(arrivalDate.getFullYear()))
    cy.get('input[name="arrivalDateTime-time"]').type(arrival.arrivalTime)

    cy.get('input[name="expectedDepartureDate-day"]').type(String(expectedDeparture.getDate()))
    cy.get('input[name="expectedDepartureDate-month"]').type(String(expectedDeparture.getMonth() + 1))
    cy.get('input[name="expectedDepartureDate-year"]').type(String(expectedDeparture.getFullYear()))

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorkerStaffCode', staffMemberCode)

    cy.get('[name="arrival[notes]"]').type(arrival.notes)
    cy.get('[name="arrival[submit]"]').click()
  }

  public submitArrivalFormWithoutFields(): void {
    cy.get('[name="arrival[submit]"]').click()
  }
}
