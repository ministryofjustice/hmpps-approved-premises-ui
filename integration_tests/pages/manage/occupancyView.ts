import type { Cas1PremisesSummary } from '@approved-premises/api'
import Page from '../page'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'

export default class OccupancyViewPage extends Page {
  constructor(private readonly premises: Cas1PremisesSummary) {
    super(`View spaces in ${premises.name}`)
  }

  static visit(premises: Cas1PremisesSummary): OccupancyViewPage {
    cy.visit(paths.premises.occupancy.view({ premisesId: premises.id }))
    return new OccupancyViewPage(premises)
  }

  shouldShowCalendarHeading(startDate: string, durationDays: number): void {
    const calendarTitle = `Showing ${DateFormats.formatDuration(daysToWeeksAndDays(String(durationDays)))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`
    cy.contains(calendarTitle)
  }
}
