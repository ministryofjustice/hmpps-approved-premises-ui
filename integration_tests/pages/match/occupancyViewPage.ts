import type {
  Cas1PremiseCapacity,
  Cas1PremiseCapacityForDay,
  Cas1Premises,
  Cas1SpaceBookingCharacteristic,
  PlacementRequestDetail,
} from '@approved-premises/api'
import Page from '../page'
import { occupancySummary } from '../../../server/utils/match'
import paths from '../../../server/paths/match'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import { placementRequestSummaryList } from '../../../server/utils/placementRequests/placementRequestSummaryList'
import { DayAvailabilityStatus, dayAvailabilityStatus } from '../../../server/utils/match/occupancy'

export default class OccupancyViewPage extends Page {
  constructor(premisesName: string) {
    super(`View spaces in ${premisesName}`)
  }

  static visit(placementRequest: PlacementRequestDetail, premises: Cas1Premises) {
    const path = paths.v2Match.placementRequests.search.occupancy({ id: placementRequest.id, premisesId: premises.id })

    cy.visit(path)

    return new OccupancyViewPage(premises.name)
  }

  shouldShowMatchingDetails(startDate: string, durationDays: number, placementRequest: PlacementRequestDetail) {
    cy.get('.govuk-details').within(() => {
      cy.get('.govuk-details__summary').should('contain.text', 'Placement request information')
      this.shouldContainSummaryListItems(placementRequestSummaryList(placementRequest, { showActions: false }).rows)
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

  filterAvailability(filters: { newStartDate?: string; newDuration?: string; newCriteria?: Array<string> }) {
    if (filters.newStartDate) {
      this.clearAndCompleteDateInputs('startDate', filters.newStartDate)
    }

    if (filters.newDuration) {
      this.getSelectInputByIdAndSelectAnEntry('durationDays', filters.newDuration)
    }
    if (filters.newCriteria) {
      this.uncheckAllCheckboxesByName('roomCriteria')
      filters.newCriteria.forEach(criteria => {
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
      // This matches cells that have the following text:
      // - 'Available'; or
      // - a positive number followed by ' for your criteria'
      this.shouldShowCalendarCell(/Available|(?<!-)[1-9]\d? for your criteria/)
    }
    if (summary.overbooked) {
      this.shouldShowCalendarCell(/-?\d+ in total/)
    }
  }

  completeForm(arrivalDate: string, departureDate: string) {
    this.completeDateInputs('arrivalDate', arrivalDate)
    this.completeDateInputs('departureDate', departureDate)
  }

  shouldShowErrorSummaryAndErrorMessage(message: string): void {
    cy.get('.govuk-error-summary').should('contain', message)
    cy.get(`.govuk-error-message`).should('contain', message)
  }

  getOccupancyForDate(date: Date, capacity: Cas1PremiseCapacity): Cas1PremiseCapacityForDay {
    return capacity.capacity.find(day => day.date === DateFormats.dateObjToIsoDate(date))
  }

  clickCalendarDay(date: string) {
    const calendarDate = DateFormats.isoDateToUIDate(date, { format: 'longNoYear' })

    cy.get('.calendar__day').contains(calendarDate).click()
  }

  getDatesForEachAvailabilityStatus(
    premiseCapacity: Cas1PremiseCapacity,
    criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ): Array<Date> {
    const dates: Record<DayAvailabilityStatus, Date> = premiseCapacity.capacity.reduce(
      (statuses, day) => {
        const status = dayAvailabilityStatus(day, criteria)

        return {
          ...statuses,
          [status]: DateFormats.isoToDateObj(day.date),
        }
      },
      {
        available: undefined,
        availableForCriteria: undefined,
        overbooked: undefined,
      },
    )

    return Object.values(dates).filter(Boolean)
  }
}
