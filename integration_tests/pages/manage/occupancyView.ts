import type { Cas1PremiseCapacity, Cas1Premises } from '@approved-premises/api'
import Page from '../page'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'
import { dayStatusFromDayCapacity } from '../../../server/utils/premises/occupancy'

export default class OccupancyViewPage extends Page {
  constructor(private pageTitle: string) {
    super(pageTitle)
  }

  static visit(premises: Cas1Premises): OccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }))
    return new OccupancyViewPage(`View spaces in ${premises.name}`)
  }

  static visitUnauthorised(premises: Cas1Premises): OccupancyViewPage {
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
        const { bookingCount, availableBedCount, date } = premisesCapacity.capacity[index]
        const dayStatus = dayStatusFromDayCapacity(premisesCapacity.capacity[index])
        const expectedClass = { overbooked: 'govuk-tag--red', full: 'govuk-tag--yellow', available: '' }[dayStatus]
        cy.wrap(day).within(() => {
          cy.contains(`${bookingCount} booked`)
          cy.contains(`${availableBedCount - bookingCount} available`)
          cy.contains(DateFormats.isoDateToUIDate(date, { format: 'longNoYear' }))
        })
        if (expectedClass) cy.wrap(day).should('have.class', expectedClass)
      })
  }
}
