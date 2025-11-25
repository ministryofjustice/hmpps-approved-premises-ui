import {
  Cas1OutOfServiceBedSummary,
  Cas1PremiseCapacityForDay,
  Cas1PremisesBasicSummary,
  Cas1SpaceBookingSummary,
} from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'
import { daySummaryRows } from '../../../server/utils/premises/occupancy'
import { displayName } from '../../../server/utils/personUtils'

import { spaceSearchCriteriaApLevelLabels } from '../../../server/utils/match/spaceSearchLabels'
import { canonicalDates } from '../../../server/utils/placements'
import { filterRoomLevelCriteria } from '../../../server/utils/match/spaceSearch'

export default class OccupancyDayViewPage extends Page {
  constructor(private pageTitle: string) {
    super(pageTitle)
  }

  static visit(premises: Cas1PremisesBasicSummary, date: string): OccupancyDayViewPage {
    cy.visit(paths.premises.occupancy.day({ premisesId: premises.id, date }))
    return new OccupancyDayViewPage(DateFormats.isoDateToUIDate(date))
  }

  static visitUnauthorised(premises: Cas1PremisesBasicSummary, date: string): OccupancyDayViewPage {
    cy.visit(paths.premises.occupancy.day({ premisesId: premises.id, date }), {
      failOnStatusCode: false,
    })
    return new OccupancyDayViewPage(`Authorisation Error`)
  }

  shouldShowDaySummaryDetails(premisesDayCapacity: Cas1PremiseCapacityForDay) {
    this.shouldContainSummaryListItems(daySummaryRows(premisesDayCapacity).rows)
  }

  shouldNavigateToDay(linkLabel: string, date: string) {
    cy.contains(linkLabel).click()
    cy.get('h1').contains(DateFormats.isoDateToUIDate(date))
  }

  shouldShowListOfPlacements(placementSummaryList: Array<Cas1SpaceBookingSummary>) {
    placementSummaryList.forEach(spaceBookingSummary => {
      const { person, characteristics } = spaceBookingSummary
      const { arrivalDate, departureDate } = canonicalDates(spaceBookingSummary)
      cy.get('.govuk-table__body').contains(person.crn).closest('.govuk-table__row').as('row')
      cy.get('@row').contains(displayName(person))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(departureDate, { format: 'short' }))
      filterRoomLevelCriteria(characteristics).forEach(characteristic => {
        if (spaceSearchCriteriaApLevelLabels[characteristic])
          cy.get('@row').contains(spaceSearchCriteriaApLevelLabels[characteristic])
      })
    })
  }

  shouldShowListOfOutOfServiceBeds(outOfServiceBedList: Array<Cas1OutOfServiceBedSummary>) {
    outOfServiceBedList.forEach(({ roomName, startDate, endDate, reason, characteristics }) => {
      cy.get('.govuk-table__body').contains(roomName).closest('.govuk-table__row').as('row')
      cy.get('@row').contains(DateFormats.isoDateToUIDate(startDate, { format: 'short' }))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(endDate, { format: 'short' }))
      cy.get('@row').contains(reason.name)
      filterRoomLevelCriteria(characteristics).forEach(characteristic => () => {
        if (spaceSearchCriteriaApLevelLabels[characteristic])
          cy.get('@row').contains(spaceSearchCriteriaApLevelLabels[characteristic])
      })
    })
  }
}
