import Page, { PageElement } from '../../../page'
import paths from '../../../../../server/paths/manage'

export default class DepartureDateChangePage extends Page {
  constructor() {
    super('Change departure date')
  }

  static visit(premisesId: string, bookingId: string): DepartureDateChangePage {
    cy.visit(paths.bookings.extensions.new({ premisesId, bookingId }))
    return new DepartureDateChangePage()
  }

  newDepartureDay(): PageElement {
    return cy.get('#newDepartureDate-day')
  }

  newDepartureMonth(): PageElement {
    return cy.get('#newDepartureDate-month')
  }

  newDepartureYear(): PageElement {
    return cy.get('#newDepartureDate-year')
  }

  completeForm(newDepartureDate: string): void {
    this.getLegend('What is the new departure date?')

    const parsedNewDepartureDate = new Date(Date.parse(newDepartureDate))

    this.newDepartureDay().type(parsedNewDepartureDate.getDate().toString())
    this.newDepartureMonth().type(`${parsedNewDepartureDate.getMonth() + 1}`)
    this.newDepartureYear().type(parsedNewDepartureDate.getFullYear().toString())
  }
}
