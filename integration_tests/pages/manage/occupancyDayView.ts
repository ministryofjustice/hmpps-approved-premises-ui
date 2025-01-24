import {
  Cas1OutOfServiceBedSummary,
  Cas1PremisesBasicSummary,
  Cas1PremisesDaySummary,
  Cas1SpaceBookingDaySummary,
} from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import paths from '../../../server/paths/manage'
import { daySummaryRows } from '../../../server/utils/premises/occupancy'
import { laoSummaryName } from '../../../server/utils/personUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../../server/utils/placementCriteriaUtils'

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

  shouldShowDaySummaryDetails(premisesDaySummary: Cas1PremisesDaySummary) {
    this.shouldContainSummaryListItems(daySummaryRows(premisesDaySummary).rows)
  }

  shouldNavigateToDay(linkLabel: string, date: string) {
    cy.contains(linkLabel).click()
    cy.get('h1').contains(DateFormats.isoDateToUIDate(date))
  }

  shouldShowListOfPlacements(placementSummaryList: Array<Cas1SpaceBookingDaySummary>) {
    placementSummaryList.forEach(
      ({ person, canonicalArrivalDate, canonicalDepartureDate, releaseType, essentialCharacteristics }) => {
        cy.get('.govuk-table__body').contains(person.crn).closest('.govuk-table__row').as('row')
        cy.get('@row').contains(laoSummaryName(person))
        cy.get('@row').contains(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' }))
        cy.get('@row').contains(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' }))
        cy.get('@row').contains(releaseType)
        essentialCharacteristics.forEach(characteristic => {
          if (spaceSearchCriteriaApLevelLabels[characteristic])
            cy.get('@row').contains(spaceSearchCriteriaApLevelLabels[characteristic])
        })
      },
    )
  }

  shouldShowListOfOutOfServiceBeds(outOfServiceBedList: Array<Cas1OutOfServiceBedSummary>) {
    outOfServiceBedList.forEach(({ roomName, startDate, endDate, reason, characteristics }) => {
      cy.get('.govuk-table__body').contains(roomName).closest('.govuk-table__row').as('row')
      cy.get('@row').contains(DateFormats.isoDateToUIDate(startDate, { format: 'short' }))
      cy.get('@row').contains(DateFormats.isoDateToUIDate(endDate, { format: 'short' }))
      cy.get('@row').contains(reason.name)
      characteristics.forEach(characteristic => () => {
        if (spaceSearchCriteriaApLevelLabels[characteristic])
          cy.get('@row').contains(spaceSearchCriteriaApLevelLabels[characteristic])
      })
    })
  }
}
