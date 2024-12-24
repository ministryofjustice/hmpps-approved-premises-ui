import type { Cas1PremiseCapacity, Cas1PremisesSummary } from '@approved-premises/api'
import Page from '../page'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'

export default class OccupancyViewPage extends Page {
  constructor(private pageTitle: string) {
    super(pageTitle)
  }

  static visit(premises: Cas1PremisesSummary): OccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }))
    return new OccupancyViewPage(`View spaces in ${premises.name}`)
  }

  static visitUnauthorised(premises: Cas1PremisesSummary): OccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }), {
      failOnStatusCode: false,
    })
    return new OccupancyViewPage(`Authorisation Error`)
  }

  shouldShowCalendarHeading(startDate: string, durationDays: number): void {
    const calendarTitle = `Showing ${DateFormats.formatDuration(daysToWeeksAndDays(String(durationDays)))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`
    cy.contains(calendarTitle)
  }

  shouldShowCalendar(premisesCapacity: Cas1PremiseCapacity): void {
    cy.get('#calendar-key').within(() => {
      cy.contains('Available')
      cy.contains('Full')
      cy.contains('Overbooked')
    })
    cy.get('#calendar').find('li').should('have.length', premisesCapacity.capacity.length)
    cy.get('#calendar')
      .find('li')
      .each((day, index) => {
        const dayCapacity = premisesCapacity.capacity[index]
        const expectedClass = { '-1': 'govuk-tag--red', '0': 'govuk-tag--yellow', '1': '' }[
          String(Math.sign(dayCapacity.availableBedCount - dayCapacity.bookingCount))
        ]
        cy.wrap(day).within(() => {
          cy.contains(`${dayCapacity.bookingCount} booked`)
          cy.contains(`${dayCapacity.availableBedCount - dayCapacity.bookingCount} available`)
          cy.contains(DateFormats.isoDateToUIDate(dayCapacity.date, { format: 'longNoYear' }))
        })
        if (expectedClass) cy.wrap(day).should('have.class', expectedClass)
      })
  }
}
