import type { Cas1Premises } from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'

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
    const calendarTitle = `Showing ${DateFormats.formatDuration(durationDays)} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`
    cy.contains(calendarTitle)
  }
}
