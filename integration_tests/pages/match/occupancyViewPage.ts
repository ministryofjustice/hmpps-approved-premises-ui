import {
  ApType,
  Cas1PremiseCapacity,
  Cas1PremisesSummary,
  Cas1SpaceBookingCharacteristic,
  PlacementRequestDetail,
} from '@approved-premises/api'
import Page from '../page'
import { occupancySummary, occupancyViewSummaryListForMatchingDetails } from '../../../server/utils/match'
import { createQueryString } from '../../../server/utils/utils'
import paths from '../../../server/paths/match'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'

export default class OccupancyViewPage extends Page {
  constructor(premisesName: string) {
    super(`View spaces in ${premisesName}`)
  }

  static visit(placementRequest: PlacementRequestDetail, premises: Cas1PremisesSummary, apType: ApType) {
    const path = `${paths.v2Match.placementRequests.search.occupancy({
      id: placementRequest.id,
      premisesId: premises.id,
    })}?${createQueryString({ apType })}`

    cy.visit(path)

    return new OccupancyViewPage(premises.name)
  }

  shouldShowMatchingDetails(
    totalCapacity: number,
    startDate: string,
    durationDays: number,
    placementRequest: PlacementRequestDetail,
    managerDetails: string,
  ) {
    cy.get('.govuk-details').within(() => {
      this.shouldContainSummaryListItems(
        occupancyViewSummaryListForMatchingDetails(totalCapacity, placementRequest, managerDetails),
      )
    })
    cy.get('.govuk-heading-l')
      .contains(
        `View availability for ${DateFormats.formatDuration(daysToWeeksAndDays(durationDays))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`,
      )
      .should('exist')
  }

  shouldShowFilters(startDate: string, selectedDuration: string, newCriteria: Array<string>) {
    this.dateInputsShouldContainDate('startDate', startDate)
    this.shouldHaveSelectText('durationDays', selectedDuration)
    newCriteria.forEach(criteria => {
      this.verifyCheckboxByLabel(criteria)
    })
  }

  filterAvailability(newStartDate: string, newDuration?: string, newCriteria?: Array<string>) {
    this.clearAndCompleteDateInputs('startDate', newStartDate)
    if (newDuration) {
      this.getSelectInputByIdAndSelectAnEntry('durationDays', newDuration)
    }
    if (newCriteria) {
      newCriteria.forEach(criteria => {
        this.checkCheckboxByLabel(criteria)
      })
    }
    this.clickApplyFilter()
  }

  shouldShowOccupancySummary(
    premiseCapacity: Cas1PremiseCapacity,
    criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ) {
    const summary = occupancySummary(premiseCapacity.capacity, criteria)

    if (!summary.overbooked) {
      this.shouldShowBanner('The placement dates you have selected are available.')
    } else if (!summary.available) {
      this.shouldShowBanner('There are no spaces available for the dates you have selected.')
    } else {
      this.shouldShowBanner('Available on:')
      this.shouldShowBanner('Overbooked on:')
    }
  }

  shouldShowCalendarCell(copy: string | RegExp) {
    cy.get('.calendar__availability').contains(copy).should('exist')
  }

  shouldShowOccupancyCalendar(
    premiseCapacity: Cas1PremiseCapacity,
    criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ) {
    const firstMonth = DateFormats.isoDateToMonthAndYear(premiseCapacity.startDate)
    cy.get('.govuk-heading-m').contains(firstMonth).should('exist')

    const summary = occupancySummary(premiseCapacity.capacity, criteria)
    if (summary.available) {
      this.shouldShowCalendarCell('Available')
    }
    if (summary.overbooked) {
      this.shouldShowCalendarCell(/-?\d+ in total/)
    }
  }

  shouldFillBookYourPlacementFormDates(arrivalDate: string, departureDate: string) {
    this.completeDateInputs('arrivalDate', arrivalDate)
    this.completeDateInputs('departureDate', departureDate)
  }

  shouldShowErrorSummaryAndErrorMessage(message: string): void {
    cy.get('.govuk-error-summary').should('contain', message)
    cy.get(`.govuk-error-message`).should('contain', message)
  }
}
