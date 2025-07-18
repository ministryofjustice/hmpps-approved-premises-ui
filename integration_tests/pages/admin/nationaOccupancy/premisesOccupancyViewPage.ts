import type { Cas1PremiseCapacity, Cas1Premises, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import paths from '../../../../server/paths/manage'
import { dayAvailabilityCount, dayAvailabilityStatus } from '../../../../server/utils/match/occupancy'

export default class PremisesOccupancyViewPage extends Page {
  constructor(title: string) {
    super(title)
  }

  static visit(premises: Cas1Premises): PremisesOccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }))
    return new PremisesOccupancyViewPage(`View spaces in ${premises.name}`)
  }

  static visitUnauthorised(premises: Cas1Premises): PremisesOccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }), {
      failOnStatusCode: false,
    })
    return new PremisesOccupancyViewPage(`Authorisation Error`)
  }

  shouldSeeValidationErrors() {
    this.shouldShowErrorMessagesForFields(['arrivalDate'], {
      arrivalDate: 'Enter a valid arrival date',
    })
  }

  shouldShowCalendarKey(): void {
    cy.get('#calendar-key').within(() => {
      cy.contains('Available')
      cy.contains('Full or overbooked')
    })
  }

  shouldShowCalendar(
    premisesCapacity: Cas1PremiseCapacity,
    criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ): void {
    cy.get('#calendar').find('li').should('have.length', premisesCapacity.capacity.length)
    cy.get('#calendar')
      .find('li')
      .each((day, index) => {
        const capacity = premisesCapacity.capacity[index]
        const { availableBedCount, date } = capacity
        const bookableCount = dayAvailabilityCount(capacity, criteria)
        const dayStatus = dayAvailabilityStatus(capacity, criteria)
        const expectedClass = { overbooked: 'govuk-tag--red', full: 'govuk-tag--red', available: 'govuk-tag--green' }[
          dayStatus
        ]
        cy.wrap(day).within(() => {
          cy.contains(criteria.length ? `${bookableCount}` : `${bookableCount}/${availableBedCount}`)
          cy.contains(DateFormats.isoDateToUIDate(date, { format: 'longNoYear' }))
        })
        cy.wrap(day).should('have.class', expectedClass)
      })
  }

  shouldBePopululatedWith({ durationText, arrivalDate }: { durationText: string; arrivalDate: string }) {
    cy.get('.search-and-filter').within(() => {
      this.verifyTextInputContentsById('arrivalDate', arrivalDate)
      this.shouldHaveSelectText('durationDays', durationText)
    })
  }
}
