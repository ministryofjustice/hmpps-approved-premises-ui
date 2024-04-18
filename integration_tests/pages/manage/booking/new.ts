import type { ActiveOffence, Booking, FullPerson, LostBed } from '@approved-premises/api'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictErrorComponent'
import Page, { PageElement } from '../../page'
import paths from '../../../../server/paths/manage'

export default class BookingNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(premisesId: string) {
    super('Create a placement')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premisesId, 'booking')
  }

  static visit(premisesId: string): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId }))

    return new BookingNewPage(premisesId)
  }

  verifyPersonIsVisible(person: FullPerson): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
    })
  }

  shouldShowOffences(offences: Array<ActiveOffence>): void {
    offences.forEach((offence: ActiveOffence) => {
      cy.get(`input[name="eventNumber"][value="${offence.deliusEventNumber}"]`).should('exist')
    })
  }

  arrivalDay(): PageElement {
    return cy.get('#arrivalDate-day')
  }

  arrivalMonth(): PageElement {
    return cy.get('#arrivalDate-month')
  }

  arrivalYear(): PageElement {
    return cy.get('#arrivalDate-year')
  }

  expectedDepartureDay(): PageElement {
    return cy.get('#departureDate-day')
  }

  expectedDepartureMonth(): PageElement {
    return cy.get('#departureDate-month')
  }

  expectedDepartureYear(): PageElement {
    return cy.get('#departureDate-year')
  }

  completeForm(booking: Booking, offence?: ActiveOffence): void {
    if (offence != null) {
      this.selectOffence(offence)
    }
    this.getLegend('What is their expected arrival date?')

    const arrivalDate = new Date(Date.parse(booking.arrivalDate))

    this.arrivalDay().type(arrivalDate.getDate().toString())
    this.arrivalMonth().type(`${arrivalDate.getMonth() + 1}`)
    this.arrivalYear().type(arrivalDate.getFullYear().toString())

    this.getLegend('What is their expected departure date?')

    const departureDate = new Date(Date.parse(booking.departureDate))

    this.expectedDepartureDay().type(departureDate.getDate().toString())
    this.expectedDepartureMonth().type(`${departureDate.getMonth() + 1}`)
    this.expectedDepartureYear().type(departureDate.getFullYear().toString())
  }

  selectOffence(offence: ActiveOffence): void {
    cy.get(`input[name="eventNumber"][value="${offence.deliusEventNumber}"]`).click()
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['arrivalDate', 'departureDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }
}
