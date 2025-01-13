import { Cas1PremisesBasicSummary, Cas1PremisesDaySummary } from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'
import { daySummaryRows } from '../../../server/utils/premises/occupancy'

export default class OccupancyDayViewPage extends Page {
  constructor(private pageTitle: string) {
    super(pageTitle)
  }

  static visit(premises: Cas1PremisesBasicSummary, date: string): OccupancyDayViewPage {
    cy.visit(paths.premises.occupancy.day({ premisesId: premises.id, date }))
    return new OccupancyDayViewPage(DateFormats.isoDateToUIDate(date))
  }

  shouldShowDaySummaryDetails(premisesDaySummary: Cas1PremisesDaySummary) {
    this.shouldContainSummaryListItems(daySummaryRows(premisesDaySummary).rows)
  }

  shouldNavigateToDay(linkLabel: string, date: string) {
    cy.contains(linkLabel).click()
    cy.get('h1').contains(DateFormats.isoDateToUIDate(date))
  }

  static visitUnauthorised(premises: Cas1PremisesBasicSummary, date: string): OccupancyDayViewPage {
    cy.visit(paths.premises.occupancy.day({ premisesId: premises.id, date }), {
      failOnStatusCode: false,
    })
    return new OccupancyDayViewPage(`Authorisation Error`)
  }
}
