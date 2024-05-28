import Page from '../../../page'
import paths from '../../../../../server/paths/manage'
import { Booking, Premises } from '../../../../../server/@types/shared'

export default class NewDateChange extends Page {
  constructor(
    public readonly premisesId: Premises['id'],
    public readonly bookingId: Booking['id'],
  ) {
    super('Update placement dates')
  }

  static visit(premisesId: Premises['id'], bookingId: Booking['id'], { v2 } = { v2: false }): NewDateChange {
    cy.visit(
      v2
        ? paths.v2Manage.bookings.dateChanges.new({ premisesId, bookingId })
        : paths.bookings.dateChanges.new({ premisesId, bookingId }),
    )
    return new NewDateChange(premisesId, bookingId)
  }

  completeForm(newArrivalDate: string, newDepartureDate: string): void {
    const arrivalDate = new Date(Date.parse(newArrivalDate))
    const departureDate = new Date(Date.parse(newDepartureDate))

    this.checkDatesToChangeOption('newArrivalDate')

    cy.get('#newArrivalDate-day').type(arrivalDate.getDate().toString())
    cy.get('#newArrivalDate-month').type(`${arrivalDate.getMonth() + 1}`)
    cy.get('#newArrivalDate-year').type(arrivalDate.getFullYear().toString())

    this.checkDatesToChangeOption('newDepartureDate')

    cy.get('#newDepartureDate-day').type(departureDate.getDate().toString())
    cy.get('#newDepartureDate-month').type(`${departureDate.getMonth() + 1}`)
    cy.get('#newDepartureDate-year').type(departureDate.getFullYear().toString())
  }

  checkDatesToChangeOption(option: 'newArrivalDate' | 'newDepartureDate'): void {
    cy.get(`input[name="datesToChange[]"][value="${option}"]`).click()
  }

  shouldHaveCorrectBacklink(): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', paths.bookings.show({ premisesId: this.premisesId, bookingId: this.bookingId }))
  }
}
