import type {
  Cas1PremiseCapacity,
  Cas1PremiseCapacityForDay,
  Cas1SpaceBookingCharacteristic,
} from '@approved-premises/api'
import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'
import { occupancySummary } from '../../../server/utils/match'
import {
  DayAvailabilityStatus,
  dayAvailabilityStatus,
  occupancyCriteriaMap,
} from '../../../server/utils/match/occupancy'

export default class OccupancyFilterPage extends Page {
  shouldShowFilters(startDate: string, selectedDuration: string, newCriteria: Array<string>) {
    this.dateInputsShouldContainDate('startDate', startDate)
    this.shouldHaveSelectText('durationDays', selectedDuration)
    newCriteria.forEach(criteria => {
      this.verifyCheckboxByLabel(criteria)
    })
  }

  filterAvailability(
    filters: {
      newStartDate?: string
      newDuration?: string
      newCriteria?: Array<string>
    },
    criteriaFieldName = 'roomCriteria',
  ) {
    if (filters.newStartDate) {
      this.clearAndCompleteDateInputs('startDate', filters.newStartDate)
    }

    if (filters.newDuration) {
      this.getSelectInputByIdAndSelectAnEntry('durationDays', filters.newDuration)
    }
    if (filters.newCriteria) {
      this.uncheckAllCheckboxesByName(criteriaFieldName)
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
      this.shouldShowBanner('Available on:', { exact: false })
      this.shouldShowBanner('Overbooked on:', { exact: false })
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

  shouldShowSelectedCriteria(criteria: Array<Cas1SpaceBookingCharacteristic>) {
    cy.contains('Room criteria:')
      .parent('p')
      .should('contain.text', criteria.map(criterion => occupancyCriteriaMap[criterion]).join(', '))
  }

  shouldShowDateFieldHint(fieldName: string, hint: string) {
    cy.get(`#${fieldName}-hint`).should('contain', hint)
  }
}
